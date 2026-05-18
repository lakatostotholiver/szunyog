export default function MitTehetunkPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div className="kicker">Lakossági tájékoztató</div>
          <h1>Mit tehetünk a szúnyogok ellen?</h1>
          <p>
            Teljes szúnyogmentesség semmilyen módszerrel nem érhető el. A város területének nagyobb része
            magánterület, ahol a lárvák fejlődését csak a lakosság tudja megakadályozni.
          </p>
        </div>
      </div>

      <section>
        <div className="container">
          <div className="callout callout-warn">
            <p>
              <strong>Fontos tudni:</strong> A vegyszeres, ködösítéssel végzett irtás sem jut be a házak és a
              lombok árnyékába – miközben számos hasznos fajt (beporzókat, madarakat, kisemlősöket)
              károsítana. Az egyéni felelősség kulcsfontosságú a tenyészőhelyek felszámolásában.
            </p>
          </div>

          <div className="tips-list" style={{ marginTop: '1.75rem' }}>
            <div className="tip-item">
              <div className="tip-number">1</div>
              <div>
                <h4>A „10 perces szabály"</h4>
                <p>
                  Hetente egyszer szánjon kb. 10 percet a kert, udvar vagy erkély átvizsgálására.
                  Keresse a pangó vizeket: tálkákban, játékokban, fedetlen tartályokban, eldugult csatornákban.
                </p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-number">2</div>
              <div>
                <h4>Esővízgyűjtők lezárása</h4>
                <p>
                  Az esővízgyűjtő hordókat, tartályokat szorosan fedje le szúnyoghálóval vagy zárható fedéllel.
                  Egyetlen fedetlen hordó akár több ezres–tízezres nagyságrendű szúnyoglárvának adhat otthont
                  a szezon során.
                </p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-number">3</div>
              <div>
                <h4>Mikrovizek kiöntése</h4>
                <p>
                  Ürítse ki rendszeresen a virágcserép-alátéteket, fordítsa le a vödröket, talicskákat,
                  gyerekjátékokat. A gumiabroncsokban, fóliák hajlataiban összegyűlő pár deci víz is
                  tenyészőhely lehet.
                </p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-number">4</div>
              <div>
                <h4>Ereszcsatornák takarítása</h4>
                <p>
                  Az eldugult, falevelekkel, törmelékkel teli ereszcsatornákban megálló víz az egyik
                  leggyakoribb rejtett tenyészőhely. Évente többször érdemes átvizsgálni és kitisztítani.
                </p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-number">5</div>
              <div>
                <h4>Biológiai tabletta használata (Bti – Culinex)</h4>
                <p>
                  Ha a vizet nem lehet lefedni (kerti tó, díszmedence, madáritató), használjon Bti-tablettát
                  (pl. Culinex). Egy tabletta kb. 50 liter vízhez elegendő, néhány napig hatásos a szúnyoglárvák
                  ellen, miközben halakra, kétéltűekre, madarakra biztonságos.
                  Az Önkormányzat a tablettát <strong>ingyenesen</strong> biztosítja.
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.25rem' }}>
            <div className="section-header">
              <div className="section-kicker">Tájékoztató videó</div>
              <h2 className="section-title">Mit tehetünk a szúnyogok ellen?</h2>
            </div>
            <div className="video-container">
              <iframe
                src="https://www.youtube-nocookie.com/embed/_Ohx9NoTLuY"
                title="Mit tehetünk a szúnyogok ellen? – Tájékoztató videó"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <div className="callout callout-info" style={{ marginTop: '1.75rem' }}>
            <p>
              <strong>Hogyan igényelhető az ingyenes Culinex tabletta?</strong><br />
              A tablettát a{' '}
              <a href="mailto:zoldjovo@torokbalint.hu"><strong>zoldjovo@torokbalint.hu</strong></a>{' '}
              címen igényelheti, és a Polgármesteri Hivatalban egyeztetett időpontban veheti át.
              Ugyanezen a címen jelezhetik, ha <strong>szúnyogártalommal szennyezett gócpontot</strong> észlelnek.
            </p>
          </div>

          <div className="contact-section" style={{ marginTop: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Kapcsolat
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Kérdés, gócpont-bejelentés vagy Culinex tabletta igénylése:
            </p>
            <div className="contact-grid">
              <div className="contact-item">
                <h4>Önkormányzat</h4>
                <p><strong>Törökbálint Város Önkormányzata</strong></p>
                <p>2045 Törökbálint, Munkácsy Mihály u. 79.</p>
                <p>Kapcsolattartó: Holló Zsuzsanna főkertész</p>
              </div>
              <div className="contact-item">
                <h4>Zöld Jövő Program</h4>
                <p>E-mail: <a href="mailto:zoldjovo@torokbalint.hu"><strong>zoldjovo@torokbalint.hu</strong></a></p>
                <p>Culinex tabletta igénylése</p>
                <p>Gócpont-bejelentés</p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
