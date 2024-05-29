import express from 'express';
import { AppDataSource } from './data-source';
import { Contact } from './entity/contact';
import contactRouter from './router/contactRouter';

const app = express();
app.use(express.json());

app.use('/', contactRouter);

// app.post('/identify', async (req, res) => {
//   const { email, phoneNumber } = req.body;

//   console.log('Email:', email); // Debug: log email
//   console.log('PhoneNumber:', phoneNumber); // Debug: log phoneNumber

//   if (!email && !phoneNumber) {
//     return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
//   }

//   const contactRepository = AppDataSource.getRepository(Contact);

//   // Find existing contacts with the same email or phoneNumber
//  // Find existing contacts with the same email or phoneNumber
// // const existingContacts = await contactRepository.find({
// //   where: email ? { email } : phoneNumber ? { phoneNumber } : {}
// // });

// const query = contactRepository.createQueryBuilder('contact');

// if (!email) {
//   query.orWhere('contact.phoneNumber = :phoneNumber', { phoneNumber });
// }
// if (!phoneNumber) {
//   query.orWhere('contact.email = :email', { email });
// }
// if (email) {
//   query.orWhere('contact.email = :email', { email });
// }
// if (phoneNumber) {
//   query.orWhere('contact.phoneNumber = :phoneNumber', { phoneNumber });
// }
// // Add the condition for linkPrecedence
// query.orWhere('contact.linkPrecedence = :linkPrecedence', { linkPrecedence: 'primary' });

// // Execute the query
// const existingContacts = await query.getMany();

//   console.log('Existing Contacts:', existingContacts); // Debug: log existing contacts

//   let primaryContact: Contact | undefined;
//   let secondaryContacts: Contact[] = [];

//   // Check if there's an existing contact with both the same email and phone number
//   let duplicateContact: Contact | undefined;
//   for (const contact of existingContacts) {
//     if ((!email || contact.email == email) && (!phoneNumber || contact.phoneNumber == phoneNumber)) {
//       duplicateContact = contact;
//       break;
//     }
//   }

//   console.log('Duplicate Contact:', duplicateContact); // Debug: log duplicate contact
//   // if (duplicateContact) {
//   //   primaryContact = duplicateContact.linkPrecedence === 'primary' ? duplicateContact : existingContacts.find(c => c.id == duplicateContact.linkedId);
//   //   secondaryContacts = existingContacts.filter(c => c.linkedId == primaryContact?.id && c.id != primaryContact.id);
//   //   console.log("primaryContact---", primaryContact)
//   //   const response = {
//   //     contact: {
//   //       primaryContactId: primaryContact?.id,
//   //       emails: [duplicateContact?.email, ...secondaryContacts.map(sc => sc.email)].filter(Boolean),
//   //       phoneNumbers: [duplicateContact?.phoneNumber, ...secondaryContacts.map(sc => sc.phoneNumber)].filter(Boolean),
//   //       secondaryContactIds: secondaryContacts.map(sc => sc.id)
//   //     }
//   //   };

//   //   return res.status(200).json(response);
//   // }
 
//   if (duplicateContact) {
//     // Find the primary contact by checking if the duplicate contact is primary or finding its linked primary contact
//     for (const contact of existingContacts) {
//       if (contact.linkPrecedence === 'primary') {
//         primaryContact = contact;
//         break;
//       }
//     }
  
//     // If no primary contact is found, use the duplicate contact itself
//     if (!primaryContact) {
//       primaryContact = duplicateContact;
//     }
//     console.log("primaryContact",primaryContact)

//  // Manually populate the secondaryContacts array without using filter
//  for (const contact of existingContacts) {
//   if (contact.linkedId == primaryContact?.id && contact.id != primaryContact.id) {
//     secondaryContacts.push(contact);
//   }
// }  
//   // Additional query for linked contacts if secondaryContacts is empty
//   if (secondaryContacts.length === 0 && primaryContact) {
//     const linkedContacts = await contactRepository.createQueryBuilder('contact')
//       .where('contact.linkedId = :linkedId', { linkedId: primaryContact.id })
//       .getMany();

//     secondaryContacts = linkedContacts;
//   }
  
// console.log("secondaryContacts",secondaryContacts.length)
//     const response = {
//       contact: {
//         primaryContactId: primaryContact?.id,
//         emails: [primaryContact?.email, ...secondaryContacts.map(sc => sc.email)].filter(Boolean),
//         phoneNumbers: [primaryContact?.phoneNumber, ...secondaryContacts.map(sc => sc.phoneNumber)].filter(Boolean),
//         secondaryContactIds: secondaryContacts.map(sc => sc.id)
//       }
//     };
  
//     return res.status(200).json(response);
//   }

//   if (existingContacts.length === 0) {
//     // No existing contact, create a new primary contact
//     primaryContact = new Contact();
//     primaryContact.email = email;
//     primaryContact.phoneNumber = phoneNumber;
//     primaryContact.linkPrecedence = 'primary';
//     await contactRepository.save(primaryContact);
//   } else {
//     // Determine the primary contact and secondary contacts
//     existingContacts.forEach(contact => {
//       if (contact.linkPrecedence === 'primary') {
//         primaryContact = contact;
//       } else {
//         secondaryContacts.push(contact);
//       }
//     });

//     // If no primary contact was found, make the first contact the primary
//     if (!primaryContact) {
//       primaryContact = existingContacts[0];
//       primaryContact.linkPrecedence = 'primary';
//       await contactRepository.save(primaryContact);
//       secondaryContacts = existingContacts.slice(1);
//     }

//     // Link new information as a secondary contact if necessary
//     const newContact = new Contact();
//     newContact.email = email;
//     newContact.phoneNumber = phoneNumber;
//     newContact.linkedId = primaryContact.id;
//     newContact.linkPrecedence = 'secondary';
//     await contactRepository.save(newContact);
//     secondaryContacts.push(newContact);
//   }

//   // Prepare the response data
//   const response = {
//     contact: {
//       primaryContactId: primaryContact.id,
//       emails: [primaryContact.email, ...secondaryContacts.map(sc => sc.email)].filter(Boolean),
//       phoneNumbers: [primaryContact.phoneNumber, ...secondaryContacts.map(sc => sc.phoneNumber)].filter(Boolean),
//       secondaryContactIds: secondaryContacts.map(sc => sc.id)
//     }
//   };

//   return res.status(200).json(response);
// });

AppDataSource.initialize().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch(error => console.log(error));
