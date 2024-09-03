// api/inventory.js
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  switch (req.method) {
    case "POST":
      return POST(req, res);
    case "GET":
      return GET(req, res);
    case "PATCH":
      return PATCH(req, res);
    case "DELETE":
      return DELETE(req, res);
    default:
      res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const POST = async (req, res) => {
  const { name, profilePicture, adminId } = req.body;
  try {
    const existingInventory = await prisma.inventory.findFirst({
      where: { name: name },
    });

    if (existingInventory) {
      return res.status(409).json({
        error: "Inventory with this name already exists",
      });
    }
    const newInventory = await prisma.inventory.create({
      data: {
        name,
        profilePicture,
        adminId,
      },
    });
    const data = { inventory: newInventory, status: 201 };
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const PATCH = async (req, res) => {
  const { id, name, profilePicture } = req.body;

  try {
    const existingInventoryName = await prisma.inventory.findFirst({
      where: { name: name },
    });

    if (existingInventoryName) {
      return res.status(409).json({
        error: "No changings made",
      });
    }
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!existingInventory) {
      return res
        .status(404)
        .json({ error: "Error: Inventory not found", errorCode: 3 });
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
      message: "Inventory updated successfully",
      inventory: updatedInventory,
      status: 200,
    };
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Unable to edit inventory: Internal Server Error" });
  }
};

const DELETE = async (req, res) => {
  const { id } = req.body;

  try {
    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!existingInventory) {
      return res
        .status(404)
        .json({ error: "Error: Inventory not found", errorCode: 3 });
    }

    await prisma.$transaction([
      prisma.moderator.deleteMany({
        where: {
          inventoryId: id,
        },
      }),
      prisma.product.deleteMany({
        where: {
          inventoryId: id,
        },
      }),
      prisma.category.deleteMany({
        where: {
          inventoryId: id,
        },
      }),
      prisma.inventory.delete({
        where: { id },
      }),
    ]);

    return res
      .status(200)
      .json({ status: 200, message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error.message, error.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const GET = async (req, res) => {
  try {
    const { adminId, moderatorId } = req.query;

    let inventories = [];
    if (adminId) {
      inventories = await prisma.inventory.findMany({
        where: { adminId: parseInt(adminId) },
        orderBy: { createdAt: "asc" },
      });
    } else if (moderatorId) {
      inventories = await prisma.inventory.findMany({
        where: {
          moderators: {
            some: {
              userId: parseInt(moderatorId),
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
    }

    const data = { inventories, status: 200 };
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
