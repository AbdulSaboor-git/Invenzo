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
  let inferredRole = u.role || null;
  if (u.Inventories) inferredRole = 'admin';
  else if (u.Cashier) inferredRole = 'cashier';

  let inventory = null;
  if (u.Inventories) {
    inventory = { id: u.Inventories.id, name: u.Inventories.name };
  } else if (u.Cashier?.Inventory) {
    inventory = { id: u.Cashier.Inventory.id, name: u.Cashier.Inventory.name };
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
    role: inferredRole,
    inventory,
  };
}

/* ------------------------------- GET -------------------------------- */
async function handleGetUsers(req, res) {
  const users = await prisma.user.findMany({
    include: {
      Inventories: { select: { id: true, name: true } },
      Cashier: { include: { Inventory: { select: { id: true, name: true } } } },
    },
    orderBy: { id: 'asc' },
  });

  return res.status(200).json({ success: true, data: users.map(sanitizeUser) });
}

/* ------------------------------- POST ------------------------------- */
async function handleAddUser(req, res) {
  const { email, password, firstName, lastName, isActive, profilePicture } =
    req.body || {};

  const missing = requireFields(req.body, [
    'email',
    'password',
    'firstName',
    'lastName',
  ]);
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
    return res.status(200).json({ success: true, data: sanitizeUser(updated) });
  } catch (e) {
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

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    include: {
      Inventories: { select: { id: true, name: true } },
      Cashier: { include: { Sale: { select: { id: true }, take: 1 } } },
    },
  });

  if (!user)
    return res.status(404).json({ success: false, error: 'User not found' });

  if (user.Inventories) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete user: user is an admin of an inventory',
    });
  }
  if (user.Cashier?.Sale?.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete user: cashier has recorded sales',
    });
  }

  if (user.Cashier) {
    await prisma.cashier.delete({ where: { id: user.Cashier.id } });
  }
  await prisma.user.delete({ where: { id: Number(userId) } });

  return res
    .status(200)
    .json({ success: true, data: { id: Number(userId), deleted: true } });
}
