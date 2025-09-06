// File: /pages/api/dashboard.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { role, inventoryId, fromDate, toDate } = req.body || {};
  const isSuper = role === 'superadmin';

  try {
    // ---- Date range setup ----
    const from = fromDate ? new Date(fromDate) : new Date();
    from.setHours(0, 0, 0, 0);

    const to = toDate ? new Date(toDate) : new Date();
    to.setHours(23, 59, 59, 999);

    // ---- 1) Basic aggregates ----
    const agg = await prisma.sale.aggregate({
      where: {
        ...(isSuper
          ? { deactivated: false }
          : { inventoryId, deactivated: false }),
        createdAt: { gte: from, lte: to },
      },
      _sum: { totalAmount: true, discount: true },
      _avg: { totalAmount: true },
      _count: { id: true },
    });

    const totalSalesAmount = agg._sum.totalAmount ?? 0;
    const totalSalesCount = agg._count.id ?? 0;
    const avgSaleValue = agg._avg.totalAmount ?? 0;
    const totalDiscounts = agg._sum.discount ?? 0;

    // ---- 2) Recent sales ----
    const recentSales = await prisma.sale.findMany({
      where: {
        ...(isSuper
          ? { deactivated: false }
          : { inventoryId, deactivated: false }),
        createdAt: { gte: from, lte: to },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { Cashier: { include: { User: true } }, Inventory: true },
    });

    // ---- 3) Sales trend ----
    const trendQuery = isSuper
      ? await prisma.$queryRaw`
          SELECT date_trunc('day', "createdAt")::date AS day, COALESCE(sum("totalAmount"),0) AS total
          FROM "Sale"
          WHERE "deactivated" = false
          AND "createdAt" BETWEEN ${from} AND ${to}
          GROUP BY day
          ORDER BY day ASC
        `
      : await prisma.$queryRaw`
          SELECT date_trunc('day', "createdAt")::date AS day, COALESCE(sum("totalAmount"),0) AS total
          FROM "Sale"
          WHERE "deactivated" = false
          AND "inventoryId" = ${inventoryId}
          AND "createdAt" BETWEEN ${from} AND ${to}
          GROUP BY day
          ORDER BY day ASC
        `;

    const salesTrend = (trendQuery || []).map((r) => {
      const day =
        r.day instanceof Date
          ? r.day.toISOString().slice(0, 10)
          : new Date(r.day).toISOString().slice(0, 10);
      return { day, total: parseFloat(r.total) };
    });

    // ---- 4) Top products ----
    const topProductsWeightRows = isSuper
      ? await prisma.$queryRaw`
          SELECT p.id, p.name, p.unit,
          COALESCE(SUM(si.quantity),0) as quantity,
          COALESCE(SUM(si.price),0) as revenue
          FROM "SaleItem" si
          JOIN "Sale" s ON s.id = si."saleId" AND s."deactivated" = false AND s."createdAt" BETWEEN ${from} AND ${to}
          JOIN "Product" p ON p.id = si."productId"
          WHERE p.unit IN ('kg','g','liter','ml')
          GROUP BY p.id, p.name, p.unit
          ORDER BY quantity DESC
          LIMIT 8
        `
      : await prisma.$queryRaw`
          SELECT p.id, p.name, p.unit,
          COALESCE(SUM(si.quantity),0) as quantity,
          COALESCE(SUM(si.price),0) as revenue
          FROM "SaleItem" si
          JOIN "Sale" s ON s.id = si."saleId" AND s."deactivated" = false 
            AND s."inventoryId" = ${inventoryId}
            AND s."createdAt" BETWEEN ${from} AND ${to}
          JOIN "Product" p ON p.id = si."productId"
          WHERE p.unit IN ('kg','g','liter','ml')
          GROUP BY p.id, p.name, p.unit
          ORDER BY quantity DESC
          LIMIT 8
        `;

    const topProductsNumberRows = isSuper
      ? await prisma.$queryRaw`
          SELECT p.id, p.name, p.unit,
          COALESCE(SUM(si.quantity),0) as quantity,
          COALESCE(SUM(si.price),0) as revenue
          FROM "SaleItem" si
          JOIN "Sale" s ON s.id = si."saleId" AND s."deactivated" = false AND s."createdAt" BETWEEN ${from} AND ${to}
          JOIN "Product" p ON p.id = si."productId"
          WHERE p.unit NOT IN ('kg','g','liter','ml') OR p.unit IS NULL
          GROUP BY p.id, p.name, p.unit
          ORDER BY quantity DESC
          LIMIT 8
        `
      : await prisma.$queryRaw`
          SELECT p.id, p.name, p.unit,
          COALESCE(SUM(si.quantity),0) as quantity,
          COALESCE(SUM(si.price),0) as revenue
          FROM "SaleItem" si
          JOIN "Sale" s ON s.id = si."saleId" AND s."deactivated" = false 
            AND s."inventoryId" = ${inventoryId}
            AND s."createdAt" BETWEEN ${from} AND ${to}
          JOIN "Product" p ON p.id = si."productId"
          WHERE p.unit NOT IN ('kg','g','liter','ml') OR p.unit IS NULL
          GROUP BY p.id, p.name, p.unit
          ORDER BY quantity DESC
          LIMIT 8
        `;

    const topProductsByWeight = (topProductsWeightRows || []).map((r) => ({
      id: r.id,
      name: r.name,
      unit: r.unit,
      quantity: Number(r.quantity),
      revenue: Number(r.revenue),
    }));

    const topProductsByNumber = (topProductsNumberRows || []).map((r) => ({
      id: r.id,
      name: r.name,
      unit: r.unit,
      quantity: Number(r.quantity),
      revenue: Number(r.revenue),
    }));

    // ---- 5) Payment methods ----
    const paymentRows = isSuper
      ? await prisma.$queryRaw`
          SELECT "paymentMode" as method, COUNT(*) as cnt, SUM("totalAmount") as total
          FROM "Sale"
          WHERE "deactivated" = false
          AND "createdAt" BETWEEN ${from} AND ${to}
          GROUP BY method
        `
      : await prisma.$queryRaw`
          SELECT "paymentMode" as method, COUNT(*) as cnt, SUM("totalAmount") as total
          FROM "Sale"
          WHERE "deactivated" = false
          AND "inventoryId" = ${inventoryId}
          AND "createdAt" BETWEEN ${from} AND ${to}
          GROUP BY method
        `;

    const paymentBreakdown = (paymentRows || []).map((r) => ({
      method: r.method,
      count: Number(r.cnt),
      value: Number(r.total),
    }));

    // ---- 6) Cashier performance ----
    const cashierRows = isSuper
      ? await prisma.$queryRaw`
          SELECT s."cashierId", u."firstName" || ' ' || COALESCE(u."lastName", '') as cashier_name,
          COUNT(s.id) as cnt, SUM(s."totalAmount") as total
          FROM "Sale" s
          LEFT JOIN "Cashier" c ON c.id = s."cashierId"
          LEFT JOIN "User" u ON u.id = c."userId"
          WHERE s."deactivated" = false AND s."createdAt" BETWEEN ${from} AND ${to}
          GROUP BY s."cashierId", cashier_name
          ORDER BY total DESC
          LIMIT 8
        `
      : await prisma.$queryRaw`
          SELECT s."cashierId", u."firstName" || ' ' || COALESCE(u."lastName", '') as cashier_name,
          COUNT(s.id) as cnt, SUM(s."totalAmount") as total
          FROM "Sale" s
          LEFT JOIN "Cashier" c ON c.id = s."cashierId"
          LEFT JOIN "User" u ON u.id = c."userId"
          WHERE s."deactivated" = false AND s."inventoryId" = ${inventoryId} 
          AND s."createdAt" BETWEEN ${from} AND ${to}
          GROUP BY s."cashierId", cashier_name
          ORDER BY total DESC
          LIMIT 8
        `;

    const cashierPerformance = (cashierRows || []).map((r) => ({
      cashierId: r.cashierId,
      cashierName: r.cashier_name,
      count: Number(r.cnt),
      total: Number(r.total),
    }));

    // ---- 7) Category sales ----
    const categoryRows = isSuper
      ? await prisma.$queryRaw`
          SELECT cat.id as category_id, cat.name as category_name, COALESCE(sum(si.price),0) as total
          FROM "SaleItem" si
          JOIN "Sale" s ON s.id = si."saleId" AND s."deactivated" = false AND s."createdAt" BETWEEN ${from} AND ${to}
          JOIN "Product" p ON p.id = si."productId"
          JOIN "Category" cat ON cat.id = p."categoryId"
          GROUP BY cat.id, cat.name
          ORDER BY total DESC
          LIMIT 10
        `
      : await prisma.$queryRaw`
          SELECT cat.id as category_id, cat.name as category_name, COALESCE(sum(si.price),0) as total
          FROM "SaleItem" si
          JOIN "Sale" s ON s.id = si."saleId" AND s."deactivated" = false 
            AND s."inventoryId" = ${inventoryId}
            AND s."createdAt" BETWEEN ${from} AND ${to}
          JOIN "Product" p ON p.id = si."productId"
          JOIN "Category" cat ON cat.id = p."categoryId"
          GROUP BY cat.id, cat.name
          ORDER BY total DESC
          LIMIT 10
        `;

    const categorySales = (categoryRows || []).map((r) => ({
      categoryId: r.category_id,
      categoryName: r.category_name,
      total: Number(r.total),
    }));

    // ---- 8) Role-based counts ----
    const cashierCount = await prisma.cashier.count({
      where: {
        ...(isSuper ? {} : { inventoryId }), // superadmin sees all, others only their inventory
      },
    });
    const inventoryCount = isSuper ? await prisma.inventory.count() : null;
    const userCount = isSuper ? await prisma.user.count() : null;

    const inventorySalesRows = isSuper
      ? await prisma.$queryRaw`
          SELECT i.id as inventory_id, i.name as inventory_name,
          COALESCE(sum(s."totalAmount"),0) as total
          FROM "Inventory" i
          LEFT JOIN "Sale" s ON s."inventoryId" = i.id AND s."deactivated" = false
            AND s."createdAt" BETWEEN ${from} AND ${to}
          GROUP BY i.id, i.name
          ORDER BY total DESC
          LIMIT 20
        `
      : [];

    const inventorySales = (inventorySalesRows || []).map((r) => ({
      inventoryId: r.inventory_id,
      inventoryName: r.inventory_name,
      total: Number(r.total),
    }));

    const inactiveRows = isSuper
      ? await prisma.$queryRaw`
          SELECT i.id, i.name
          FROM "Inventory" i
          LEFT JOIN (
            SELECT DISTINCT "inventoryId"
            FROM "Sale"
            WHERE "createdAt" >= NOW() - INTERVAL '30 days'
            AND "deactivated" = false
          ) s_recent ON s_recent."inventoryId" = i.id
          WHERE s_recent."inventoryId" IS NULL
          LIMIT 20
        `
      : [];

    const inactiveInventories = (inactiveRows || []).map((r) => ({
      id: r.id,
      name: r.name,
    }));

    const newUsersRegisteredLast30Days = isSuper
      ? await prisma.user.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
          },
        })
      : null;

    // ---- Respond ----
    return res.status(200).json({
      totalSalesAmount,
      totalSalesCount,
      avgSaleValue,
      totalDiscounts,
      recentSales: recentSales.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        totalAmount: r.totalAmount,
        inventoryId: r.inventoryId,
        inventoryName: r.Inventory?.name ?? null,
        cashierId: r.cashierId,
        cashierName: r.Cashier?.User
          ? `${r.Cashier.User.firstName} ${r.Cashier.User.lastName ?? ''}`
          : null,
      })),
      salesTrend,
      topProductsByWeight,
      topProductsByNumber,
      paymentBreakdown,
      cashierPerformance,
      categorySales,
      cashierCount,
      ...(isSuper
        ? {
            inventoryCount,
            userCount,
            inventorySales,
            inactiveInventories,
            newUsersRegisteredLast30Days,
          }
        : {
            // for admin only
            totalDiscounts,
          }),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
