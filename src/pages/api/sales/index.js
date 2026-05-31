import prisma from '@/lib/prisma';
import { calculateSaleProfit } from '@/utils/profit';
import { withAuth } from '@/lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetSales(req, res);

      case 'POST':
        if (req.body?.action === 'getOne') {
          return await handleGetSale(req, res);
        }
        if (req.body?.action === 'update') {
          return await handleUpdateSale(req, res);
        }
        return await handleAddSale(req, res);

      case 'DELETE':
        return await handleDeleteSale(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Sales API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET – Fetch all sales (optional filters)
 */
async function handleGetSales(req, res) {
  const { inventoryId, cashierId, from, to, showAll, page, pageSize } = req.query;
  const take = pageSize ? Math.min(parseInt(pageSize, 10), 200) : 50;
  const skip = page ? Math.max(parseInt(page, 10) - 1, 0) * take : 0;

  const fromDate = from ? new Date(from) : new Date();
  fromDate.setHours(0, 0, 0, 0);

  const toDate = to ? new Date(to) : new Date();
  toDate.setHours(23, 59, 59, 999);
  const sales = await prisma.sale.findMany({
    where: {
      inventoryId: inventoryId ? Number(inventoryId) : undefined,
      cashierId: cashierId ? Number(cashierId) : undefined,
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      deactivated: showAll === 'true' ? undefined : false,
    },
    include: {
      SaleItem: { include: { Product: true } },
      Cashier: { include: { User: true } },
      Inventory: true,
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });

  const salesWithProfit = sales.map((sale) => {
    const profit = calculateSaleProfit(sale).toFixed(0);
    return { ...sale, profit };
  });

  return res.json({ success: true, data: salesWithProfit });
}

/**
 * POST – Add new sale
 */
async function handleAddSale(req, res) {
  const {
    cashierId,
    inventoryId,
    items,
    discount,
    netPayable,
    paymentMode,
    note,
  } = req.body;

  if (!cashierId || !inventoryId || !items?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // API-03: validate numeric fields
  const numericFields = { discount, netPayable };
  for (const [field, val] of Object.entries(numericFields)) {
    const n = Number(val);
    if (!isFinite(n) || n < 0) {
      return res.status(400).json({ error: `Invalid value for ${field}: must be a non-negative number` });
    }
  }

  try {
    const cashier = await prisma.cashier.findUnique({
      where: { id: Number(cashierId) },
    });
    if (!cashier) {
      return res.status(404).json({ error: 'Cashier not found' });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: Number(inventoryId) },
    });
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    // Snapshot purchasePrice at the moment of sale (ARCH-04 / SCH-03)
    const productIds = items.map((item) => item.product.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, purchasePrice: true },
    });
    const purchasePriceMap = Object.fromEntries(
      products.map((p) => [p.id, p.purchasePrice])
    );

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          discount: Number(discount) || 0,
          totalAmount: Number(netPayable) || 0,
          paymentMode: paymentMode || 'cash',
          note: note || null,
          Cashier: { connect: { id: Number(cashierId) } },
          Inventory: { connect: { id: Number(inventoryId) } },
        },
      });

      await tx.saleItem.createMany({
        data: items.map((item) => ({
          saleId: sale.id,
          productId: item.product.id,
          quantity: Number(item.quantity),
          price: Number(item.price),
          purchasePrice: purchasePriceMap[item.product.id] ?? null,
        })),
      });

      return sale;
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Error creating sale:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST (action=getOne) – Get single sale
 */
async function handleGetSale(req, res) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing sale id' });

  const sale = await prisma.sale.findUnique({
    where: { id: Number(id) },
    include: {
      SaleItem: { include: { Product: true } },
      Cashier: { include: { User: true } },
      Inventory: true,
    },
  });

  if (!sale) return res.status(404).json({ error: 'Sale not found' });

  return res.json({ sale });
}

/**
 * POST (action=update) – Update existing sale
 */
async function handleUpdateSale(req, res) {
  const {
    id,
    cashierId,
    inventoryId,
    items,
    discount,
    netPayable,
    paymentMode,
    note,
  } = req.body;

  if (!id) return res.status(400).json({ error: 'Missing sale id' });
  if (!cashierId || !inventoryId || !items?.length)
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const existingSale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: { SaleItem: true },
    });

    if (!existingSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Delete existing items (simplest + safest for small number of items)
      await tx.saleItem.deleteMany({ where: { saleId: Number(id) } });

      // Recreate updated items
      await tx.saleItem.createMany({
        data: items.map((item) => ({
          saleId: Number(id),
          productId: item.product.id,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      });

      // Update sale record
      const updatedSale = await tx.sale.update({
        where: { id: Number(id) },
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

      return updatedSale;
    });

    return res.json({ sale: result });
  } catch (err) {
    console.error('Error updating sale:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE – Remove sale
 */
async function handleDeleteSale(req, res) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing sale id' });

  try {
    await prisma.sale.update({
      where: { id: Number(id) },
      data: { deactivated: true },
    });

    return res.json({
      success: true,
      message: 'Sale deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return res.status(500).json({ error: 'Failed to deactivate sale' });
  }
}

export default withAuth(handler);
