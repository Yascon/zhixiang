/*
  Warnings:

  - You are about to drop the `points_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `discount` on the `member_levels` table. All the data in the column will be lost.
  - You are about to drop the column `minSpent` on the `member_levels` table. All the data in the column will be lost.
  - You are about to drop the column `pointsRate` on the `member_levels` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `totalPoints` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `totalSpent` on the `members` table. All the data in the column will be lost.
  - Made the column `membershipFee` on table `member_levels` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "points_history";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- 先更新现有的NULL值为默认值
UPDATE "member_levels" SET "membershipFee" = 0 WHERE "membershipFee" IS NULL;

CREATE TABLE "new_member_levels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "membershipFee" REAL NOT NULL,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "maxProducts" INTEGER NOT NULL DEFAULT 100,
    "maxOrders" INTEGER NOT NULL DEFAULT 1000,
    "features" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_member_levels" ("createdAt", "description", "id", "membershipFee", "name", "updatedAt") SELECT "createdAt", "description", "id", "membershipFee", "name", "updatedAt" FROM "member_levels";
DROP TABLE "member_levels";
ALTER TABLE "new_member_levels" RENAME TO "member_levels";
CREATE TABLE "new_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "birthday" DATETIME,
    "address" TEXT,
    "company" TEXT,
    "levelId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "membershipFee" REAL,
    "membershipExpiry" DATETIME,
    "registeredBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "members_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "member_levels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "members_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_members" ("address", "birthday", "createdAt", "email", "gender", "id", "levelId", "memberNo", "membershipExpiry", "membershipFee", "name", "phone", "registeredBy", "status", "updatedAt") SELECT "address", "birthday", "createdAt", "email", "gender", "id", "levelId", "memberNo", "membershipExpiry", "membershipFee", "name", "phone", "registeredBy", "status", "updatedAt" FROM "members";
DROP TABLE "members";
ALTER TABLE "new_members" RENAME TO "members";
CREATE UNIQUE INDEX "members_memberNo_key" ON "members"("memberNo");
CREATE UNIQUE INDEX "members_phone_key" ON "members"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
