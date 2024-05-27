import express from 'express';
import { AppDataSource } from './src/data-source';
import contactRouter from './src/router/contactRouter';

const app = express();
app.use(express.json());

app.use('/api', contactRouter);


AppDataSource.initialize().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch(error => console.log(error));
