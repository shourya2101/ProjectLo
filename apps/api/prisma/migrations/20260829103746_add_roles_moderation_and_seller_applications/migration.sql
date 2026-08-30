-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BUYER',
ADD COLUMN     "suspendedReason" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "rejectionReason" TEXT;
ALTER TABLE "Product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Product" 
ALTER COLUMN "status" TYPE "ProductStatus" 
USING (
  CASE 
    WHEN "status" = 'Available' THEN 'APPROVED'::"ProductStatus"
    WHEN "status" = 'Sold Out' THEN 'APPROVED'::"ProductStatus"
    WHEN "status" = 'Deleted' THEN 'DELETED'::"ProductStatus"
    WHEN "status" = 'APPROVED' THEN 'APPROVED'::"ProductStatus"
    WHEN "status" = 'REJECTED' THEN 'REJECTED'::"ProductStatus"
    ELSE 'PENDING_REVIEW'::"ProductStatus"
  END
);
ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW'::"ProductStatus";

-- CreateTable
CREATE TABLE "SellerApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "studentProof" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SellerApplication" ADD CONSTRAINT "SellerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
