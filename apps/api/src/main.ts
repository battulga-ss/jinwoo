import express from 'express';
import * as path from 'path';
import cors from 'cors';
import fs from 'fs';
import { userRouter } from './modules/owner/routes';

const app = express();

// uploads folder үүсгэх
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static('uploads')); // ← нэмэх
app.use('/api/user', userRouter);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
