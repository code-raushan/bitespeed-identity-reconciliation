import { db } from "../db";
import { Precedence } from "../db/enums";

export class ContactRepository {
    private _db = db;

    async getLinkedContacts(params: { email?: string, phoneNumber?: string }) {
        const { email, phoneNumber } = params;

        if (email && phoneNumber) {
            return this._db
                .selectFrom("Contact")
                .selectAll()
                .where((eb) => eb.or([
                    eb("Contact.email", "=", email),
                    eb("Contact.phoneNumber", "=", phoneNumber),
                ]))
                .execute();
        } else if (email) {
            return this._db
                .selectFrom("Contact")
                .selectAll()
                .where("Contact.email", "=", email)
                .execute();
        } else if (phoneNumber) {
            return this._db
                .selectFrom("Contact")
                .selectAll()
                .where("Contact.phoneNumber", "=", phoneNumber)
                .execute();
        }

        // return this._db
        //     .selectFrom("Contact")
        //     .selectAll()
        //     .where((eb) => eb.or([
        //         eb("Contact.email", "=", email),
        //         eb("Contact.phoneNumber", "=", phoneNumber),
        //     ]))
        //     .execute();
    }

    async createPrimaryContact(params: { email?: string, phoneNumber?: string }) {
        const { email, phoneNumber } = params;

        return this._db
            .insertInto("Contact")
            .values({
                email,
                phoneNumber,
                linkPrecedence: Precedence.primary,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returningAll()
            .executeTakeFirst();
    }

    async createSecondaryContact(params: { email?: string, phoneNumber?: string, linkedId: number }) {
        const { email, phoneNumber, linkedId } = params;

        return this._db
            .insertInto("Contact")
            .values({
                email,
                phoneNumber,
                linkPrecedence: Precedence.secondary,
                linkedId,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returningAll()
            .executeTakeFirst();
    }

    async getSecondaryPrecedence(linkedId: number) {
        return this._db
            .selectFrom("Contact")
            .selectAll()
            .where("linkPrecedence", "=", Precedence.secondary)
            .where("Contact.linkedId", "=", linkedId)
            .execute();
    }

    async getPrimaryPrecedence(linkedId: number) {
        return this._db
            .selectFrom("Contact")
            .selectAll()
            .where("linkPrecedence", "=", Precedence.primary)
            .where("Contact.id", "=", linkedId)
            .executeTakeFirst();
    }

    async sortPrimaryContacts(params: { email?: string, phoneNumber?: string }) {
        const { email, phoneNumber } = params;
        return this._db
            .selectFrom("Contact")
            .selectAll()
            .where((eb) => eb.or({ email, phoneNumber }))
            .where("linkPrecedence", "=", Precedence.primary)
            .orderBy("Contact.createdAt", "asc")
            .execute();
    }

    async updatePrimaryContact(params: { id: number, linkedId: number }) {
        const { id, linkedId } = params;
        return this._db
            .updateTable("Contact")
            .set({
                linkedId,
                linkPrecedence: Precedence.secondary,
                updatedAt: new Date(),
            })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();
    }
}