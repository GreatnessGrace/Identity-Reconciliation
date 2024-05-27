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
