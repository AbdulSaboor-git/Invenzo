-- Migration: code review fixes
-- Generated: 2026-05-31

-- SCH-02: Make Sale.createdAt non-nullable
-- (First check for NULLs: run this manually before applying if you have existing data)
-- SELECT COUNT(*) FROM "Sale" WHERE "createdAt" IS NULL;
-- UPDATE "Sale" SET "createdAt" = NOW() WHERE "createdAt" IS NULL;
ALTER TABLE "Sale" ALTER COLUMN "createdAt" SET NOT NULL;

-- SCH-03 / ARCH-04: Add purchasePrice snapshot column to SaleItem
-- Nullable so existing rows are unaffected
ALTER TABLE "SaleItem" ADD COLUMN IF NOT EXISTS "purchasePrice" DOUBLE PRECISION;
