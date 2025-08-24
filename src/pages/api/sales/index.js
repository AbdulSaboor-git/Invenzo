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
  const { inventoryId, cashierId, from, to } = req.query;

  const sales = await prisma.sale.findMany({
    where: {
      inventoryId: inventoryId ? Number(inventoryId) : undefined,
      cashierId: cashierId ? Number(cashierId) : undefined,
      createdAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    },
    include: {
      SaleItem: { include: { Product: true } },
      Cashier: { include: { User: true } },
      Inventory: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ sales });
}

/**
 * POST – Add new sale
 */
async function handleAddSale(req, res) {
  const { cashierId, inventoryId, items, discount, paymentMode, note } =
    req.body;

  if (!cashierId || !inventoryId || !items?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await prisma.$transaction(async (tx) => {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    const netAmount = totalAmount - (discount || 0);

    const sale = await tx.sale.create({
      data: {
        cashierId,
        inventoryId,
        discount: discount || 0,
        totalAmount: netAmount,
        paymentMode: paymentMode || 'cash',
        note: note || null,
      },
    });

    await tx.saleItem.createMany({
      data: items.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    return sale;
  });

  return res.status(201).json({ sale: result });
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
