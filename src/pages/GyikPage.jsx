import FaqAccordion from '../components/FaqAccordion';

const faqItems = [
  {
    question: 'Mi az a biológiai szúnyoggyérítés, és hogyan működik?',
    answer: (
      <>
        <p>
          A biológiai védekezés nem a már repülő, csípős szúnyogokat próbálja elpusztítani
          a levegőben, hanem a <strong>probléma gyökerét kezeli</strong>: a szúnyogok lárváit pusztítja el a
          tenyészővizekben, még mielőtt kifejlett, vérszívó rovarrá válnának.
        </p>
        <p>
          <strong>Hogyan működik?</strong> A módszer egy talajbaktérium, a <em>Bacillus thuringiensis israelensis</em>{' '}
          (Bti) által termelt speciális fehérjetoxinok alkalmazásán alapul. Ezt a készítményt juttatják a
          szúnyogok tenyészőhelyeire (pangó vizekbe). A vízben fejlődő lárvák táplálkozás közben felveszik a Bti
          toxinjait, amelyek a bélrendszerükben aktiválódnak, és rövid időn belül elpusztítják őket.
        </p>
        <p>
          A Bti a javasolt dózisokban <strong>erősen szelektív</strong>: főként
          szúnyog- és néhány rokon kétszárnyú faj lárváit érinti, míg a gerincesekre (ember, háziállatok, halak,
          kétéltűek) és a legtöbb vízi, illetve hasznos rovarfajra nézve nagyon alacsony kockázatú.
        </p>
      </>
    ),
  },
  {
    question: 'Mi a gond a hagyományos, kémiai (pl. melegködös) szúnyogirtással?',
    answer: (
      <>
        <p>
          A Magyarországon hosszú ideig használt, kifejlett szúnyogokat célzó kémiai irtás a nemzetközi szakmai trendek
          szerint egyre kevésbé tekinthető fenntartható megoldásnak, mert <strong>jelentős mértékben károsítja
          a nem célzott élővilágot</strong>.
        </p>
        <p>
          Vizsgálatok szerint az ilyen kezelések során a permetködben elpusztult rovarok nagy részét nem szúnyogok,
          hanem más – sokszor ártalmatlan vagy kifejezetten hasznos – fajok adják (vadméhek, beporzók, ragadozó rovarok stb.).
        </p>
        <p>
          A leggyakrabban használt hatóanyag a <strong>deltametrin</strong>, egy szintetikus piretroid,
          azaz idegrendszerre ható vegyület (neurotoxin). A molekula a rovarok idegsejtjeinek feszültségfüggő
          nátriumcsatornáihoz kötődik, és megakadályozza azok normális bezáródását. Emiatt kontrollálatlan idegi
          kisüléseket, görcsöket, majd bénulást és pusztulást okoz.
        </p>
        <p>
          Mivel az emlősök (így az emberek) idegrendszerében is hasonló nátriumcsatornák működnek, a deltametrin
          toxikológiai szempontból ránk nézve sem közömbös anyag. Egyes vizsgálatok a piretroidok tartós expozícióját
          a fejlődő idegrendszerre és a hormonrendszerre gyakorolt kedvezőtlen hatásokkal hozzák összefüggésbe –
          különösen a <strong>gyermekek és várandósok</strong> védelme indokol fokozott óvatosságot.
        </p>
        <p>
          <strong>„Bumeráng-hatás":</strong> A széles hatásspektrumú kémiai szerek nemcsak a szúnyogokat ölik meg,
          hanem a szúnyogok <strong>természetes ellenségeit</strong> (szitakötők, ragadozó bogarak, pókok, vízi
          gerinctelenek) is ritkítják. A szúnyogpopulációk a kezelés után hamarabb
          „visszapattannak", mint a lassabban regenerálódó ragadozók, így tartósan rontva a helyzetet.
        </p>
      </>
    ),
  },
  {
    question: 'Mit ír elő az Európai Unió, és mi az európai trend?',
    answer: (
      <>
        <p>
          Magyarországon a kémiai irtás aránya még mindig számottevő, miközben számos nyugat-európai országban az a cél,
          hogy <strong>elsősorban biológiai és környezetkímélő módszereket</strong> alkalmazzanak.
        </p>
        <p>
          <strong>EU-s szabályozás:</strong> A biocid termékekről szóló 528/2012/EU rendelet szigorú
          kockázatértékelési és engedélyezési keretet ír elő, kiemelten kezelve a környezet- és egészségvédelmet.
          Az EU-ban általános tendencia a légi permetezés erős korlátozása.
        </p>
        <p>
          <strong>Franciaország:</strong> A „Labbé-törvény" nagymértékben korlátozza a kémiai peszticidek használatát
          közterületeken (parkok, oktatási és egészségügyi intézmények környezete), és alternatív,
          vegyszermentes megoldásokra ösztönöz.
        </p>
        <p>
          <strong>Németország, Rajna-völgy:</strong> Évtizedek óta működik egy nagykiterjedésű, települések közötti
          együttműködésen alapuló szúnyoggyérítési program, ahol elsősorban Bti-alapú lárvagyérítést alkalmaznak.{' '}
          <strong>Több mint 90%-kal</strong> sikerült csökkenteni a szúnyogártalmat nagy területen, anélkül, hogy
          szintetikus idegmérgekre támaszkodnának.
        </p>
      </>
    ),
  },
  {
    question: 'Járványügyi kockázatok: mi a nagyobb veszély?',
    answer: (
      <>
        <p>
          Sokan úgy gondolják, hogy a szúnyogok által terjesztett betegségek (pl. nyugat-nílusi láz) elkerülése
          érdekében „nincs más választás", mint a rendszeres kémiai irtás. A jelenlegi tudományos és nemzetközi
          gyakorlat azonban azt mutatja, hogy a <strong>hosszú távon hatékony vektorkontroll</strong> a biológiai
          módszerekre és a monitorozásra épül, a kémiait pedig utolsó eszközként javasolják.
        </p>
        <p>
          <strong>Rezisztencia:</strong> Magyarországi vizsgálatok kimutatták, hogy a <em>Culex pipiens</em>{' '}
          populációk jelentős része már hordoz piretroid-rezisztenciával összefüggő kdr-mutációt. A vizsgált
          állományokban az egyedek mintegy fele rezisztens genotípusú volt – a kémiai szerekre tehát egyre kevésbé
          lehet támaszkodni.
        </p>
        <p>
          <strong>A biológiai gyérítés előnye:</strong> A Bti-alapú módszer célzottan és nagy hatékonysággal képes
          visszaszorítani a betegségeket terjesztő szúnyogfajok – többek között az ázsiai tigrisszúnyog
          (<em>Aedes albopictus</em>) – lárváit. A lárvák elleni, monitorozásra épülő beavatkozás reális eszközt ad
          a járványügyi kockázat csökkentésére.
        </p>
      </>
    ),
  },
  {
    question: 'Miért fontos a folyamatos monitorozás, és mit mond erről a törvény?',
    answer: (
      <>
        <p>
          A szúnyogkérdés ma már közegészségügyi szempontból kiemelt probléma. A magyar{' '}
          <strong>18/1998. (VI. 3.) NM rendelet</strong> a járványügyi feladatok között előírja a vektorok
          elleni védekezés megszervezését, a szakmai irányelvek pedig hangsúlyozzák, hogy a beavatkozásnak a
          helyzet felmérésén kell alapulnia.
        </p>
        <p><strong>Rovartani (entomológiai) megfigyelés:</strong></p>
        <ul>
          <li>Csapdákkal és terepi megfigyelésekkel mérik a szúnyogok számát és fajösszetételét.</li>
        </ul>
        <p><strong>Vírustani (virológiai) vizsgálat:</strong></p>
        <ul>
          <li>A begyűjtött szúnyogokat laboratóriumi PCR-teszttel vizsgálják különböző kórokozók jelenlétére.</li>
          <li>Ez korai előrejelző rendszerként működik: a vírusok gyakran hetekkel azelőtt kimutathatók a szúnyogokban,
            mielőtt az első emberi megbetegedések megjelennének.</li>
        </ul>
      </>
    ),
  },
  {
    question: 'Miért nem hatékony a kémiai irtás a saját kertünkben?',
    answer: (
      <>
        <p>
          Gyakori tévhit, hogy az utcán elhaladó „fújós autó" majd minden gondot megold. A gyakorlatban a permetköd
          sokszor <strong>el sem jut a magánkertek hátsó részeibe</strong>, mert kerítések, sövények, épületek,
          domborzati viszonyok felfogják a köd nagy részét.
        </p>
        <p>
          Ráadásul a szúnyogok jelentős része éppen a magánkertekben és ház körüli mikrotenyészőhelyeken fejlődik ki,
          ahova a közterületi permetezés nem ér el. Mivel a szakemberek nem mehetnek be minden magánkertbe,
          az <strong>egyéni felelősség kulcsfontosságú</strong>.
        </p>
      </>
    ),
  },
];

export default function GyikPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div className="kicker">Gyakran ismételt kérdések</div>
          <h1>Amit a biológiai szúnyoggyérítésről tudni érdemes</h1>
          <p>
            Az alábbiakban összefoglaljuk, mi a különbség a biológiai és a kémiai szúnyoggyérítés között,
            és miért döntött Törökbálint az előbbi mellett.
          </p>
        </div>
      </div>

      <section>
        <div className="container">
          <div className="method-grid" style={{ marginBottom: '2rem' }}>
            <div className="method-card bio">
              <h3>🌿 Biológiai védekezés (Bti)</h3>
              <p>
                A <em>Bacillus thuringiensis israelensis</em> (Bti) talajbaktérium fehérjetoxinjait
                juttatják a pangó vizekbe, ahol a szúnyoglárvák táplálkozás közben felveszik és elpusztulnak.
                A módszer <strong>célzott</strong>: gerincesekre, halakra, kétéltűekre és beporzó
                rovarokra nem veszélyes. Nincs rezisztencia-kialakulás, nem szennyezi a talajt.
              </p>
            </div>
            <div className="method-card warn">
              <h3>⚠️ Kémiai (ködösítéses) irtás</h3>
              <p>
                A melegködös eljárás szintetikus piretroid hatóanyagot (pl. deltametrin) permetez szét
                a levegőben, amely <strong>nemcsak szúnyogokat, hanem méheket, szitakötőket és egyéb
                hasznos rovarokat</strong> is elpusztít. Nem jut be a kertek mélyére,
                a lombok közé. A szúnyogpopulációk hamarabb regenerálódnak, mint természetes ellenfeleik –
                hosszú távon rontva a helyzetet. Egyes vizsgálatok gyermekekre és várandósokra
                gyakorolt kedvezőtlen hatásokat jeleznek tartós expozíció esetén.
              </p>
            </div>
            <div className="method-card info">
              <h3>🔬 Miért a biológiai módszer?</h3>
              <p>
                Törökbálint a <strong>megelőzésre</strong> épít: a lárvákat pusztítja el, mielőtt
                kifejlett szúnyoggá válnak. A Duna–Ipoly Nemzeti Park Igazgatóság megerősítette,
                hogy a kémiai gyérítés elhagyása óta <strong>jelentősen nőtt a biodiverzitás</strong>
                a városban. A módszer EU-konform, és számos nyugat-európai városban (pl. Rajna-völgy)
                több mint 90%-os hatékonyságot ér el.
              </p>
            </div>
          </div>

          <FaqAccordion items={faqItems} />
        </div>
      </section>
    </>
  );
}
