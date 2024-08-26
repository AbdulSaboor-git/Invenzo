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
    const newProduct = await prisma.product.createMany({
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
    // Ensure inventoryId is a valid integer
    const id = parseInt(inventoryId, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid inventory ID" });
    }

    // Extract userId from request (assuming it's coming from a header or request body)
    const userId = req.query.userId || req.body.userId || req.headers["userId"];
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log("User ID:", userId, "Inventory ID:", id); // Log to verify values

    // Check if inventory exists
    const inv = await prisma.inventory.findUnique({
      where: { id },
      include: { admin: true },
    });

    if (!inv) {
      return res.status(404).json({ message: "Invalid inventory ID" });
    }

    // Check if the user is either the admin or a moderator of the inventory
    const isAdmin = inv.adminId === parseInt(userId, 10);

    const isModerator = await prisma.moderator.findFirst({
      where: {
        inventoryId: id,
        userId: parseInt(userId, 10),
      },
    });

    if (!isAdmin && !isModerator) {
      return res
        .status(403)
        .json({ message: "User is not authorized to access this inventory" });
    }

    // Fetch products, categories, and moderators
    const products = await prisma.product.findMany({
      where: { inventoryId: id },
      include: { category: true }, // Include the related category data
    });

    const categories = await prisma.category.findMany({
      where: { inventoryId: id },
    });

    const moderators = await prisma.moderator.findMany({
      where: { inventoryId: id },
      include: { user: true }, // Include the related user data
      orderBy: { userId: "asc" },
    });

    // Sort categories and products alphabetically
    categories.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
    products.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

    return res.status(200).json({ products, categories, moderators, inv });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Define PATCH and DELETE functions similarly if needed
async function handlePatch(req, res, inventoryId) {
  const {
    id,
    name,
    description,
    categoryId,
    purchasePrice,
    salePrice,
    govtSalePrice,
    tags,
  } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: id }, // Ensure this matches the product ID
      data: {
        name: name,
        description: description,
        categoryId: categoryId,
        purchasePrice: purchasePrice,
        salePrice: salePrice,
        govtSalePrice: govtSalePrice,
        tags: tags,
      },
    });
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Failed to update product" });
  }
}

async function handleDelete(req, res, inventoryId) {
  const { id } = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found", errorCode: 3 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res
      .status(200)
      .json({ status: 200, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error.message, error.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
