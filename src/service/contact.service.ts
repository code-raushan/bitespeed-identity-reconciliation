import { Precedence } from "../db/enums";
import { ContactRepository } from "../repository/contact.repository";
import logger from "../utils/logger.util";

interface IIdentifyReconciliationResponse {
    contact: {
        primaryContact: number,
        emails: string[],
        phoneNumbers: string[],
        secondaryContactIds: number[]
    }
}

class ContactService {
    constructor(private readonly _contactRepository: ContactRepository) { }

    async identityReconciliation(params: { email?: string, phoneNumber?: string }): Promise<IIdentifyReconciliationResponse | undefined> {
        const { email, phoneNumber } = params;

        try {
            const linkedContacts = await this._contactRepository.getLinkedContacts({ email, phoneNumber });

            if (!linkedContacts || linkedContacts.length === 0) {
                // if there is no any linked contact, we will create the first primary contact
                const newContact = await this._contactRepository.createPrimaryContact({ email, phoneNumber });
                if (!newContact) throw new Error("Failed to create new contact");

                return {
                    contact: {
                        primaryContact: newContact.id,
                        emails: newContact.email ? [newContact.email] : [],
                        phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                        secondaryContactIds: []
                    }
                };
            }
            const primaryContacts = linkedContacts.filter((contact) => contact.linkPrecedence === Precedence.primary);

            // if primary contact record is not available in the matching records, we will retrieve the primary contact from the secondary records's linkedId field
            if (primaryContacts.length === 0) {
                const secondaryContact = linkedContacts.find((contact) => contact.linkPrecedence === Precedence.secondary);
                if (!secondaryContact || !secondaryContact.linkedId) throw new Error("No secondary contact found");

                const primaryContact = await this._contactRepository.getPrimaryPrecedence(secondaryContact.linkedId);
                if (!primaryContact) throw new Error("No primary contact found");

                const secondaryContacts = await this._contactRepository.getSecondaryPrecedence(primaryContact.id);
                const secondaryContactIds = secondaryContacts.map((contact) => contact.id);
                const secondaryContactEmails = secondaryContacts.map((contact) => contact.email);
                const secondaryContactPhoneNumbers = secondaryContacts.map((contact) => contact.phoneNumber);

                return {
                    contact: {
                        primaryContact: primaryContact.id,
                        emails: Array.from(new Set([
                            primaryContact.email, ...secondaryContactEmails
                        ].filter(email => email !== null) as string[])),
                        phoneNumbers: Array.from(new Set([
                            primaryContact.phoneNumber, ...secondaryContactPhoneNumbers
                        ].filter(phoneNumber => phoneNumber !== null) as string[])),
                        secondaryContactIds
                    }
                };

            }

            if (primaryContacts.length === 1) {
                const secondaryContacts = await this._contactRepository.getSecondaryPrecedence(primaryContacts[0].id);

                // creating secondary contact if a request body field does not match with primary contact field
                if (primaryContacts[0].email !== email || primaryContacts[0].phoneNumber !== phoneNumber) {
                    const secondaryContact = await this._contactRepository.createSecondaryContact({ email, phoneNumber, linkedId: primaryContacts[0].id });
                    if (!secondaryContact) throw new Error("Failed to create secondary contact");

                    return {
                        contact: {
                            primaryContact: primaryContacts[0].id,
                            emails: Array.from(new Set([
                                primaryContacts[0].email,
                                secondaryContact.email
                            ].filter(Boolean) as string[])),
                            phoneNumbers: Array.from(new Set([
                                primaryContacts[0].phoneNumber,
                                secondaryContact.phoneNumber
                            ].filter(Boolean) as string[])),
                            secondaryContactIds: [secondaryContact.id]
                        }
                    };
                }

                // otherwise return primary contact and secondary contacts
                const secondaryContactIds = secondaryContacts.map((contact) => contact.id);
                const secondaryContactEmails = secondaryContacts.map((contact) => contact.email);
                const secondaryContactPhoneNumbers = secondaryContacts.map((contact) => contact.phoneNumber);

                return {
                    contact: {
                        primaryContact: primaryContacts[0].id,
                        emails: Array.from(new Set([
                            primaryContacts[0].email,
                            ...secondaryContactEmails
                        ].filter(Boolean) as string[])),
                        phoneNumbers: Array.from(new Set([
                            primaryContacts[0].phoneNumber,
                            ...secondaryContactPhoneNumbers
                        ].filter(Boolean) as string[])),
                        secondaryContactIds
                    }
                };

            }

            // if there are multiple primary contacts for the request body parameters, will keep the oldest as the primary contact and make rest secondary
            if (primaryContacts.length > 1) {
                const sortedPrimaryContacts = await this._contactRepository.sortPrimaryContacts({ email, phoneNumber });

                const primaryContact = sortedPrimaryContacts[0];
                let notUpdatedContacts = sortedPrimaryContacts.slice(1);

                let updatePrecedencePromises = [];

                // updating rest contacts as secondary
                for (const contact of notUpdatedContacts) {
                    updatePrecedencePromises.push(this._contactRepository.updatePrimaryContact({ id: contact.id, linkedId: primaryContact.id }));
                }

                await Promise.all(updatePrecedencePromises).catch((err) => {
                    logger.error(`Error - ${err}`);
                    throw new Error("failed to update the contact")
                });


                // getting secondary contacts
                const secondaryContacts = await this._contactRepository.getSecondaryPrecedence(primaryContact.id);

                const secondaryContactIds = secondaryContacts.map((contact) => contact.id);
                const secondaryContactEmails = secondaryContacts.map((contact) => contact.email);
                const secondaryContactPhoneNumbers = secondaryContacts.map((contact) => contact.phoneNumber);

                return {
                    contact: {
                        primaryContact: primaryContact.id,
                        emails: Array.from(new Set([
                            primaryContact.email,
                            ...secondaryContactEmails
                        ].filter(Boolean) as string[])),
                        phoneNumbers: Array.from(new Set([
                            primaryContact.phoneNumber,
                            ...secondaryContactPhoneNumbers
                        ].filter(Boolean) as string[])),
                        secondaryContactIds
                    }
                };
            }
        } catch (error) {
            logger.error(`Error - ${error}`);
            throw new Error("Operation failed");
        }
    }
}

export default new ContactService(new ContactRepository());