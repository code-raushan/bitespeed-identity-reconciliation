-- AlterTable
CREATE SEQUENCE contact_id_seq;
ALTER TABLE "Contact" ALTER COLUMN "id" SET DEFAULT nextval('contact_id_seq');
ALTER SEQUENCE contact_id_seq OWNED BY "Contact"."id";
