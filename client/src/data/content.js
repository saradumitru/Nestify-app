const STORE_LINKS = {
  ikeaBeigeSofas: "https://www.ikea.com/ro/ro/cat/canapele-fu003/f/canapea-bej-f-colors--10003/",
  ikeaSofas: "https://www.ikea.com/ro/ro/cat/canapele-fu003/",
  ikeaBeds: "https://www.ikea.com/ro/ro/cat/paturi-bm003/",
  ikeaLighting: "https://www.ikea.com/ro/ro/cat/lampi-li003/",
  ikeaCoffeeTables: "https://www.ikea.com/ro/ro/cat/masute-de-cafea-10716/",
  ikeaStorage: "https://www.ikea.com/ro/ro/cat/dulapuri-pentru-haine-19053/",
  jyskNightstands: "https://jysk.ro/dormitor/noptiere",
  jyskRugs: "https://jysk.ro/covoare",
  jyskCurtains: "https://jysk.ro/perdele-draperii",
  jyskBedding: "https://jysk.ro/dormitor/lenjerii-de-pat",
  zaraWoodTable: "https://www.zarahome.com/ro/masuta-din-lemn-l48101072",
  zaraWoodTables: "https://www.zarahome.com/ro/mese-din-lemn-l48810000700BHMM",
  zaraHome: "https://www.zarahome.com/ro/",
  hmHome: "https://www2.hm.com/ro_ro/home.html",
  hmCushions: "https://www2.hm.com/ro_ro/home/cumparare-dupa-produs/perne-interior.html",
  mobexpertSofas: "https://mobexpert.ro/collections/canapele",
  mobexpertArmchairs: "https://mobexpert.ro/collections/fotolii",
  mobexpertConsoles: "https://mobexpert.ro/collections/console",
  mobexpertLighting: "https://mobexpert.ro/collections/corpuri-de-iluminat",
  westwingLighting: "https://www.westwing.ro/lampi/",
  westwingTables: "https://www.westwing.ro/masute-de-cafea/",
  westwingDecor: "https://www.westwing.ro/decoratiuni/",
  theHome: "https://thehome.ro/",
  theHomeArmchairs: "https://thehome.ro/collections/fotolii",
  theHomeLighting: "https://thehome.ro/collections/corpuri-de-iluminat",
  maisonsConsoles: "https://www.maisonsdumonde.com/RO/ro/c/console-n31b1a13b083d4c2cbaa2b00d66d65aca",
  maisonsArmchairs: "https://www.maisonsdumonde.com/RO/ro/c/fotolii-nc8e6a09b4c3b168df3cd48dc3d3c55d3",
  maisonsDecor: "https://www.maisonsdumonde.com/RO/ro/c/decoratiuni-n074684b2e7d3b82020b1a8311a3e701b",
  benutaRugs: "https://www.benuta.ro/covoare.html",
  boconceptSofas: "https://www.boconcept.com/ro-ro/shop/canapele/",
  boconceptCoffeeTables: "https://www.boconcept.com/ro-ro/shop/masute-de-cafea/",
  olxVintage: "https://www.olx.ro/casa-gradina/mobila-decoratiuni/",
};

export const stylesData = {
  scandinav: {
    title: "Scandinav",
    kicker: "Minimalism nordic",
    period: "Secolul XX, consolidat după anii 1950",
    description:
      "Stilul scandinav pune accent pe lumină naturală, funcționalitate și simplitate. Se remarcă prin interioare aerisite, materiale naturale și o atmosferă calmă, caldă și prietenoasă.",
    history:
      "A apărut și s-a consolidat în țările nordice ca răspuns la nevoia de spații luminoase, practice și confortabile. A devenit popular la nivel internațional datorită echilibrului dintre estetică și funcționalitate.",
    audience:
      "Este preferat de persoane care iubesc spațiile ordonate, liniștite și luminoase, cu accent pe confort și naturalețe.",
    colors: ["Alb cald", "Bej", "Gri deschis", "Lemn natur", "Verde pal"],
    materials: ["Lemn deschis", "In", "Bumbac", "Lână", "Ceramică mată"],
    heroImageClass: "museum-style-1",
    gallery: ["style-image-1", "style-image-2", "style-image-3"],
    interiors: [
      {
        slug: "scandinav-living-light",
        title: "Living luminos scandinav",
        subtitle: "Texturi moi, tonuri neutre și lemn natur",
        imageClass: "style-image-1",
        objects: [
          {
            name: "Canapea bej cu linii simple",
            category: "Canapea",
            shop: "IKEA / modele similare",
            url: STORE_LINKS.ikeaBeigeSofas,
            room: "Living",
            note: "Potrivită pentru un living luminos, cu textile neutre și lemn deschis.",
          },
          {
            name: "Măsuță din lemn deschis",
            category: "Măsuță cafea",
            shop: "Zara Home / model similar",
            url: STORE_LINKS.zaraWoodTable,
            room: "Living",
            note: "Lemnul natural completează paleta scandinavă fără să încarce vizual spațiul.",
          },
          {
            name: "Lampă de podea minimalistă",
            category: "Iluminat",
            shop: "IKEA / modele similare",
            url: STORE_LINKS.ikeaLighting,
            room: "Living",
            note: "Lumina caldă este importantă pentru atmosfera nordică.",
          },
          {
            name: "Covor în tonuri ivory",
            category: "Textile",
            shop: "JYSK / modele similare",
            url: STORE_LINKS.jyskRugs,
            room: "Living",
            note: "Adaugă confort și păstrează senzația de spațiu aerisit.",
          },
        ],
        recommendations: [
          "Se potrivește cu textile din in și lână.",
          "Adaugă ceramică mată și vaze simple.",
          "Merge foarte bine cu un covor ivory.",
        ],
      },
      {
        slug: "scandinav-bedroom-soft",
        title: "Dormitor calm nordic",
        subtitle: "Paletă neutră și confort discret",
        imageClass: "style-image-2",
        objects: [
          {
            name: "Pat tapițat în nuanță neutră",
            category: "Pat",
            shop: "IKEA / modele similare",
            url: STORE_LINKS.ikeaBeds,
            room: "Dormitor",
            note: "O bază neutră permite schimbarea atmosferei prin textile.",
          },
          {
            name: "Noptieră albă sau stejar deschis",
            category: "Noptieră",
            shop: "JYSK / modele similare",
            url: STORE_LINKS.jyskNightstands,
            room: "Dormitor",
            note: "O piesă simplă, practică și coerentă cu estetica nordică.",
          },
          {
            name: "Lenjerie de pat crem sau grej",
            category: "Textile",
            shop: "JYSK / modele similare",
            url: STORE_LINKS.jyskBedding,
            room: "Dormitor",
            note: "Textilele moi fac dormitorul mai cald și mai relaxant.",
          },
          {
            name: "Veioză albă sau din lemn",
            category: "Iluminat",
            shop: "IKEA / modele similare",
            url: STORE_LINKS.ikeaLighting,
            room: "Dormitor",
            note: "Lumina de accent susține atmosfera calmă a camerei.",
          },
        ],
        recommendations: [
          "Folosește lenjerii crem sau grej.",
          "Adaugă lemn natur și lumină caldă.",
          "Evită accentele prea contrastante.",
        ],
      },
    ],
  },

  modern: {
    title: "Modern",
    kicker: "Contemporan",
    period: "Secolul XX târziu și reinterpretări actuale",
    description:
      "Stilul modern se bazează pe linii curate, compoziții echilibrate și o estetică rafinată. Este elegant, clar și pune accent pe forme bine definite.",
    history:
      "A evoluat din modernism și din ideea de simplitate funcțională, iar astăzi este reinterpretat prin spații curate, tonuri neutre și mobilier cu siluete clare.",
    audience:
      "Se potrivește celor care preferă un stil sofisticat, urban și ordonat, fără exces decorativ.",
    colors: ["Negru", "Alb", "Taupe", "Gri", "Accente de bronz"],
    materials: ["Metal", "Sticlă", "Piatră", "Lemn închis", "Texturi fine"],
    heroImageClass: "museum-style-2",
    gallery: ["style-image-2", "style-image-5", "style-image-3"],
    interiors: [
      {
        slug: "modern-soft-contrast",
        title: "Modern soft contrast",
        subtitle: "Linii curate și texturi elegante",
        imageClass: "style-image-5",
        objects: [
          {
            name: "Canapea modulară în stofă",
            category: "Canapea",
            shop: "Mobexpert / modele similare",
            url: STORE_LINKS.mobexpertSofas,
            room: "Living",
            note: "O canapea modulară susține compozițiile moderne și flexibile.",
          },
          {
            name: "Măsuță de cafea cu aspect de piatră",
            category: "Măsuță cafea",
            shop: "Westwing / modele similare",
            url: STORE_LINKS.westwingTables,
            room: "Living",
            note: "Suprafețele cu efect de piatră adaugă rafinament fără decor excesiv.",
          },
          {
            name: "Lampadar sculptural",
            category: "Iluminat",
            shop: "Westwing / modele similare",
            url: STORE_LINKS.westwingLighting,
            room: "Living",
            note: "O piesă de iluminat sculpturală funcționează ca accent decorativ.",
          },
          {
            name: "Decor abstract minimal",
            category: "Decor",
            shop: "Westwing / modele similare",
            url: STORE_LINKS.westwingDecor,
            room: "Living",
            note: "Arta abstractă completează un interior modern cu paletă restrânsă.",
          },
        ],
        recommendations: [
          "Combină suprafețe mate cu accente metalice.",
          "Funcționează bine cu artă abstractă.",
          "Păstrează paleta cromatică restrânsă.",
        ],
      },
    ],
  },

  japandi: {
    title: "Japandi",
    kicker: "Japonez × scandinav",
    period: "Popularizat intens în ultimul deceniu",
    description:
      "Japandi combină minimalismul japonez cu confortul scandinav. Rezultatul este un stil calm, cald, echilibrat și foarte bine proporționat.",
    history:
      "Este o fuziune contemporană între două direcții estetice care au în comun simplitatea, respectul pentru materiale naturale și aprecierea spațiului liber.",
    audience:
      "Este ales de persoane care caută echilibru, liniște vizuală și un stil minimalist, dar cald.",
    colors: ["Grej", "Bej", "Brun cald", "Verde salvie", "Negru mat"],
    materials: ["Lemn natur", "Ceramică", "In", "Bambus", "Texturi brute"],
    heroImageClass: "museum-style-3",
    gallery: ["style-image-3", "style-image-1", "style-image-6"],
    interiors: [
      {
        slug: "japandi-serene-room",
        title: "Cameră serene japandi",
        subtitle: "Calm, texturi brute și echilibru",
        imageClass: "style-image-3",
        objects: [
          {
            name: "Măsuță joasă din lemn natur",
            category: "Măsuță cafea",
            shop: "IKEA / modele similare",
            url: STORE_LINKS.ikeaCoffeeTables,
            room: "Living",
            note: "Formele joase și clare sunt potrivite pentru un interior japandi.",
          },
          {
            name: "Scaun simplu din lemn",
            category: "Scaun",
            shop: "Zara Home / modele similare",
            url: STORE_LINKS.zaraWoodTables,
            room: "Dining / Living",
            note: "Lemnul natural păstrează senzația caldă și echilibrată.",
          },
          {
            name: "Lampă din hârtie sau textil natural",
            category: "Iluminat",
            shop: "IKEA / modele similare",
            url: STORE_LINKS.ikeaLighting,
            room: "Living / Dormitor",
            note: "Lumina difuză accentuează atmosfera calmă japandi.",
          },
          {
            name: "Decor ceramic minimalist",
            category: "Decor",
            shop: "Zara Home / modele similare",
            url: STORE_LINKS.zaraHome,
            room: "Living / Dormitor",
            note: "Puține obiecte, dar bine alese, păstrează spațiul aerisit.",
          },
        ],
        recommendations: [
          "Folosește forme joase și clare.",
          "Alege textile naturale.",
          "Păstrează puține obiecte decorative.",
        ],
      },
    ],
  },

  boho: {
    title: "Boho",
    kicker: "Warm eclectic",
    period: "Popularizat puternic în anii 2000 și 2010",
    description:
      "Boho este un stil liber, cald și expresiv. Combină texturi, obiecte decorative, influențe etnice și o atmosferă relaxată.",
    history:
      "A evoluat din estetica boemă și din interioarele care privilegiază libertatea de expresie, mixul de influențe și decorul personal.",
    audience:
      "Este iubit de persoane creative, romantice și de cei care vor un interior cu personalitate și căldură.",
    colors: ["Terracotta", "Roz pudrat", "Muștar", "Crem", "Verde olive"],
    materials: ["Ratan", "Macrame", "Lemn", "In", "Textile decorative"],
    heroImageClass: "museum-style-4",
    gallery: ["style-image-4", "style-image-6", "style-image-5"],
    interiors: [
      {
        slug: "boho-warm-lounge",
        title: "Boho warm lounge",
        subtitle: "Decor liber și atmosferă relaxată",
        imageClass: "style-image-4",
        objects: [
          {
            name: "Fotoliu din ratan sau lemn împletit",
            category: "Fotoliu",
            shop: "Maisons du Monde / modele similare",
            url: STORE_LINKS.maisonsArmchairs,
            room: "Living / Colț relaxare",
            note: "Ratanul și fibrele naturale sunt foarte potrivite pentru stilul boho.",
          },
          {
            name: "Covor texturat cu model discret",
            category: "Covor",
            shop: "Benuta / modele similare",
            url: STORE_LINKS.benutaRugs,
            room: "Living / Dormitor",
            note: "Textura covorului adaugă căldură și stratificare vizuală.",
          },
          {
            name: "Perne decorative în tonuri calde",
            category: "Textile",
            shop: "H&M Home / modele similare",
            url: STORE_LINKS.hmCushions,
            room: "Living / Dormitor",
            note: "Pernele permit introducerea culorilor boho fără schimbări mari.",
          },
          {
            name: "Lampă decorativă cu lumină caldă",
            category: "Iluminat",
            shop: "H&M Home / modele similare",
            url: STORE_LINKS.hmHome,
            room: "Living / Dormitor",
            note: "Lumina caldă susține atmosfera relaxată și personală.",
          },
        ],
        recommendations: [
          "Combină textile și texturi diferite.",
          "Adaugă plante și ceramică artizanală.",
          "Păstrează un echilibru între culoare și neutre.",
        ],
      },
    ],
  },

  clasic: {
    title: "Clasic",
    kicker: "Timeless interiors",
    period: "Inspirat din tradiții europene și reinterpretări contemporane",
    description:
      "Stilul clasic valorizează proporția, simetria și rafinamentul. Interioarele clasice sunt elegante și atemporale.",
    history:
      "Are rădăcini în interioarele europene istorice, unde armonia, echilibrul și detaliile decorative aveau un rol central.",
    audience:
      "Este preferat de cei care caută eleganță atemporală și interioare cu prestanță.",
    colors: ["Ivory", "Grej", "Taupe", "Auriu discret", "Brun închis"],
    materials: ["Lemn masiv", "Mătase", "Catifea", "Marmură", "Metal patinat"],
    heroImageClass: "museum-style-5",
    gallery: ["style-image-5", "style-image-2", "style-image-1"],
    interiors: [
      {
        slug: "classic-salon-balance",
        title: "Salon clasic echilibrat",
        subtitle: "Simetrie, rafinament și tonuri calde",
        imageClass: "style-image-5",
        objects: [
          {
            name: "Consolă elegantă pentru hol sau living",
            category: "Consolă",
            shop: "Maisons du Monde / modele similare",
            url: STORE_LINKS.maisonsConsoles,
            room: "Hol / Living",
            note: "O consolă cu linii elegante accentuează simetria stilului clasic.",
          },
          {
            name: "Aplice decorative cu metal cald",
            category: "Iluminat",
            shop: "Mobexpert / modele similare",
            url: STORE_LINKS.mobexpertLighting,
            room: "Living / Dormitor",
            note: "Aplicelele creează lumină ambientală și susțin atmosfera rafinată.",
          },
          {
            name: "Fotoliu clasic tapițat",
            category: "Fotoliu",
            shop: "The Home / modele similare",
            url: STORE_LINKS.theHomeArmchairs,
            room: "Living / Salon",
            note: "Un fotoliu tapițat poate deveni piesa centrală a unui colț elegant.",
          },
          {
            name: "Decor ceramic sau ramă decorativă",
            category: "Decor",
            shop: "Maisons du Monde / modele similare",
            url: STORE_LINKS.maisonsDecor,
            room: "Living / Hol",
            note: "Detaliile decorative trebuie folosite echilibrat, fără supraîncărcare.",
          },
        ],
        recommendations: [
          "Folosește simetria în compoziție.",
          "Accentele aurii trebuie să fie discrete.",
          "Funcționează bine cu textile grele și lumină caldă.",
        ],
      },
    ],
  },

  "english-country": {
    title: "English Country",
    kicker: "Archive favourite",
    period: "Inspirat din casele de țară britanice",
    description:
      "English Country este un stil cald, nostalgic și fermecător. Se bazează pe confort, textile moi, mobilier tradițional și un farmec discret, lived-in.",
    history:
      "Provine din estetica caselor de țară englezești și este asociat cu ideea de confort autentic, obiecte moștenite și spații cu multă personalitate.",
    audience:
      "Este ideal pentru cei care iubesc casele cu poveste, romantismul discret și confortul tradițional.",
    colors: ["Verde stins", "Crem", "Floral muted", "Brun", "Dusty rose"],
    materials: ["Lemn patinat", "Bumbac floral", "In", "Lână", "Ceramică"],
    heroImageClass: "museum-style-6",
    gallery: ["style-image-6", "style-image-5", "style-image-4"],
    interiors: [
      {
        slug: "english-country-charm",
        title: "English country charm",
        subtitle: "Textile, flori și confort nostalgic",
        imageClass: "style-image-6",
        objects: [
          {
            name: "Fotoliu cu tapițerie texturată sau florală",
            category: "Fotoliu",
            shop: "Maisons du Monde / modele similare",
            url: STORE_LINKS.maisonsArmchairs,
            room: "Living / Colț de citit",
            note: "Un fotoliu confortabil este potrivit pentru estetica lived-in.",
          },
          {
            name: "Măsuță din lemn patinat",
            category: "Măsuță auxiliară",
            shop: "OLX / vintage & second-hand",
            url: STORE_LINKS.olxVintage,
            room: "Living / Dormitor",
            note: "Piesele vintage sau recondiționate se potrivesc foarte bine acestui stil.",
          },
          {
            name: "Lampă clasică de masă",
            category: "Iluminat",
            shop: "The Home / modele similare",
            url: STORE_LINKS.theHomeLighting,
            room: "Living / Dormitor",
            note: "O lampă cu abajur textil creează o atmosferă caldă și domestică.",
          },
          {
            name: "Decorațiuni ceramice și textile florale",
            category: "Decor",
            shop: "Zara Home / modele similare",
            url: STORE_LINKS.zaraHome,
            room: "Living / Bucătărie",
            note: "Textilele și ceramica ajută la obținerea farmecului nostalgic.",
          },
        ],
        recommendations: [
          "Adaugă pattern floral în doze mici.",
          "Combină lemn patinat cu textile moi.",
          "Păstrează o atmosferă caldă și lived-in.",
        ],
      },
    ],
  },
};

export const movieHousesData = {
  "nancy-meyers": {
    title: "Nancy Meyers Interiors",
    kicker: "Cinema & interiors",
    description:
      "Case luminoase, bucătării iconice, texturi calde și un sentiment de confort elegant care a devenit aproape un gen vizual în sine.",
    history:
      "Interioarele asociate cu filmele lui Nancy Meyers au devenit o referință culturală pentru ideea de casă ideală: rafinată, primitoare, luminoasă și extrem de bine stilizată.",
    gallery: ["museum-movie-1", "style-image-5", "style-image-1"],
  },

  "nora-ephron": {
    title: "Nora Ephron Inspired",
    kicker: "Cinema & interiors",
    description:
      "Spații romantice, intelectuale și nostalgic-urbane, cu un farmec discret și o estetică foarte cinematografică.",
    history:
      "Universul vizual asociat cu Nora Ephron evocă apartamente și case cu personalitate, căldură și un tip de romantism urban recognoscibil.",
    gallery: ["museum-movie-2", "style-image-2", "style-image-4"],
  },

  "old-hollywood": {
    title: "Old Hollywood",
    kicker: "Cinema & interiors",
    description:
      "Glamour, catifea, contrast, dramatism și interioare construite pentru atmosferă și memorabilitate.",
    history:
      "Inspirat din interioarele spectaculoase asociate cu vechiul Hollywood, acest univers estetic pune accent pe decor teatral, materialitate bogată și lumină dramatică.",
    gallery: ["museum-movie-3", "style-image-5", "style-image-4"],
  },
};