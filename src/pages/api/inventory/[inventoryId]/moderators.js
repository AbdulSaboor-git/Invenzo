import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const { inventoryId } = req.query; // Extract inventoryId from query parameters
  const { method } = req;

  switch (method) {
    case "POST":
      return handlePost(req, res, inventoryId);
    case "DELETE":
      return handleDelete(req, res);
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

const handlePost = async (req, res, inventoryId) => {
  const { name, email } = req.body;
  try {
    // Validate user existence
    const validate_user = await prisma.user.findFirst({
      where: {
        firstName: name,
        email: email,
      },
    });

    if (!validate_user) {
      return res.status(409).json({ error: "User not found", errorCode: 3 });
    }

    // Check if moderator already exists
    const existingModerator = await prisma.moderator.findFirst({
      where: {
        userId: validate_user.id,
        inventoryId: parseInt(inventoryId, 10),
      },
    });

    if (existingModerator) {
      return res
        .status(409)
        .json({ error: "Moderator already exists", errorCode: 3 });
    }

    // Create the new moderator
    const newModerator = await prisma.moderator.create({
      data: {
        userId: validate_user.id,
        inventoryId: parseInt(inventoryId, 10),
      },
    });

    res.status(201).json({
      message: "Moderator added successfully",
      moderator: newModerator,
    });
  } catch (error) {
    console.error("Error adding moderator:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleDelete = async (req, res) => {
  const { moderatorId } = req.body;

  try {
    // Find the moderator
    const moderator = await prisma.moderator.findUnique({
      where: { id: parseInt(moderatorId, 10) },
    });

    if (!moderator) {
      return res
        .status(404)
        .json({ error: "Moderator not found", errorCode: 4 });
    }

    // Delete the moderator
    await prisma.moderator.delete({
      where: { id: parseInt(moderatorId, 10) },
    });

    return res.status(200).json({ message: "Moderator deleted successfully" });
  } catch (error) {
    console.error("Error deleting moderator:", error);
    return res.status(500).json({ message: "Failed to delete moderator" });
  }
};
