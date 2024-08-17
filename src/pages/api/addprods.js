import { prisma } from "@/lib/prisma"; // Import your Prisma client instance

const addProducts = async (req, res) => {
  try {
    await prisma.product.createMany({
      data: [
        {
          name: "Tissue Party Pack Pink",
          purchasePrice: 210,
          salePrice: 230,
          govtSalePrice: null,
          categoryId: 52,
          inventoryId: 52,
          tags: null,
        },
        {
          name: "Tissue Party Pack White",
          purchasePrice: 205,
          salePrice: 240,
          govtSalePrice: null,
          categoryId: 52,
          inventoryId: 52,
          tags: null,
        },
        {
          name: "Treat Blade White",
          purchasePrice: 6,
          salePrice: 10,
          govtSalePrice: null,
          categoryId: 52,
          inventoryId: 52,
          tags: null,
        },
        {
          name: "Treet Trim II XL Razor",
          purchasePrice: 45,
          salePrice: 50,
          govtSalePrice: null,
          categoryId: 52,
          inventoryId: 52,
          tags: null,
        },
      ],
    });

    res.status(200).json({ message: "Products added successfully" });
  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({ error: "An error occurred while adding products" });
  }
};

export default addProducts;
