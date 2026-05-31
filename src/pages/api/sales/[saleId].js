/**
 * API-01 fix: GET /api/sales/[saleId]  →  fetch a single sale
 *             PATCH /api/sales/[saleId] →  update a sale
 *
 * The original code overloaded POST /api/sales with action=getOne and action=update,
 * which is the "RPC over POST" antipattern.  Moving these to a [saleId].js route
 * gives us proper REST semantics, enables browser/CDN caching on GETs, and makes
 * the API predictable.
 *
 * The old POST action=getOne / action=update branches are kept in sales/index.js for
 * backward-compatibility but will be removed once all frontend call-sites are updated.
 */

import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middlewares/withAuth';

async function handler(req, res) {
  const { saleId } = req.query;
  const id = parseInt(saleId, 10);

  if (!id || isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid sale ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetSale(req, res, id);
    case 'PATCH':
      return handleUpdateSale(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}

async function handleGetSale(req, res, id) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      SaleItem: { include: { Product: true } },
      Cashier: { include: { User: true } },
      Inventory: true,
    },
  });

  if (!sale) {
    return res.status(404).json({ success: false, error: 'Sale not found' });
  }

  return res.json({ success: true, data: sale });
}

async function handleUpdateSale(req, res, id) {
  const { cashierId, inventoryId, items, discount, netPayable, paymentMode, note } = req.body;

  if (!cashierId || !inventoryId || !items?.length) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const existingSale = await prisma.sale.findUnique({
      where: { id },
      include: { SaleItem: true },
    });

    if (!existingSale) {
      return res.status(404).json({ success: false, error: 'Sale not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({ where: { saleId: id } });

      // Snapshot purchasePrice at update time
      const productIds = items.map((item) => item.product.id);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, purchasePrice: true },
      });
      const purchasePriceMap = Object.fromEntries(
        products.map((p) => [p.id, p.purchasePrice])
      );

      await tx.saleItem.createMany({
        data: items.map((item) => ({
          saleId: id,
          productId: item.product.id,
          quantity: Number(item.quantity),
          price: Number(item.price),
          purchasePrice: purchasePriceMap[item.product.id] ?? null,
        })),
      });

      return tx.sale.update({
        where: { id },
        data: {
          discount: Number(discount) || 0,
          totalAmount: Number(netPayable) || 0,
          paymentMode: paymentMode || 'cash',
          note: note || null,
        },
        include: {
          SaleItem: { include: { Product: true } },
          Cashier: { include: { User: true } },
          Inventory: true,
        },
      });
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error updating sale:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withAuth(handler);
