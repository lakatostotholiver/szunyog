import express from 'express';
import cors from 'cors';

import handler from './api/chat.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // vite build kimenete
app.post('/api/chat', handler);

app.listen(3000, () => console.log('Szerver fut: http://localhost:3000'));
