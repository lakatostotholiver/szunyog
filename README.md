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

Az admin felület **rejtett**: nincs rá link sehol a nyilvános oldalon, és az útvonala egy nehezen kitalálható számsor. (Ez nem helyettesíti a jelszót – az minden admin oldalon érvényben van –, csak megnehezíti a véletlen megtalálást.)

- Bejelentkezés: **`/801997752/belepes`**
- Admin felület: **`/801997752`** – innen érhetők el a szerkeszthető szekciók

> Az útvonal cseréjéhez elég egyetlen értéket átírni: `ADMIN_BASE` a [src/lib/adminRoutes.js](src/lib/adminRoutes.js) fájlban.

### Mit lehet szerkeszteni?

**Mérési körök** (`/801997752/meresek`) – a NO MOSQUITO jelentések adatai, amiket eddig fejlesztőnek kellett kézzel kódba írnia:
- bejárás / jelentés / közzététel dátuma,
- **helyszínenként** (mind a 13 mintavételi pont) lárvaszám, állapot (Tiszta / Kezelés / Száraz) és fejlettségi stádium (L1–L4),
- összefoglaló szöveg,
- **PDF jelentés vagy kép csatolása** (max. 10 MB) – ez letölthető linkként jelenik meg a Mérések oldalon.

Amit itt elmentesz, **azonnal megjelenik a Főoldalon és a Mérések oldalon** (a lapok percenként frissítenek), és a KPI-számok (tiszta helyszínek, kezelések száma, bejárások száma) is automatikusan újraszámolódnak.

**A 2026-os szezon addigi körei is szerkeszthetők**: a szerver első indulásakor a kódban rögzített méréseket (`src/data/monitoringData.js`) automatikusan betölti a CMS-be, így az ügyintéző ezeket is javíthatja vagy törölheti. A betöltés egyszer fut le – egy szándékosan törölt kör nem jön vissza magától.

**Gócpont-kutatások** (`/801997752/gocpont-kutatasok`) – terepi csípésszámlálásos mérések rögzítése, **szerkesztése és törlése** (dátum, helyszín, csípésszám, befogott egyedszám, keltetőhelyek, kezelés, lárvagyűjtés, megjegyzés). A **Mérések** oldal "Gócpont-kutatások" szekciójában jelenik meg.

**Egyéni gócpontok** (`/801997752/egyeni-gocpontok`) – háztartásoknál végzett vizsgálatok fotókkal. Az űrlap két, vizuálisan elkülönített blokkra oszlik:

- *Bizalmas – csak admin*: pontos cím, **térképen kijelölt koordináta** (OpenStreetMap), kapcsolattartó neve és telefonszáma, belső megjegyzés.
- *Megosztható*: városrész, ingatlan- és gócponttípus, lárvamennyiség, kezelés, tanulság, fényképek.

A nyilvános **Gócpont-példák** oldalra csak akkor kerül ki bármi, ha a *Megosztás mintaként* pipa be van téve, és akkor is **kizárólag a megosztható blokk** – a szűrés szerveroldalon történik (`publicView` az [api/egyeni-gocpontok.js](api/egyeni-gocpontok.js) fájlban), így a személyes adatok a böngészőbe se jutnak el.

**Fajazonosítás** (`/801997752/fajazonositas`) – CO₂-csapdázás és csípésszámlálás befogási eredményei, befogásonként több fajjal; az egyedszámok automatikusan összeadódnak. A **Mérések** oldal fajazonosítási táblázatában jelenik meg.

**Mentés és kuka** (`/801997752/mentes`) – „Mentés letöltése" gombbal az összes adat egyetlen JSON fájlba menthető. A törlés sehol nem végleges: a bejegyzés a **kukába** kerül, ahonnan **30 napig visszaállítható** (a csatolt fájlok is megmaradnak addig). Végleges törlés csak a kukából, külön megerősítéssel lehetséges.

> A mentés bizalmas: tartalmazza az egyéni gócpontok pontos címét, térképi koordinátáját és a kapcsolattartók adatait. Ne kerüljön e-mailbe vagy megosztott meghajtóra.

**Cikkek** (`/801997752/cikkek`) – tájékoztató cikkek címmel, bevezetővel, szöveggel és borítóképpel. A *Közzétéve* pipa nélkül piszkozat marad (a lakosság nem látja). A közzétett cikk megjelenik a **Hírek** oldalon (`/hirek`), saját cikkoldallal (`/hirek/<slug>`), és a főoldali hírfolyamban is, a dátuma szerinti helyen.

### Hírfolyam (Főoldal)

A "Legfrissebb események" lista egyetlen, **dátum szerint csökkenő sorrendbe rendezett** folyam: a mérési körök, az időszakos jelentés, a fajazonosítás és a tájékoztató kártyák együtt szerepelnek benne. Új mérési kör felvitele után az automatikusan a lista élére kerül – nincs kézzel karbantartott sorrend.

### Hol tárolódnak az adatok?

A tárolás automatikusan vált a környezet szerint (`api/_lib/storage.js`):

| Környezet | Tároló | Tartós? |
|---|---|---|
| Vercel, `BLOB_READ_WRITE_TOKEN` beállítva | Vercel Blob | ✅ igen |
| Saját szerver / VPS (`node server.js`) | JSON fájlok a `DIKTALAS_DATA_DIR` mappában | ✅ igen |
| Vercel, Blob token **nélkül** | ideiglenes fájlrendszer | ❌ **elveszik** |

> **Ismert korlát – Blob késleltetés.** A Vercel Blob objektumtároló, nem adatbázis: írás után a
> tartalom mérés szerint **~10 másodpercig** még a korábbi állapotot adhatja vissza egy MÁSIK
> szerverfüggvénynek. A gyakori folyamatok emiatt nem romlanak el (a mentés utáni lista ugyanabban
> a függvényben fut, és a szerver a saját írását 20 másodpercig memóriából szolgálja ki), de a
> szekció → *Mentés és kuka* váltásnál pár másodperces csúszás előfordulhat; erre a *Frissítés*
> gomb való. Ha ez zavaró, a végleges megoldás egy erősen konzisztens tároló (pl. Vercel KV /
> Redis) az `api/_lib/storage.js` mögé.

**Az éles oldalon ez már be van állítva:** a `szunyog-public` nevű, *public* hozzáférésű Blob store hozzá van csatolva a projekthez, a `BLOB_READ_WRITE_TOKEN` mindhárom környezetben megvan, és az adatok tartósan megmaradnak.

> A store-nak **public** hozzáférésűnek kell lennie, mert a feltöltött PDF jelentéseket a lakosság is letölti a Mérések oldalról. Egy *private* store esetén a feltöltés hibára fut (`Cannot use public access on a private store`).

Ha valaha új Blob store-t kell csatolni: Vercel dashboard → **Storage → Connect Store** – ezután a `BLOB_READ_WRITE_TOKEN` automatikusan bekerül a projekt környezeti változói közé, és egy újradeploy után él.

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
    meresekStore.js     – Mérési körök adattárolása (+ egyszeri seed betöltés)
    seed.js             – A kódban rögzített mérések betöltése a CMS-be
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
    adminRoutes.js       – Az admin felület (rejtett) útvonalai – EGY helyen cserélhető
    adminAuth.js         – Admin belépés/kilépés/session-ellenőrzés (saját API)
    meresek.js           – Mérési körök CRUD + fájlfeltöltés (saját API)
    gocpontKutatas.js    – Gócpont-kutatás bejegyzések CRUD (saját API)
    useAllMeasurements.js – Mérések betöltése a CMS-ből (kódbeli adatok tartalékként)
  pages/
    AdminLoginPage.jsx      – /801997752/belepes
    AdminPage.jsx           – /801997752 (admin felület kezdőlap, szekciók)
    AdminMeresekPage.jsx    – /801997752/meresek (mérési körök + PDF feltöltés)
    AdminKutatasokPage.jsx  – /801997752/gocpont-kutatasok (rögzítés/szerkesztés/törlés)
  data/
    monitoringData.js – A mérések kiinduló adatai (CMS seed) + felmérés/jelentés adatok
```

---

## Technológiák

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [React Router v7](https://reactrouter.com)
- [Groq API](https://groq.com) (llama-3.3-70b-versatile modell)
- CSS – egyedi design system, nincsenek UI framework függőségek
