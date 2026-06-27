import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/middlewares/withAuth';

async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetCashiers(req, res);

      case 'POST':
        return await handleAddCashier(req, res);

      case 'PUT':
        return await handleEditCashier(req, res);

      case 'PATCH':
        if (req.body.oldPassword && req.body.newPassword) {
          return await handleUpdatePassword(req, res);
        }
        return await handleResetPassword(req, res);

      case 'DELETE':
        return await handleDeleteCashier(req, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Cashiers API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Verify req.user owns the inventory for a given adminId.
 * Returns the inventory or sends a 403/404 and returns null.
 */
async function requireInventoryOwner(req, res, adminId) {
  const inventory = await prisma.inventory.findUnique({
    where: { adminId: Number(adminId) },
  });
  if (!inventory) {
    res.status(404).json({ error: 'Inventory not found' });
    return null;
  }
  if (inventory.adminId !== req.user.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return inventory;
}

/**
 * GET – Fetch cashiers (excluding admin)
 */
async function handleGetCashiers(req, res) {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const inventory = await requireInventoryOwner(req, res, userId);
  if (!inventory) return;

  const take = req.query.pageSize
    ? Math.min(parseInt(req.query.pageSize, 10), 200)
    : 100;
  const skip = req.query.page
    ? Math.max(parseInt(req.query.page, 10) - 1, 0) * take
    : 0;

  const cashiers = await prisma.cashier.findMany({
    where: {
      inventoryId: inventory.id,
      userId: { not: Number(userId) }, // exclude admin
    },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          lastLogin: true,
          isActive: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      Inventory: { select: { id: true, name: true } },
    },
    orderBy: { id: 'asc' },
    take,
    skip,
  });

  return res.json({ success: true, data: cashiers });
}

/**
 * POST – Add cashier
 */
async function handleAddCashier(req, res) {
  const { userId, firstName, lastName, invId } = req.body;

  if (invId) {
    if (!userId) return res.status(400).json({ error: 'Missing data' });

    const cashier = await prisma.cashier.create({
      data: {
        inventoryId: invId,
        userId: userId,
      },
    });
    return res.status(201).json({ success: true, data: cashier });
  } else {
    if (!userId || !firstName)
      return res.status(400).json({ error: 'Missing data' });

    if (!/^[a-zA-Z]+$/.test(firstName)) {
      return res
        .status(400)
        .json({ error: 'First name can only contain letters' });
    }

    if (lastName && !/^[a-zA-Z]+$/.test(lastName)) {
      return res
        .status(400)
        .json({ error: 'Last name can only contain letters' });
    }

    const inventory = await requireInventoryOwner(req, res, userId);
    if (!inventory) return;

    const email = `cashier.${firstName.replace(/\s+/g, '').toLowerCase()}@invenzo.com`;

    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });
    if (existingUser)
      return res.status(400).json({ error: 'Cashier email already exists' });

    const plainPassword = `${firstName.toLowerCase()}.inv`.toLowerCase();

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || '',
        email: email.toLowerCase(),
        password: plainPassword,
        role: 'cashier',
      },
    });

    const cashier = await prisma.cashier.create({
      data: {
        inventoryId: inventory.id,
        userId: user.id,
      },
    });
    return res.status(201).json({ success: true, data: cashier });
  }
}

/**
 * PUT – Edit cashier name
 */
async function handleEditCashier(req, res) {
  const { cashierId, firstName, lastName, isActive } = req.body;
  const activeStatus =
    typeof isActive === 'string' ? isActive === 'true' : !!isActive;

  if (!cashierId || !firstName)
    return res.status(400).json({ error: 'Missing data' });

  // Authorization: only the inventory admin may edit their cashiers
  const existing = await prisma.cashier.findUnique({
    where: { id: Number(cashierId) },
    include: { Inventory: { select: { adminId: true } } },
  });
  if (!existing) return res.status(404).json({ error: 'Cashier not found' });
  if (existing.Inventory.adminId !== req.user.userId)
    return res.status(403).json({ error: 'Forbidden' });

  const cashier = await prisma.cashier.update({
    where: { id: Number(cashierId) },
    data: {
      User: {
        update: {
          firstName,
          lastName: lastName || '',
          isActive: activeStatus,
        },
      },
    },
    include: { User: true, Inventory: true },
  });

  return res.json({ cashier });
}

/**
 * PATCH – Reset cashier password
 */
async function handleResetPassword(req, res) {
  const { cashierId, password } = req.body;
  if (!cashierId) return res.status(400).json({ error: 'Missing data' });

  const cashier = await prisma.cashier.findUnique({
    where: { id: Number(cashierId) },
    include: { User: true, Inventory: { select: { adminId: true } } },
  });
  if (!cashier) return res.status(404).json({ error: 'Cashier not found' });

  // Authorization: only the inventory admin may reset a cashier's password
  if (cashier.Inventory.adminId !== req.user.userId)
    return res.status(403).json({ error: 'Forbidden' });

  await prisma.user.update({
    where: { id: cashier.userId },
    data: { password: password },
  });

  return res.json({
    message: 'Password reset successfully',
    password,
  });
}

/**
 * DELETE – Remove cashier
 */
async function handleDeleteCashier(req, res) {
  const { cashierId } = req.body;
  if (!cashierId) {
    return res.status(400).json({ success: false, error: 'Missing cashierId' });
  }

  try {
    const cashier = await prisma.cashier.findUnique({
      where: { id: Number(cashierId) },
      include: { Sale: true, Inventory: { select: { adminId: true } } },
    });

    if (!cashier) {
      return res
        .status(404)
        .json({ success: false, error: 'Cashier not found' });
    }

    // Authorization: only the inventory admin may delete their cashiers
    if (cashier.Inventory.adminId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    if (cashier.Sale.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete cashier who has sales',
      });
    }

    // delete cashier + linked user
    await prisma.cashier.delete({ where: { id: cashier.id } });
    await prisma.user.delete({ where: { id: cashier.userId } });

    return res.json({ success: true, message: 'Cashier deleted successfully' });
  } catch (error) {
    console.error('Error deleting cashier:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Internal server error' });
  }
}

/**
 * PATCH – Update cashier password (requires old & new password)
 */
async function handleUpdatePassword(req, res) {
  const { cashierId, oldPassword, newPassword } = req.body;

  if (!cashierId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  const cashier = await prisma.cashier.findUnique({
    where: { id: Number(cashierId) },
    include: { User: true },
  });

  if (!cashier) {
    return res.status(404).json({ error: 'Cashier not found' });
  }

  // In production, compare hashed passwords (bcrypt.compare)
  if (cashier.User.password !== oldPassword) {
    return res.status(400).json({ error: 'Old password is incorrect' });
  }

  await prisma.user.update({
    where: { id: cashier.userId },
    data: { password: newPassword },
  });

  return res.json({ message: 'Password updated successfully' });
}
export default withAuth(handler);
