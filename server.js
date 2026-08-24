import express from 'express';
import cors from 'cors';

import chatHandler from './api/chat.js';
import loginHandler from './api/auth/login.js';
import logoutHandler from './api/auth/logout.js';
import sessionHandler from './api/auth/session.js';
import kutatasokHandler from './api/kutatasok.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // vite build kimenete
app.post('/api/chat', chatHandler);
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/logout', logoutHandler);
app.get('/api/auth/session', sessionHandler);
app.get('/api/kutatasok', kutatasokHandler);
app.post('/api/kutatasok', kutatasokHandler);
app.patch('/api/kutatasok', kutatasokHandler);
app.delete('/api/kutatasok', kutatasokHandler);

app.listen(3000, () => console.log('Szerver fut: http://localhost:3000'));
