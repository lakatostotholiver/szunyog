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

Ha nem Vercelt használsz, kézzel kell elindítanod a szervert. A Groq API-kulcsát a helyi fejlesztéshez hasonlóan a `.env` fájlban kell tárolnod.

```bash
npm install express cors dotenv
npm run build
node server.js
```

## Éles telepítés – Docker

Ha a helyben telepített Node.js helyett egy konténert használnál, pár parancssal elindítható az alkalmazás – anélkül, hogy klónoznod kéne a repót, mert a Docker megteszi neked:

```bash
docker build -t szunyog github.com/lakatostotholiver/szunyog
docker run -it -e GROQ_API_KEY=<API-kulcs> -p 3000:3000 szunyog
```
(az `<API-kulcs>`-ot értelemszerűen helyettesítve – `.env` fájl nem kell, a parancssori paraméter helyettesíti).

### Docker Compose

Bár egyetlen konténernél a Docker Compose igazi előnyei nem mutatkoznak meg, használható az is, a következő `docker-compose.yml` fájl létrehozásával (itt sem kell klónozni, lehet ez az egyetlen fájl a könyvtárban):

```yaml
services:
  app:
    build: https://github.com/lakatostotholiver/szunyog
    ports:
      - '3000:3000'
    environment:
      GROQ_API_KEY: '<API-kulcs>'
```
(az `<API-kulcs>`-ot itt is értelemszerűen helyettesítve).

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
