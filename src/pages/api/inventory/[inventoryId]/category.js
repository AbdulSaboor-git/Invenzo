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
      res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const handlePost = async (req, res, inventoryId) => {
  const { name } = req.body;

  try {
    // Ensure the inventoryId is valid
    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(inventoryId, 10) },
    });

    if (!inventory) {
      return res
        .status(404)
        .json({ error: "Inventory not found", errorCode: 4 });
    }

    // Check if the category already exists within the same inventory
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name,
        inventoryId: parseInt(inventoryId, 10),
      },
    });

    if (existingCategory) {
      return res
        .status(409) // Conflict status code is more appropriate here
        .json({ error: "Category already exists", errorCode: 3 });
    }

    // Create the new category
    const newCategory = await prisma.category.create({
      data: {
        name,
        inventoryId: parseInt(inventoryId, 10),
      },
    });

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function handleGet(req, res, inventoryId) {
  try {
    // Ensure inventoryId is an integer
    const id = parseInt(inventoryId, 10);

    const categories = await prisma.category.findMany({
      where: {
        inventoryId: id,
      },
    });

    if (!categories.length) {
      return res.status(404).json({ message: "Categories not found" });
    }

    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// Define PATCH and DELETE functions similarly if needed
const handlePatch = async (req, res, inventoryId) => {
  const { categoryId, name } = req.body;

  try {
    // Ensure the inventoryId and categoryId are valid
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId, 10) },
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "Category not found", errorCode: 4 });
    }

    // Check if the new category name is unique within the same inventory
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name,
        inventoryId: parseInt(inventoryId, 10),
        NOT: { id: parseInt(categoryId, 10) }, // Exclude the current category
      },
    });

    if (existingCategory) {
      return res
        .status(409)
        .json({ error: "Category name already exists", errorCode: 3 });
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(categoryId, 10) },
      data: { name },
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ message: "Failed to update category" });
  }
};

const handleDelete = async (req, res, inventoryId) => {
  const { categoryId } = req.body;

  try {
    // Ensure the categoryId is valid
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId, 10) },
      include: { products: true }, // Include products to check if any exist
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "Category not found", errorCode: 4 });
    }

    // Check if the category has associated products
    if (category.products.length > 0) {
      return res
        .status(409)
        .json({ error: "Cannot delete category with products", errorCode: 5 });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: parseInt(categoryId, 10) },
    });

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ message: "Failed to delete category" });
  }
};
