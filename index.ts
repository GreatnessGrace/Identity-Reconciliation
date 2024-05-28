import express from 'express';
import { AppDataSource } from './src/data-source';
import { Contact } from './src/entity/contact';
import contactRouter from './src/router/contactRouter';

const app = express();
app.use(express.json());

app.use('/', contactRouter);
AppDataSource.initialize().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch(error => console.log(error));
