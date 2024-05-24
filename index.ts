import express from 'express';
import { AppDataSource } from './src/data-source';

const app = express();


AppDataSource.initialize().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch(error => console.log(error));
