import express from 'express';
import cors from 'cors';

import chatHandler from './api/chat.js';
import loginHandler from './api/auth/login.js';
import logoutHandler from './api/auth/logout.js';
import sessionHandler from './api/auth/session.js';
import kutatasokHandler from './api/kutatasok.js';
import meresekHandler from './api/meresek.js';
import fajazonositasHandler from './api/fajazonositas.js';
import cikkekHandler from './api/cikkek.js';
import egyeniGocpontokHandler from './api/egyeni-gocpontok.js';
import uploadHandler from './api/upload.js';
import exportHandler from './api/export.js';
import trashHandler from './api/trash.js';
import { uploadsDir } from './api/_lib/storage.js';

const app = express();
app.use(cors());
app.use('/api/upload', express.raw({ type: '*/*', limit: '10mb' }));
app.use(express.json());
app.use(express.static('dist')); // vite build kimenete
app.use('/uploads', express.static(uploadsDir())); // feltöltött PDF-ek/képek

app.post('/api/chat', chatHandler);
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/logout', logoutHandler);
app.get('/api/auth/session', sessionHandler);

app.get('/api/kutatasok', kutatasokHandler);
app.post('/api/kutatasok', kutatasokHandler);
app.patch('/api/kutatasok', kutatasokHandler);
app.delete('/api/kutatasok', kutatasokHandler);

app.get('/api/meresek', meresekHandler);
app.post('/api/meresek', meresekHandler);
app.patch('/api/meresek', meresekHandler);
app.delete('/api/meresek', meresekHandler);

// A CRUD végpontok mind a négy metódust ugyanazon a handleren kezelik.
for (const [path, handler] of [
  ['/api/fajazonositas', fajazonositasHandler],
  ['/api/cikkek', cikkekHandler],
  ['/api/egyeni-gocpontok', egyeniGocpontokHandler],
]) {
  app.get(path, handler);
  app.post(path, handler);
  app.patch(path, handler);
  app.delete(path, handler);
}

app.post('/api/upload', uploadHandler);

app.get('/api/export', exportHandler);
app.get('/api/trash', trashHandler);
app.post('/api/trash', trashHandler);
app.delete('/api/trash', trashHandler);

app.listen(3000, () => console.log('Szerver fut: http://localhost:3000'));
