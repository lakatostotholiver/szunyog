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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob tároló – ettől lesznek az adatok Vercelen is tartósak | a Vercel automatikusan beállítja a Blob store csatolásakor |
| `DIKTALAS_DATA_DIR` | (opcionális, csak Blob token nélkül) hova mentse a JSON adatokat és feltöltött fájlokat | te választod |

---

## Kollégáknak – Admin felület

Nincs Firebase, nincs személyenkénti fiók – **egyetlen közös jelszóval** (`DIKTALAS_PASSWORD`) lehet belépni egy saját, kis szerveroldali munkamenet-kezelővel (HMAC-aláírt cookie, `api/_lib/session.js`). A jelszót ismerő bárki hozzáfér az admin felülethez.

- Bejelentkezés: `/admin-belepes` (a nyilvános oldal lábléce is linkel rá: "Kollégáknak – admin belépés")
- Admin felület: `/admin` – innen érhetők el az egyes szerkeszthető szekciók

### Mit lehet szerkeszteni?

**Mérési körök** (`/admin/meresek`) – a NO MOSQUITO jelentések adatai, amiket eddig fejlesztőnek kellett kézzel kódba írnia:
- bejárás / jelentés / közzététel dátuma,
- **helyszínenként** (mind a 13 mintavételi pont) lárvaszám, állapot (Tiszta / Kezelés / Száraz) és fejlettségi stádium (L1–L4),
- összefoglaló szöveg,
- **PDF jelentés vagy kép csatolása** (max. 10 MB) – ez letölthető linkként jelenik meg a Mérések oldalon.

Amit itt elmentesz, **azonnal megjelenik a Főoldalon és a Mérések oldalon** (a lapok percenként frissítenek), és a KPI-számok (tiszta helyszínek, kezelések száma, bejárások száma) is automatikusan újraszámolódnak. A 2026-os szezon korábbi körei továbbra is a kódban vannak (`src/data/monitoringData.js`); a két forrás dátum szerint összefésülve jelenik meg.

**Gócpont-kutatások** (`/admin/gocpont-kutatasok`) – terepi csípésszámlálásos mérések rögzítése, **szerkesztése és törlése** (dátum, helyszín, csípésszám, befogott egyedszám, keltetőhelyek, kezelés, lárvagyűjtés, megjegyzés). A **Mérések** oldal "Gócpont-kutatások" szekciójában jelenik meg.

### Hol tárolódnak az adatok?

A tárolás automatikusan vált a környezet szerint (`api/_lib/storage.js`):

| Környezet | Tároló | Tartós? |
|---|---|---|
| Vercel, `BLOB_READ_WRITE_TOKEN` beállítva | Vercel Blob | ✅ igen |
| Saját szerver / VPS (`node server.js`) | JSON fájlok a `DIKTALAS_DATA_DIR` mappában | ✅ igen |
| Vercel, Blob token **nélkül** | ideiglenes fájlrendszer | ❌ **elveszik** |

> **Fontos:** Vercelen a Blob store csatolása nélkül a rögzített adatok elvesznek a következő deploynál. A csatolás a Vercel dashboardon: **Storage → Create/Connect Blob store → csatold a projekthez** – ezután a `BLOB_READ_WRITE_TOKEN` automatikusan bekerül a projekt környezeti változói közé, és egy újradeploy után minden tartós lesz.

### Egyszeri szerverbeállítás

1. Állítsd be a `DIKTALAS_PASSWORD`-öt (Vercelen: Project Settings → Environment Variables; self-hostnál a `.env`-ben) – ez a közös jelszó, amivel a kollégák belépnek.
2. Vercelen: csatolj egy Blob store-t (lásd fentebb). Self-hostnál: opcionálisan add meg a `DIKTALAS_DATA_DIR`-t egy állandó, a projekt mappájától független útvonalra.
3. Vercelen a környezeti változók módosítása után **újra kell deployolni**; self-hostnál `npm run build` + a szerver (újra)indítása.

Fontos: a jelszó **szerveroldalon** él (nincs `VITE_` előtag), tehát bármikor megváltoztatható és a szerver újraindításával azonnal érvényes – nem kell hozzá újra buildelni a kódot.

---

## Projekt struktúra

```
api/
  chat.js          – BékaBot AI backend (Vercel serverless function / server.js route)
  meresek.js       – Mérési körök: lista (GET), felvitel (POST), szerkesztés (PATCH), törlés (DELETE)
  kutatasok.js     – Gócpont-kutatás: lista (GET), rögzítés (POST), szerkesztés (PATCH), törlés (DELETE)
  upload.js        – PDF/kép feltöltés (max. 10 MB, típusellenőrzéssel)
  auth/
    login.js, logout.js, session.js – admin közös jelszavas belépés (cookie session)
  _lib/
    session.js          – Session cookie aláírás/ellenőrzés (HMAC)
    storage.js          – Tároló absztrakció: Vercel Blob vagy lokális JSON fájl
    meresekStore.js     – Mérési körök adattárolása
    kutatasokStore.js   – Gócpont-kutatások adattárolása
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
    meresek.js           – Mérési körök CRUD + fájlfeltöltés (saját API)
    gocpontKutatas.js    – Gócpont-kutatás bejegyzések CRUD (saját API)
    useAllMeasurements.js – Kódban lévő + admin felületen felvitt mérések összefésülése
  pages/
    AdminLoginPage.jsx      – /admin-belepes
    AdminPage.jsx           – /admin (admin felület kezdőlap, szekciók)
    AdminMeresekPage.jsx    – /admin/meresek (mérési körök + PDF feltöltés)
    AdminKutatasokPage.jsx  – /admin/gocpont-kutatasok (rögzítés + szerkesztés + törlés)
  data/
    monitoringData.js – A 2026-os szezon korábbi mérései + felmérés/jelentés adatok
```

---

## Technológiák

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [React Router v7](https://reactrouter.com)
- [Groq API](https://groq.com) (llama-3.3-70b-versatile modell)
- CSS – egyedi design system, nincsenek UI framework függőségek
