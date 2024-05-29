import express from 'express';
import { AppDataSource } from './data-source';
import { Contact } from './entity/contact';
import contactRouter from './router/contactRouter';

const app = express();
app.use(express.json());

app.use('/', contactRouter);

AppDataSource.initialize().then(() => {
  app.listen(10000 , () => {
    console.log('Server is running on port 3000');
  });
}).catch(error => console.log(error));
