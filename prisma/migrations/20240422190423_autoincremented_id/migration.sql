-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "id" SET DEFAULT autoincrement(),
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "contact_id_seq";
