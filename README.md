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
| `VITE_FIREBASE_API_KEY` | Firebase web app kulcs | [console.firebase.google.com](https://console.firebase.google.com) → Project settings → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ua. |
| `VITE_FIREBASE_PROJECT_ID` | Firebase projekt azonosító | ua. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | ua. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | ua. |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | ua. |

---

## Kollégáknak – terepi gócpont-riportok

A `Firebase` (Auth + Firestore + Storage) segítségével a meghívott kollégák be tudnak jelentkezni, és terepen felvihetnek egy riportot (helyszín a térképen + fotó + leírás). A riportok azonnal megjelennek egy publikus, **iframe-be ágyazható** nézetben is – így az éles oldalba be lehet illeszteni anélkül, hogy újra kellene deployolni a GitHubról.

### Egyszeri Firebase beállítás

1. Hozz létre egy projektet: [console.firebase.google.com](https://console.firebase.google.com)
2. **Authentication** → Sign-in method → engedélyezd az **Email/Password**-öt.
3. **Firestore Database** létrehozása (production mode).
4. **Storage** engedélyezése (a fotókhoz).
5. Project settings → Your apps → regisztrálj egy Web appot, majd a kapott config értékeket másold a `.env`-be (`VITE_FIREBASE_*` változók).
6. Állítsd be a security rule-okat:

   **Firestore rules:**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /reports/{reportId} {
         allow read: if true;
         allow create: if request.auth != null
           && request.resource.data.reporterUid == request.auth.uid
           && request.resource.data.description is string
           && request.resource.data.description.size() < 2000
           && request.resource.data.lat is number
           && request.resource.data.lng is number;
         allow update, delete: if false;
       }
     }
   }
   ```

   **Storage rules:**
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /reports/{uid}/{fileName} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == uid
           && request.resource.size < 8 * 1024 * 1024
           && request.resource.contentType.matches('image/.*');
       }
     }
   }
   ```

### Kolléga hozzáadása

Nincs nyilvános regisztráció – zárt, meghívásos rendszer. Egy kolléga felvétele: Firebase konzol → **Authentication → Users → Add user**, add meg az e-mail címét és egy jelszót, majd oszd meg vele. Ezután be tud lépni a `/bejelentkezes` oldalon.

### Használat

- `/bejelentkezes` – bejelentkezés a Firebase-ben felvett fiókkal
- `/riportok` – a kolléga saját nézete: eddigi riportok listája, "+ Új riport" gomb
- `/riportok/uj` – új riport felvétele (helyszín a térképen vagy GPS-szel, fotó, leírás)
- `/embed/gocpontok` – **publikus**, bejelentkezés nélkül elérhető, iframe-re optimalizált nézet (nincs navigáció/lábléc)

### Beágyazás az éles oldalon

Amint hozzáférsz az éles oldal HTML-jéhez, illeszd be:

```html
<iframe
  src="https://<teszt-szerver-domain>.vercel.app/embed/gocpontok"
  style="width:100%;min-height:640px;border:0"
  title="Szúnyoggócpont riportok"
></iframe>
```

Ezzel az éles oldal mindig a legfrissebb riportokat mutatja, anélkül hogy újra kellene deployolni.

---

## Kollégáknak – mérési adatok diktálása (`/diktalas`)

Ez **külön, Firebase nélküli** rendszer – egyetlen közös jelszóval (nem személyenkénti fiókkal) a biológus kollégák a `/diktalas` oldalon rögzíthetik a terepi gócpont-kutatásokat (dátum, helyszín, csípésszám, befogott egyedszám, keltetőhelyek, kezelés, lárvagyűjtés, megjegyzés). A bejegyzés a saját kis szerveroldali API-tokon (`api/kutatasok.js`) és egy JSON fájlon keresztül azonnal elérhető, a **Mérések** oldal percenként újralekéri.

- Bejelentkezés: `/diktalas-belepes` a közös jelszóval
- Rögzítés: `/diktalas`
- Megjelenítés: `/monitoring` (Mérések oldal, "Gócpont-kutatások" szekció)

### Egyszeri szerverbeállítás

1. A szerveren (ahol a `node server.js` fut) állítsd be a `.env`-ben:
   - `DIKTALAS_PASSWORD` – a közös jelszó, amit a kollégák a bejelentkezéshez használnak
   - `DIKTALAS_DATA_DIR` – (opcionális) hova mentse a rögzített bejegyzéseket tartalmazó JSON fájlt. Ha üresen hagyod, a projekt mappáján **kívül**, egy szülőmappában (`../szunyog-diktalas-data`) tárolja – ez azért fontos, mert így egy friss GitHub-klónozásos frissítés sem törli el a korábban rögzített adatokat. Ha az informatikus más módon deployol (pl. mindig teljesen új mappába telepít), adj meg egy **állandó, a projekt mappájától független** elérési utat (pl. `/var/data/szunyog-diktalas` vagy `C:\szunyog-diktalas-data`).
2. `npm run build` + a szerver (újra)indítása – ezután a `/diktalas-belepes`, `/diktalas` és az élő tábla működik.

Fontos: ez a jelszó **szerveroldalon** él (nincs `VITE_` előtag), tehát bármikor megváltoztatható a `.env`-ben és a szerver újraindításával – **nem kell hozzá újra buildelni** a kódot, ellentétben a Firebase-es beállításokkal.

---

## Projekt struktúra

```
api/
  chat.js          – BékaBot AI backend (Vercel serverless function / server.js route)
  kutatasok.js     – Gócpont-kutatás lista (GET) + rögzítés (POST), JSON fájl tárolással
  auth/
    login.js, logout.js, session.js – /diktalas közös jelszavas belépés (cookie session)
  _lib/
    session.js          – Session cookie aláírás/ellenőrzés (HMAC, Firebase nélkül)
    kutatasokStore.js    – JSON fájl alapú adattárolás a gócpont-kutatásokhoz
src/
  components/
    BekaBot.jsx    – AI chatbot UI
    Layout.jsx     – Navigáció + footer
    MonitoringTable.jsx
    FaqAccordion.jsx
    LocationPicker.jsx  – Térképes helyszínválasztó (Leaflet/OSM)
    ReportCard.jsx      – Riport kártya (fotó, leírás, dátum)
    GocpontKutatasTable.jsx – Percenként frissülő gócpont-kutatás táblázat
    ProtectedRoute.jsx  – Firebase bejelentkezést igénylő route wrapper (/riportok)
    DiktalasProtectedRoute.jsx – Jelszavas belépést igénylő route wrapper (/diktalas)
  context/
    AuthContext.jsx     – Firebase Auth állapot (/riportok)
  lib/
    firebase.js         – Firebase inicializálás (Auth, Firestore, Storage) – csak /riportok-hoz
    image.js             – Kliensoldali kép tömörítés feltöltés előtt
    diktalasAuth.js       – /diktalas belépés/kilépés/session-ellenőrzés (saját API)
    gocpontKutatas.js    – Gócpont-kutatás bejegyzések mentése/olvasása (saját API, nem Firestore)
  pages/           – Oldalsablonok (+ LoginPage, ReportsListPage, ReportsNewPage, EmbedReportsPage, DiktalasPage, DiktalasLoginPage)
  data/
    monitoringData.js – Mérési adatok
```

---

## Technológiák

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [React Router v7](https://reactrouter.com)
- [Groq API](https://groq.com) (llama-3.3-70b-versatile modell)
- CSS – egyedi design system, nincsenek UI framework függőségek
