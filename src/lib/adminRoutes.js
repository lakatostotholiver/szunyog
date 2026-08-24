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
};
