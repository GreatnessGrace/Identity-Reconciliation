import { Request, Response } from 'express';
import { identifyContact } from '../services/contactService';

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;


  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
  }

  try {
    const contactData = await identifyContact(email, phoneNumber);
    return res.status(200).json({ contact: contactData });
  } catch (error) {
    console.error('Error identifying contact:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
