import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { method } = req;
  const { inventoryId } = req.query; // Extract inventoryId from query parameters

  switch (method) {
    case "GET":
      return handleGet(req, res, inventoryId);
    case "POST":
      return handlePost(req, res, inventoryId);
    case "PATCH":
      return handlePatch(req, res, inventoryId);
    case "DELETE":
      return handleDelete(req, res, inventoryId);
    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
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
        categoryId,
        inventoryId: parseInt(inventoryId, 10),
        tags,
      },
    });
    const data = { product: newProduct, status: 201 };
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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
async function handlePatch(req, res, inventoryId) {
  // Your PATCH implementation
}

async function handleDelete(req, res, inventoryId) {
  // Your DELETE implementation
}
