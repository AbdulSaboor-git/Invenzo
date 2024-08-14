import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { method } = req;
  const { inventoryId } = req.query;

  switch (method) {
    case "DELETE":
      return DELETE(req, res, inventoryId);
    default:
      res.setHeader("Allow", ["DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const DELETE = async (req, res, inventoryId) => {
  try {
    // Ensure the inventoryId is a number
    const id = parseInt(inventoryId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inventory ID" });
    }

    // Start a transaction to ensure all operations succeed or fail together
    await prisma.$transaction([
      // Delete all products related to the inventory
      prisma.product.deleteMany({
        where: { inventoryId: id },
      }),
      // Delete all categories related to the inventory
      prisma.category.deleteMany({
        where: { inventoryId: id },
      }),
    ]);

    return res.status(200).json({
      status: 200,
      message: "Successfully cleared inventory",
    });
  } catch (error) {
    console.error("Delete Error:", error.message, error.stack);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
