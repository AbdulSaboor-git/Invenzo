// /pages/api/users.ts

import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetUsers(req, res);

      case 'POST':
        return await handleAddUser(req, res);

      case 'PUT':
        return await handleEditUser(req, res);

      case 'PATCH':
        if (req.body?.oldPassword && req.body?.newPassword) {
          return await handleUpdatePassword(req, res);
        }
        return await handleResetPassword(req, res);

      case 'DELETE':
        return await handleDeleteUser(req, res);

      default:
        return res
          .status(405)
          .json({ success: false, error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Users API error:', err);
    return res
      .status(500)
      .json({ success: false, error: 'Internal server error' });
  }
}

/* ----------------------------- Helpers ------------------------------ */

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function requireFields(body, fields) {
  return fields.filter(
    (f) => !body?.[f] && body?.[f] !== 0 && body?.[f] !== false
  );
}

function sanitizeUser(u) {
  let inventory = null;

  if (u.role === 'cashier' && u.Cashier?.Inventory) {
    inventory = {
      id: u.Cashier.Inventory.id,
      name: u.Cashier.Inventory.name,
      productCount: u.Cashier.Inventory._count?.products || 0,
    };
  } else if (u.Inventories) {
    inventory = {
      id: u.Inventories.id,
      name: u.Inventories.name,
      productCount: u.Inventories._count?.products || 0,
    };
  }

  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLogin: u.lastLogin,
    profilePicture: u.profilePicture,
    isActive: u.isActive,
    role: u.role,
    inventory,
  };
}

/* ------------------------------- GET -------------------------------- */
async function handleGetUsers(req, res) {
  const users = await prisma.user.findMany({
    include: {
      Inventories: {
        select: {
          id: true,
          name: true,
          _count: { select: { products: true } },
        },
      },
      Cashier: {
        include: {
          Inventory: {
            select: {
              id: true,
              name: true,
              _count: { select: { products: true } },
            },
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  const sanitized = users.map(sanitizeUser);

  // split superadmins and others
  const superadmins = sanitized.filter((u) => u.role === 'superadmin');
  const others = sanitized.filter((u) => u.role !== 'superadmin');

  // sort others by inventory name (users without inventory go last)
  others.sort((a, b) => {
    if (!a.inventory && !b.inventory) return 0;
    if (!a.inventory) return 1;
    if (!b.inventory) return -1;
    return a.inventory.name.localeCompare(b.inventory.name);
  });

  const result = [...superadmins, ...others];

  return res.status(200).json({ success: true, data: result });
}

/* ------------------------------- POST ------------------------------- */
async function handleAddUser(req, res) {
  const { email, password, firstName, lastName, isActive, profilePicture } =
    req.body || {};

  const missing = requireFields(req.body, ['email', 'password', 'firstName']);
  if (missing.length) {
    return res
      .status(400)
      .json({ success: false, error: `Missing fields: ${missing.join(', ')}` });
  }
  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ success: false, error: 'Invalid email format' });
  }
  if (typeof password !== 'string' || password.length < 5) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 5 characters',
    });
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // stored plain (per your instruction)
        firstName,
        lastName,
        role: 'admin', // always admin on creation
        isActive: typeof isActive === 'boolean' ? isActive : true,
        profilePicture: profilePicture ?? null,
      },
      include: {
        Inventories: { select: { id: true, name: true } },
        Cashier: {
          include: { Inventory: { select: { id: true, name: true } } },
        },
      },
    });

    return res.status(201).json({ success: true, data: sanitizeUser(newUser) });
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: 'Failed to create user. Email may already be in use.',
    });
  }
}

/* ------------------------------- PUT -------------------------------- */
async function handleEditUser(req, res) {
  const { userId, email, firstName, lastName, isActive, profilePicture } =
    req.body || {};

  if (!userId && userId !== 0) {
    return res
      .status(400)
      .json({ success: false, error: 'userId is required' });
  }

  const data = {};
  if (email !== undefined) {
    if (!isValidEmail(email))
      return res
        .status(400)
        .json({ success: false, error: 'Invalid email format' });
    data.email = email;
  }
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (typeof isActive === 'boolean') data.isActive = isActive;
  if (profilePicture !== undefined) data.profilePicture = profilePicture;

  if (Object.keys(data).length === 0) {
    return res
      .status(400)
      .json({ success: false, error: 'No fields to update' });
  }

  try {
    // Get current user info first
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        Inventories: { select: { id: true, adminId: true } },
        Cashier: {
          include: { Inventory: { select: { id: true, adminId: true } } },
        },
      },
    });

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if cashier/other is trying to be activated while admin is inactive
    if (
      data.isActive === true &&
      currentUser.Cashier?.Inventory // user is cashier
    ) {
      const admin = await prisma.user.findUnique({
        where: { id: currentUser.Cashier.Inventory.adminId },
        select: { isActive: true },
      });

      if (admin && admin.isActive === false) {
        return res.status(400).json({
          success: false,
          error: 'Cannot activate cashier because its admin is inactive',
        });
      }
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: Number(userId) },
      data,
      include: {
        Inventories: { select: { id: true, name: true } },
        Cashier: {
          include: { Inventory: { select: { id: true, name: true } } },
        },
      },
    });

    // If user is an admin and set inactive → deactivate all its inventory users
    if (currentUser.Inventories && data.isActive === false) {
      const inventoryId = currentUser.Inventories.id;

      await prisma.user.updateMany({
        where: {
          OR: [
            { Cashier: { inventoryId } },
            { Inventories: { id: inventoryId } },
          ],
        },
        data: { isActive: false },
      });
    }

    return res.status(200).json({ success: true, data: sanitizeUser(updated) });
  } catch (e) {
    console.error(e);
    return res
      .status(400)
      .json({ success: false, error: 'Failed to update user' });
  }
}

/* ------------------------------ PATCH ------------------------------- */
async function handleResetPassword(req, res) {
  const { userId } = req.body || {};

  if (!userId && userId !== 0) {
    return res
      .status(400)
      .json({ success: false, error: 'userId is required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user)
    return res.status(404).json({ success: false, error: 'User not found' });

  const safeFirstName = (user.firstName || '')
    .toLowerCase()
    .replace(/\s+/g, '');

  const newPassword = `${safeFirstName}.inv`;

  try {
    const updated = await prisma.user.update({
      where: { id: Number(userId) },
      data: { password: newPassword },
      include: {
        Inventories: { select: { id: true, name: true } },
        Cashier: {
          include: { Inventory: { select: { id: true, name: true } } },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: sanitizeUser(updated),
      newPassword, // return so super admin knows it
    });
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, error: 'Failed to reset password' });
  }
}

async function handleUpdatePassword(req, res) {
  const { userId, oldPassword, newPassword } = req.body || {};

  if (!userId && userId !== 0) {
    return res
      .status(400)
      .json({ success: false, error: 'userId is required' });
  }
  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'oldPassword and newPassword are required',
    });
  }
  if (newPassword.length < 5) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 5 characters',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { password: true },
  });
  if (!user)
    return res.status(404).json({ success: false, error: 'User not found' });

  if (user.password !== oldPassword) {
    return res
      .status(400)
      .json({ success: false, error: 'Old password is incorrect' });
  }

  const updated = await prisma.user.update({
    where: { id: Number(userId) },
    data: { password: newPassword },
    include: {
      Inventories: { select: { id: true, name: true } },
      Cashier: { include: { Inventory: { select: { id: true, name: true } } } },
    },
  });

  return res.status(200).json({ success: true, data: sanitizeUser(updated) });
}

/* ------------------------------ DELETE ------------------------------ */
async function handleDeleteUser(req, res) {
  const { userId } = req.body || {};
  if (!userId && userId !== 0) {
    return res
      .status(400)
      .json({ success: false, error: 'userId is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        Inventories: { select: { id: true } },
        Cashier: { select: { id: true, inventoryId: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await prisma.$transaction(
      async (tx) => {
        // --- if user is an admin of an inventory ---
        if (user.Inventories) {
          const invId = user.Inventories.id;

          // delete sales + saleItems
          await tx.saleItem.deleteMany({
            where: { Sale: { inventoryId: invId } },
          });
          await tx.sale.deleteMany({
            where: { inventoryId: invId },
          });

          // delete products + categories
          await tx.product.deleteMany({
            where: { inventoryId: invId },
          });
          await tx.category.deleteMany({
            where: { inventoryId: invId },
          });

          // find all cashier userIds for this inventory
          const cashierUsers = await tx.user.findMany({
            where: {
              Cashier: { inventoryId: invId },
              NOT: { id: user.id },
            },
            select: { id: true },
          });

          // delete cashier records
          await tx.cashier.deleteMany({
            where: { inventoryId: invId },
          });

          // delete cashier users
          if (cashierUsers.length > 0) {
            await tx.user.deleteMany({
              where: { id: { in: cashierUsers.map((c) => c.id) } },
            });
          }

          // finally delete inventory
          await tx.inventory.delete({
            where: { id: invId },
          });
        }

        // --- if user is a cashier ---
        if (user.Cashier && user.role !== 'admin') {
          const cashierId = user.Cashier.id;

          await tx.saleItem.deleteMany({
            where: { Sale: { cashierId: cashierId } },
          });
          await tx.sale.deleteMany({
            where: { cashierId: cashierId },
          });
          await tx.cashier.delete({
            where: { id: cashierId },
          });
        }

        // --- finally delete user itself ---
        await tx.user.delete({
          where: { id: Number(userId) },
        });
      },
      {
        timeout: 20000, // ⏳ increase timeout to 20 seconds
      }
    );

    return res
      .status(200)
      .json({ success: true, data: { id: Number(userId), deleted: true } });
  } catch (error) {
    console.error('Error deleting user and related data:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Internal server error' });
  }
}
