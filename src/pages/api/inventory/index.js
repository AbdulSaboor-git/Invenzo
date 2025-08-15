// api/inventory.js
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return GET(req, res);
    case 'PATCH':
      return PATCH(req, res);
    case 'POST':
      return POST(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const PATCH = async (req, res) => {
  const { id, name, profilePicture } = req.body;

  try {
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!existingInventory) {
      return res
        .status(404)
        .json({ error: 'Error: Inventory not found', errorCode: 3 });
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (profilePicture !== undefined)
      dataToUpdate.profilePicture = profilePicture;

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: dataToUpdate,
    });

    const data = {
      message: 'Inventory updated successfully',
      inventory: updatedInventory,
      status: 200,
    };
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Unable to edit inventory: Internal Server Error' });
  }
};

// GET /inventory?adminId=123
export const GET = async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) return res.status(400).json({ error: 'adminId is required' });

    const parsedAdminId = parseInt(adminId, 10);
    if (isNaN(parsedAdminId))
      return res.status(400).json({ error: 'Invalid adminId' });

    const inventory = await prisma.inventory.findUnique({
      where: { adminId: parsedAdminId },
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    return res.status(200).json({ inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /inventory
export const POST = async (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId) return res.status(400).json({ error: 'adminId is required' });

    const parsedAdminId = parseInt(adminId, 10);
    if (isNaN(parsedAdminId))
      return res.status(400).json({ error: 'Invalid adminId' });

    let inventory = await prisma.inventory.findUnique({
      where: { adminId: parsedAdminId },
    });

    if (inventory) {
      return res.status(200).json({ inventory, created: false });
    }

    inventory = await prisma.$transaction(async (tx) => {
      const newInv = await tx.inventory.create({
        data: { name: 'Get Started', adminId: parsedAdminId },
      });

      const newCategory = await tx.category.create({
        data: { name: 'General', inventoryId: newInv.id },
      });

      await tx.product.createMany({
        data: [
          {
            name: 'Sample Product 1',
            purchasePrice: 10,
            salePrice: 15,
            categoryId: newCategory.id,
            inventoryId: newInv.id,
            tags: 'sample test',
          },
          {
            name: 'Sample Product 2',
            purchasePrice: 20,
            salePrice: 25,
            categoryId: newCategory.id,
            inventoryId: newInv.id,
            tags: 'sample test',
          },
          {
            name: 'Sample Product 3',
            purchasePrice: 30,
            salePrice: 40,
            categoryId: newCategory.id,
            inventoryId: newInv.id,
            tags: 'sample test',
          },
        ],
        skipDuplicates: true,
      });

      return newInv;
    });

    return res.status(201).json({ inventory, created: true });
  } catch (error) {
    console.error('Error creating inventory:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
