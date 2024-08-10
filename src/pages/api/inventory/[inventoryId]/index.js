import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { method } = req;
  const { inventoryId } = req.query; // Extract inventoryId from query parameters

  switch (method) {
    case "GET":
      return handleGet(req, res, inventoryId);
    case "PATCH":
      return PATCH(req, res, inventoryId);
    case "DELETE":
      return DELETE(req, res, inventoryId);
    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function handleGet(req, res, inventoryId) {
  try {
    // Ensure inventoryId is an integer
    const id = parseInt(inventoryId, 10);

    const products = await prisma.product.findMany({
      where: {
        inventoryId: id,
      },
      include: {
        category: true, // Include the related category data
      },
    });

    const categories = await prisma.category.findMany({
      where: {
        inventoryId: id,
      },
    });

    if (!products.length && !categories.length) {
      return res.status(404).json({ message: "Inventory data not found" });
    }

    return res.status(200).json({ products, categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Define PATCH and DELETE functions similarly if needed
async function PATCH(req, res, inventoryId) {
  // Your PATCH implementation
}

async function DELETE(req, res, inventoryId) {
  // Your DELETE implementation
}
