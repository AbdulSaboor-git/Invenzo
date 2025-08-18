import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
            Inventory: {
              select: {
                adminId: true,
                name: true,
              },
            },
          },
        },
        Inventories: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User inactive or not found' });
    }

    const adminId = user.Cashier?.Inventory?.adminId ?? user.id;
    const invName = user.Cashier?.Inventory?.invName ?? user.Inventories?.name;

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        profilePicture: user.profilePicture || null,
        adminId,
        invName,
      },
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
