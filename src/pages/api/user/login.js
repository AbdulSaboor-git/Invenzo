import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    // Step 1: Find user with cashier + inventory relation
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
        profilePicture: true,
        Cashier: {
          select: {
            id: true,
            Inventory: {
              select: {
                id: true,
                adminId: true,
                name: true,
              },
            },
          },
        },
        Inventories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user || password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Step 2: Check active status
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Step 3: Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Step 4: Determine adminId
    const adminId = user.Cashier?.Inventory?.adminId ?? user.id;
    const invName = user.Cashier?.Inventory?.name ?? user.Inventories?.name;
    const invId = user.Cashier?.Inventory?.id ?? user.Inventories?.id;
    const cashierId = user.Cashier?.id ?? null;
    // Step 5: Generate JWT (7-day expiry; role included for middleware role-checks)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Step 6: Return token + safe user info
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        profilePicture: user.profilePicture || null,
        adminId,
        invId,
        invName,
        cashierId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
