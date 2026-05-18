# Csíplek Törökbálint! – Szúnyogmonitoring 2026

React + Vite alapú webalkalmazás Törökbálint Város szúnyogmonitoring programjához.  
Tartalmaz egy AI chatbotot (BékaBot 🐸), amely Groq API-n keresztül válaszol.

---

## Telepítés és helyi fejlesztés

```bash
# 1. Függőségek telepítése
npm install

# 2. Környezeti változók beállítása
copy .env.example .env
# Nyisd meg a .env fájlt és add meg a GROQ_API_KEY értékét

# 3. Fejlesztői szerver indítása
npm run dev
```

A Groq API kulcs ingyenesen igényelhető: https://console.groq.com

---

## Éles telepítés – Vercel (ajánlott)

> **Ez a legegyszerűbb módszer – az AI chatbot azonnal működik.**

1. Hozz létre egy fiókot a [vercel.com](https://vercel.com) oldalon
2. Kattints az **"Add New Project"** gombra, majd importáld ezt a GitHub repót
3. A **"Environment Variables"** résznél add meg:
   - `GROQ_API_KEY` = (a Groq console-ból másolt kulcs)
4. Kattints a **"Deploy"** gombra

A Vercel automatikusan felismeri a `api/chat.js` szerveroldali funkciót, a BékaBot azonnal működőképes lesz.

---

## Éles telepítés – Saját szerver (Node.js)

Ha nem Vercel-t használsz, a `api/chat.js` fájlt át kell alakítani egy Express.js routerrá.

```bash
npm install express cors dotenv
```

Készíts egy `server.js` fájlt:

```js
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import 'dotenv/config';

// Az api/chat.js handler logikáját ide kell másolni Express formátumba
// A handler(req, res) függvényt app.post('/api/chat', handler) alakban hívd meg

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // vite build kimenete

app.listen(3000, () => console.log('Szerver fut: http://localhost:3000'));
```

Majd build és indítás:

```bash
npm run build
node server.js
```

---

## Szükséges környezeti változók

| Változó | Leírás | Honnan? |
|---|---|---|
| `GROQ_API_KEY` | AI chatbot API kulcs | [console.groq.com](https://console.groq.com) (ingyenes) |

---

## Projekt struktúra

```
api/
  chat.js          – BékaBot AI backend (Vercel serverless function)
src/
  components/
    BekaBot.jsx    – AI chatbot UI
    Layout.jsx     – Navigáció + footer
    MonitoringTable.jsx
    FaqAccordion.jsx
  pages/           – Oldalsablonok
  data/
    monitoringData.js – Mérési adatok
```

---

## Technológiák

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [React Router v7](https://reactrouter.com)
- [Groq API](https://groq.com) (llama-3.3-70b-versatile modell)
- CSS – egyedi design system, nincsenek UI framework függőségek

