"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const contact_1 = require("../entity/contact");
const data_source_1 = require("../data-source");
const contactRepository = data_source_1.AppDataSource.getRepository(contact_1.Contact);
const identifyContact = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    // Build the query for finding existing contacts
    const query = contactRepository.createQueryBuilder('contact');
    if (email) {
        query.orWhere('contact.email = :email', { email });
    }
    if (phoneNumber) {
        query.orWhere('contact.phoneNumber = :phoneNumber', { phoneNumber });
    }
    // Add the condition for linkPrecedence
    query.orWhere('contact.linkPrecedence = :linkPrecedence', { linkPrecedence: 'primary' });
    const existingContacts = yield query.getMany();
    let primaryContact;
    let secondaryContacts = [];
    // Check if there's an existing contact with both the same email and phone number
    let duplicateContact;
    for (const contact of existingContacts) {
        if ((!email || contact.email === email) && (!phoneNumber || contact.phoneNumber === phoneNumber)) {
            duplicateContact = contact;
            break;
        }
    }
    if (duplicateContact) {
        // Find the primary contact by checking if the duplicate contact is primary or finding its linked primary contact
        for (const contact of existingContacts) {
            if (contact.linkPrecedence === 'primary') {
                primaryContact = contact;
                break;
            }
        }
        // If no primary contact is found, use the duplicate contact itself
        if (!primaryContact) {
            primaryContact = duplicateContact;
        }
        // populate the secondaryContacts 
        for (const contact of existingContacts) {
            if (contact.linkedId === primaryContact.id && contact.id !== primaryContact.id) {
                secondaryContacts.push(contact);
            }
        }
        // Additional query for linked contacts if secondaryContacts is empty
        if (secondaryContacts.length === 0 && primaryContact) {
            const linkedContacts = yield contactRepository.createQueryBuilder('contact')
                .where('contact.linkedId = :linkedId', { linkedId: primaryContact.id })
                .getMany();
            secondaryContacts = linkedContacts;
        }
        return {
            primaryContactId: primaryContact.id,
            emails: [primaryContact.email, ...secondaryContacts.map(sc => sc.email)].filter(Boolean),
            phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(sc => sc.phoneNumber)].filter(Boolean),
            secondaryContactIds: secondaryContacts.map(sc => sc.id)
        };
    }
    if (existingContacts.length === 0) {
        // No existing contact, create a new primary contact
        primaryContact = new contact_1.Contact();
        primaryContact.email = email;
        primaryContact.phoneNumber = phoneNumber;
        primaryContact.linkPrecedence = 'primary';
        yield contactRepository.save(primaryContact);
    }
    else {
        // Determine the primary contact and secondary contacts
        existingContacts.forEach(contact => {
            if (contact.linkPrecedence === 'primary') {
                primaryContact = contact;
            }
            else {
                secondaryContacts.push(contact);
            }
        });
        // If no primary contact was found, make the first contact the primary
        if (!primaryContact) {
            primaryContact = existingContacts[0];
            primaryContact.linkPrecedence = 'primary';
            yield contactRepository.save(primaryContact);
            secondaryContacts = existingContacts.slice(1);
        }
        // Link new information as a secondary contact if necessary
        const newContact = new contact_1.Contact();
        newContact.email = email;
        newContact.phoneNumber = phoneNumber;
        newContact.linkedId = primaryContact.id;
        newContact.linkPrecedence = 'secondary';
        yield contactRepository.save(newContact);
        secondaryContacts.push(newContact);
    }
    return {
        primaryContactId: primaryContact.id,
        emails: [primaryContact.email, ...secondaryContacts.map(sc => sc.email)].filter(Boolean),
        phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(sc => sc.phoneNumber)].filter(Boolean),
        secondaryContactIds: secondaryContacts.map(sc => sc.id)
    };
});
exports.identifyContact = identifyContact;
