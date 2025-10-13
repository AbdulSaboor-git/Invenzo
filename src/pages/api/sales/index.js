import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetSales(req, res);

      case 'POST':
        if (req.body?.action === 'getOne') {
          return await handleGetSale(req, res);
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
  const { inventoryId, cashierId, from, to, showAll } = req.query;

  const sales = await prisma.sale.findMany({
    where: {
      inventoryId: inventoryId ? Number(inventoryId) : undefined,
      cashierId: cashierId ? Number(cashierId) : undefined,
      createdAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
      deactivated: showAll === 'true' ? undefined : false,
    },
    include: {
      SaleItem: { include: { Product: true } },
      Cashier: { include: { User: true } },
      Inventory: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const salesWithProfit = sales.map((sale) => {
    const cost = sale.SaleItem.reduce((acc, item) => {
      let qty = item.quantity;

      if (item.Product.unit === 'kg' || item.Product.unit === 'litre') {
        qty = qty / 1000;
      }

      const itemCost = (item.Product?.purchasePrice || 0) * qty;
      return acc + itemCost;
    }, 0);

    const profit = (sale.totalAmount - cost).toFixed(0);

    return {
      ...sale,
      profit,
    };
  });

  return res.json({ sales: salesWithProfit });
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
        })),
      });

      return sale;
    });

    return res.status(201).json({ sale: result });
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
