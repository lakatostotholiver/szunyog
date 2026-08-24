// Az admin felület nem nyilvános: nincs rá link az oldalon, és az útvonala egy
// nehezen kitalálható számsor. Ez nem helyettesíti a jelszavas védelmet (az
// minden admin oldalon érvényben van), csak megnehezíti a véletlen megtalálást.
//
// Ha az útvonalat cserélni kell, elég ezt az egy értéket átírni.
export const ADMIN_BASE = '/801997752';

export const ADMIN_ROUTES = {
  base: ADMIN_BASE,
  login: `${ADMIN_BASE}/belepes`,
  meresek: `${ADMIN_BASE}/meresek`,
  kutatasok: `${ADMIN_BASE}/gocpont-kutatasok`,
  egyeni: `${ADMIN_BASE}/egyeni-gocpontok`,
  fajazonositas: `${ADMIN_BASE}/fajazonositas`,
  cikkek: `${ADMIN_BASE}/cikkek`,
  mentes: `${ADMIN_BASE}/mentes`,
};

// Az admin navigáció egyetlen forrása – a kezdőlap és a fejléc is ezt használja.
export const ADMIN_NAV = [
  {
    to: ADMIN_ROUTES.meresek,
    label: 'Mérési körök',
    description:
      'NO MOSQUITO bejárások: helyszínenkénti lárvaszám, állapot, összefoglaló és PDF csatolása.',
  },
  {
    to: ADMIN_ROUTES.kutatasok,
    label: 'Gócpont-kutatások',
    description: 'Terepi csípésszámlálásos mérések – a Mérések oldalon jelennek meg.',
  },
  {
    to: ADMIN_ROUTES.egyeni,
    label: 'Egyéni gócpontok',
    description:
      'Háztartásoknál végzett vizsgálatok fotókkal. A pontos cím soha nem kerül ki – csak városrész szinten, mintaként.',
  },
  {
    to: ADMIN_ROUTES.fajazonositas,
    label: 'Fajazonosítás',
    description: 'CO₂-csapdázás és csípésszámlálás befogási eredményei, fajonkénti egyedszámmal.',
  },
  {
    to: ADMIN_ROUTES.cikkek,
    label: 'Cikkek',
    description: 'Tájékoztató cikkek a Hírek oldalra és a főoldali hírfolyamba.',
  },
  {
    to: ADMIN_ROUTES.mentes,
    label: 'Mentés és kuka',
    description:
      'Biztonsági mentés letöltése, és a törölt bejegyzések visszaállítása 30 napon belül.',
  },
];
