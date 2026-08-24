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
| `DIKTALAS_PASSWORD` | Az admin felület közös jelszava (lásd lentebb) | te választod |
| `DIKTALAS_DATA_DIR` | (opcionális) hova mentse a gócpont-kutatás bejegyzéseket | te választod |

---

## Kollégáknak – Admin felület

Nincs Firebase, nincs személyenkénti fiók – **egyetlen közös jelszóval** (`DIKTALAS_PASSWORD`) lehet belépni egy saját, kis szerveroldali munkamenet-kezelővel (HMAC-aláírt cookie, `api/_lib/session.js`). A jelszót ismerő bárki hozzáfér az admin felülethez.

- Bejelentkezés: `/admin-belepes` (a nyilvános oldal lábléce is linkel rá: "Kollégáknak – admin belépés")
- Admin felület: `/admin` – innen érhetők el az egyes szerkeszthető szekciók
- **Gócpont-kutatások** (`/admin/gocpont-kutatasok`): terepi mérések rögzítése, **szerkesztése és törlése** (dátum, helyszín, csípésszám, befogott egyedszám, keltetőhelyek, kezelés, lárvagyűjtés, megjegyzés). Azonnal megjelenik a **Mérések** oldalon ("Gócpont-kutatások" szekció, percenként frissül).

A bejegyzések egy szerveroldali JSON fájlban élnek (`api/_lib/kutatasokStore.js`), nem adatbázisban.

### Egyszeri szerverbeállítás

1. A szerveren (Vercel esetén a projekt Environment Variables résznél, self-hostnál a `.env`-ben) állítsd be:
   - `DIKTALAS_PASSWORD` – a közös jelszó, amit a kollégák a bejelentkezéshez használnak
   - `DIKTALAS_DATA_DIR` – (opcionális) hova mentse a rögzített bejegyzéseket tartalmazó JSON fájlt. Ha üresen hagyod, a projekt mappáján **kívül**, egy szülőmappában (`../szunyog-diktalas-data`) tárolja – ez azért fontos, mert így egy friss GitHub-klónozásos frissítés sem törli el a korábban rögzített adatokat. Ha az informatikus más módon deployol (pl. mindig teljesen új mappába telepít, vagy Vercelt használ, ahol a fájlrendszer amúgy sem tartós), adj meg egy **állandó, a projekt mappájától független** elérési utat.
2. Vercelen a környezeti változó hozzáadása után **újra kell deployolni**; self-hostnál `npm run build` + a szerver (újra)indítása.

Fontos: ez a jelszó **szerveroldalon** él (nincs `VITE_` előtag), tehát bármikor megváltoztatható és a szerver újraindításával azonnal érvényes – nem kell hozzá újra buildelni a kódot.

> **Megjegyzés Vercelen futtatva:** a Vercel serverless függvényei nem tartós fájlrendszert használnak – minden deploy/újraindítás után elveszhet a `DIKTALAS_DATA_DIR`-ba mentett JSON fájl, ha nincs külön, tartós tárhelyre (pl. Vercel Blob, külső adatbázis) mutatva. Self-hosted (saját szerver/VPS) környezetben ez nem probléma.

---

## Projekt struktúra

```
api/
  chat.js          – BékaBot AI backend (Vercel serverless function / server.js route)
  kutatasok.js     – Gócpont-kutatás lista (GET), rögzítés (POST), szerkesztés (PATCH), törlés (DELETE)
  auth/
    login.js, logout.js, session.js – admin közös jelszavas belépés (cookie session)
  _lib/
    session.js          – Session cookie aláírás/ellenőrzés (HMAC)
    kutatasokStore.js    – JSON fájl alapú adattárolás a gócpont-kutatásokhoz
src/
  components/
    BekaBot.jsx    – AI chatbot UI
    Layout.jsx     – Navigáció + footer (admin belépés link a lábléc alján)
    MonitoringTable.jsx
    FaqAccordion.jsx
    GocpontKutatasTable.jsx – Percenként frissülő, publikus gócpont-kutatás táblázat (Mérések oldal)
    AdminProtectedRoute.jsx – Jelszavas belépést igénylő route wrapper (/admin, /admin/*)
  lib/
    adminAuth.js         – Admin belépés/kilépés/session-ellenőrzés (saját API)
    gocpontKutatas.js    – Gócpont-kutatás bejegyzések mentése/szerkesztése/törlése/olvasása (saját API)
  pages/
    AdminLoginPage.jsx     – /admin-belepes
    AdminPage.jsx           – /admin (admin felület kezdőlap, szekciók)
    AdminKutatasokPage.jsx  – /admin/gocpont-kutatasok (rögzítés + szerkesztés + törlés)
  data/
    monitoringData.js – Mérési adatok
```

---

## Technológiák

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [React Router v7](https://reactrouter.com)
- [Groq API](https://groq.com) (llama-3.3-70b-versatile modell)
- CSS – egyedi design system, nincsenek UI framework függőségek
