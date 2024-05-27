import { Contact } from '../entity/contact';
import { AppDataSource } from '../data-source';
import { Repository } from 'typeorm';

const contactRepository: Repository<Contact> = AppDataSource.getRepository(Contact);

export const identifyContact = async (email: string | null, phoneNumber: string | null) => {
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

  const existingContacts = await query.getMany();

  let primaryContact: any;
  let secondaryContacts: Contact[] = [];

  // Check if there's an existing contact with both the same email and phone number
  let duplicateContact: Contact | undefined;
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
      const linkedContacts = await contactRepository.createQueryBuilder('contact')
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
    primaryContact = new Contact();
    primaryContact.email = email;
    primaryContact.phoneNumber = phoneNumber;
    primaryContact.linkPrecedence = 'primary';
    await contactRepository.save(primaryContact);
  } else {
    // Determine the primary contact and secondary contacts
    existingContacts.forEach(contact => {
      if (contact.linkPrecedence === 'primary') {
        primaryContact = contact;
      } else {
        secondaryContacts.push(contact);
      }
    });

    // If no primary contact was found, make the first contact the primary
    if (!primaryContact) {
      primaryContact = existingContacts[0];
      primaryContact.linkPrecedence = 'primary';
      await contactRepository.save(primaryContact);
      secondaryContacts = existingContacts.slice(1);
    }

    // Link new information as a secondary contact if necessary
    const newContact:any = new Contact();
    newContact.email = email;
    newContact.phoneNumber = phoneNumber;
    newContact.linkedId = primaryContact.id;
    newContact.linkPrecedence = 'secondary';
    await contactRepository.save(newContact);
    secondaryContacts.push(newContact);
  }

  return {
    primaryContactId: primaryContact.id,
    emails: [primaryContact.email, ...secondaryContacts.map(sc => sc.email)].filter(Boolean),
    phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(sc => sc.phoneNumber)].filter(Boolean),
    secondaryContactIds: secondaryContacts.map(sc => sc.id)
  };
};
