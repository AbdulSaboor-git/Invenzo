-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'cashier', 'superadmin');

-- CreateEnum
CREATE TYPE "public"."Unit" AS ENUM ('kg', 'g', 'litre', 'ml', 'pc', 'dozen', 'box', 'pack');

-- CreateEnum
CREATE TYPE "public"."PayMode" AS ENUM ('cash', 'credit', 'card', 'upi', 'other');

-- Fix liter → litre before casting
UPDATE "public"."Product" SET unit = 'litre' WHERE unit = 'liter';

-- AlterTable (safe cast, no data loss)
ALTER TABLE "public"."Product"
  ALTER COLUMN "unit" TYPE "public"."Unit" USING "unit"::"public"."Unit";

-- AlterTable Sale: drop default first, cast, then restore default
ALTER TABLE "public"."Sale"
  ALTER COLUMN "paymentMode" DROP DEFAULT;

ALTER TABLE "public"."Sale"
  ALTER COLUMN "paymentMode" TYPE "public"."PayMode" USING "paymentMode"::"public"."PayMode";

ALTER TABLE "public"."Sale"
  ALTER COLUMN "paymentMode" SET DEFAULT 'cash'::"public"."PayMode";

-- AlterTable (safe cast, no data loss)
ALTER TABLE "public"."User"
  ALTER COLUMN "role" TYPE "public"."Role" USING "role"::"public"."Role";