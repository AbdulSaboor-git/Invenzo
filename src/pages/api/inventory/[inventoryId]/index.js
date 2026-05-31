import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;
  const { inventoryId } = req.query; // Extract inventoryId from query parameters

  switch (method) {
    case 'GET':
      return handleGet(req, res, inventoryId);
    case 'POST':
      return handlePost(req, res, inventoryId);
    case 'PATCH':
      return handlePatch(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const handlePost = async (req, res, inventoryId) => {
  const {
    name,
    description,
    purchasePrice,
    salePrice,
    govtSalePrice,
    categoryId,
    unit,
    tags,
  } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        purchasePrice,
        salePrice,
        govtSalePrice,
        unit,
        categoryId,
        inventoryId: parseInt(inventoryId, 10),
        tags,
      },
    });
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function handleGet(req, res, inventoryId) {
  try {
    const id = parseInt(inventoryId, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }

    const userId = parseInt(
      req.query.userId || req.body.userId || req.headers['userid'],
      10
    );
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find inventory with adminId
    const inv = await prisma.inventory.findUnique({
      where: { id },
      select: { id: true, adminId: true },
    });

    if (!inv) {
      return res.status(404).json({ message: 'Invalid inventory ID' });
    }

    // Check if admin
    let isAuthorized = inv.adminId === userId;

    // If not admin, check if cashier
    if (!isAuthorized) {
      const cashierExists = await prisma.cashier.findFirst({
        where: {
          inventoryId: id,
          userId: userId,
        },
        select: { id: true },
      });
      isAuthorized = Boolean(cashierExists);
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: 'User is not authorized to access this inventory' });
    }

    // Fetch products — supports optional ?search, ?page, ?pageSize
    const search = req.query.search ?? '';
    const take = req.query.pageSize ? Math.min(parseInt(req.query.pageSize, 10), 500) : 100;
    const skip = req.query.page ? Math.max(parseInt(req.query.page, 10) - 1, 0) * take : 0;

    const products = await prisma.product.findMany({
      where: {
        inventoryId: id,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { tags: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
      take,
      skip,
    });

    // Fetch categories
    const categories = await prisma.category.findMany({
      where: { inventoryId: id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ products, categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Define PATCH and DELETE functions similarly if needed
async function handlePatch(req, res) {
  const {
    id,
    name,
    description,
    categoryId,
    purchasePrice,
    salePrice,
    govtSalePrice,
    unit,
    tags,
  } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name: name,
        description: description,
        categoryId: categoryId,
        purchasePrice: purchasePrice,
        salePrice: salePrice,
        govtSalePrice: govtSalePrice,
        unit: unit,
        tags: tags,
      },
    });
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Failed to update product' });
  }
}

async function handleDelete(req, res) {
  const { id } = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found', errorCode: 3 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res
      .status(200)
      .json({ status: 200, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error.message, error.stack);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default withAuth(handler);
