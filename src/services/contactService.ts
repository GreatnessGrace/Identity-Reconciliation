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

};
