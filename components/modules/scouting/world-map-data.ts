// Mapa de normalização: texto livre → código ISO-3
export const NATIONALITY_TO_CODE: Record<string, string> = {
  // Portugal
  "portugal": "PRT", "português": "PRT", "portuguesa": "PRT",
  // Espanha
  "espanha": "ESP", "spain": "ESP", "español": "ESP", "espanhol": "ESP",
  // França
  "frança": "FRA", "france": "FRA", "français": "FRA", "francês": "FRA", "franceses": "FRA",
  // Alemanha
  "alemanha": "DEU", "germany": "DEU", "deutsch": "DEU", "alemão": "DEU",
  // Itália
  "itália": "ITA", "italy": "ITA", "italiano": "ITA",
  // Inglaterra / Reino Unido → GBR (ISO-3 real)
  "inglaterra": "GBR", "england": "GBR", "inglês": "GBR", "british": "GBR",
  "reino unido": "GBR", "united kingdom": "GBR", "uk": "GBR",
  // Holanda
  "holanda": "NLD", "netherlands": "NLD", "países baixos": "NLD", "holandês": "NLD",
  // Bélgica
  "bélgica": "BEL", "belgium": "BEL", "belga": "BEL",
  // Brasil
  "brasil": "BRA", "brazil": "BRA", "brasileiro": "BRA", "brasileira": "BRA",
  // Argentina
  "argentina": "ARG", "argentino": "ARG", "argentinian": "ARG",
  // Uruguai
  "uruguai": "URY", "uruguay": "URY", "uruguaio": "URY",
  // Colômbia
  "colômbia": "COL", "colombia": "COL", "colombiano": "COL",
  // Chile
  "chile": "CHL", "chileno": "CHL",
  // Peru
  "peru": "PER", "peruano": "PER",
  // Venezuela
  "venezuela": "VEN", "venezuelano": "VEN",
  // Equador
  "equador": "ECU", "ecuador": "ECU", "equatoriano": "ECU",
  // México
  "méxico": "MEX", "mexico": "MEX", "mexicano": "MEX",
  // EUA
  "eua": "USA", "usa": "USA", "estados unidos": "USA", "united states": "USA", "americano": "USA",
  // Canadá
  "canadá": "CAN", "canada": "CAN", "canadiano": "CAN",
  // Senegal
  "senegal": "SEN", "senegalês": "SEN", "senegalese": "SEN",
  // Costa do Marfim
  "costa do marfim": "CIV", "ivory coast": "CIV", "côte d'ivoire": "CIV",
  // Gana
  "gana": "GHA", "ghana": "GHA", "ganês": "GHA", "ghanaian": "GHA",
  // Nigéria
  "nigéria": "NGA", "nigeria": "NGA", "nigeriano": "NGA",
  // Camarões
  "camarões": "CMR", "cameroon": "CMR", "camaronês": "CMR",
  // Marrocos
  "marrocos": "MAR", "morocco": "MAR", "marroquino": "MAR",
  // Egito
  "egito": "EGY", "egypt": "EGY", "egípcio": "EGY",
  // África do Sul
  "áfrica do sul": "ZAF", "south africa": "ZAF", "sul-africano": "ZAF",
  // Tunísia
  "tunísia": "TUN", "tunisia": "TUN", "tunisino": "TUN",
  // Argélia
  "argélia": "DZA", "algeria": "DZA", "argelino": "DZA",
  // Mali
  "mali": "MLI", "maliano": "MLI",
  // Guiné
  "guiné": "GIN", "guinea": "GIN",
  // Etiópia
  "etiópia": "ETH", "ethiopia": "ETH",
  // Angola
  "angola": "AGO", "angolano": "AGO",
  // Moçambique
  "moçambique": "MOZ", "mozambique": "MOZ", "moçambicano": "MOZ",
  // Japão
  "japão": "JPN", "japan": "JPN", "japonês": "JPN",
  // Coreia do Sul
  "coreia do sul": "KOR", "south korea": "KOR", "coreano": "KOR",
  // China
  "china": "CHN", "chinês": "CHN", "chinese": "CHN",
  // Austrália
  "austrália": "AUS", "australia": "AUS", "australiano": "AUS",
  // Rússia
  "rússia": "RUS", "russia": "RUS", "russo": "RUS",
  // Ucrânia
  "ucrânia": "UKR", "ukraine": "UKR", "ucraniano": "UKR",
  // Polónia
  "polónia": "POL", "poland": "POL", "polaco": "POL",
  // Croácia
  "croácia": "HRV", "croatia": "HRV", "croata": "HRV",
  // Sérvia
  "sérvia": "SRB", "serbia": "SRB", "sérvio": "SRB",
  // Dinamarca
  "dinamarca": "DNK", "denmark": "DNK", "dinamarquês": "DNK",
  // Suécia
  "suécia": "SWE", "sweden": "SWE", "sueco": "SWE",
  // Noruega
  "noruega": "NOR", "norway": "NOR", "norueguês": "NOR",
  // Suíça
  "suíça": "CHE", "switzerland": "CHE", "suíço": "CHE",
  // Áustria
  "áustria": "AUT", "austria": "AUT", "austríaco": "AUT",
  // República Checa
  "república checa": "CZE", "czech republic": "CZE", "czechia": "CZE",
  // Hungria
  "hungria": "HUN", "hungary": "HUN", "húngaro": "HUN",
  // Roménia
  "roménia": "ROU", "romania": "ROU", "romeno": "ROU",
  // Turquia
  "turquia": "TUR", "turkey": "TUR", "turco": "TUR",
  // Grécia
  "grécia": "GRC", "greece": "GRC", "grego": "GRC",
  // Eslovénia
  "eslovénia": "SVN", "slovenia": "SVN", "esloveno": "SVN",
  // Eslováquia
  "eslováquia": "SVK", "slovakia": "SVK", "eslovaco": "SVK",
  // Montenegro
  "montenegro": "MNE", "montenegrino": "MNE",
  // Bósnia
  "bósnia": "BIH", "bosnia": "BIH", "bósnio": "BIH",
  // Irlanda
  "irlanda": "IRL", "ireland": "IRL", "irlandês": "IRL",
  // Escócia
  "escócia": "SCO", "scotland": "SCO", "escocês": "SCO",
  // País de Gales
  "país de gales": "WAL", "wales": "WAL",
}

// Mapeamento ID numérico UN M49 → ISO-3
// Usado para identificar países no TopoJSON world-atlas (countries-110m.json)
export const UN_TO_ISO3: Record<string, string> = {
  "4": "AFG", "8": "ALB", "12": "DZA", "24": "AGO", "32": "ARG",
  "36": "AUS", "40": "AUT", "50": "BGD", "56": "BEL", "64": "BTN",
  "68": "BOL", "70": "BIH", "76": "BRA", "100": "BGR", "104": "MMR",
  "116": "KHM", "120": "CMR", "124": "CAN", "144": "LKA", "152": "CHL",
  "156": "CHN", "170": "COL", "180": "COD", "188": "CRI", "191": "HRV",
  "192": "CUB", "203": "CZE", "204": "BEN", "208": "DNK", "218": "ECU",
  "231": "ETH", "233": "EST", "246": "FIN", "250": "FRA", "268": "GEO",
  "276": "DEU", "288": "GHA", "300": "GRC", "320": "GTM", "324": "GIN",
  "332": "HTI", "340": "HND", "348": "HUN", "356": "IND", "360": "IDN",
  "364": "IRN", "368": "IRQ", "372": "IRL", "376": "ISR", "380": "ITA",
  "384": "CIV", "392": "JPN", "400": "JOR", "404": "KEN", "410": "KOR",
  "414": "KWT", "422": "LBN", "430": "LBR", "440": "LTU", "442": "LUX",
  "450": "MDG", "458": "MYS", "466": "MLI", "484": "MEX", "499": "MNE",
  "504": "MAR", "508": "MOZ", "516": "NAM", "524": "NPL", "528": "NLD",
  "540": "NCL", "554": "NZL", "558": "NIC", "566": "NGA", "578": "NOR",
  "586": "PAK", "591": "PAN", "598": "PNG", "604": "PER", "608": "PHL",
  "616": "POL", "620": "PRT", "630": "PRI", "634": "QAT", "642": "ROU",
  "643": "RUS", "646": "RWA", "682": "SAU", "686": "SEN", "688": "SRB",
  "703": "SVK", "705": "SVN", "710": "ZAF", "716": "ZWE", "724": "ESP",
  "740": "SUR", "752": "SWE", "756": "CHE", "760": "SYR", "762": "TJK",
  "764": "THA", "780": "TTO", "788": "TUN", "792": "TUR", "800": "UGA",
  "804": "UKR", "818": "EGY", "826": "GBR", "834": "TZA", "840": "USA",
  "854": "BFA", "858": "URY", "860": "UZB", "862": "VEN", "887": "YEM",
  "894": "ZMB",
}

// Nomes dos países em português (ISO-3 → nome PT)
export const COUNTRY_NAMES: Record<string, string> = {
  PRT: "Portugal", ESP: "Espanha", FRA: "França", DEU: "Alemanha", ITA: "Itália",
  GBR: "Reino Unido", NLD: "Holanda", BEL: "Bélgica", BRA: "Brasil", ARG: "Argentina",
  URY: "Uruguai", COL: "Colômbia", CHL: "Chile", PER: "Peru", VEN: "Venezuela",
  ECU: "Equador", MEX: "México", USA: "EUA", CAN: "Canadá",
  SEN: "Senegal", CIV: "Costa do Marfim", GHA: "Gana", NGA: "Nigéria", CMR: "Camarões",
  MAR: "Marrocos", DZA: "Argélia", TUN: "Tunísia", EGY: "Egito", ZAF: "África do Sul",
  MOZ: "Moçambique", AGO: "Angola", ETH: "Etiópia", MLI: "Mali", GIN: "Guiné",
  JPN: "Japão", KOR: "Coreia do Sul", CHN: "China", AUS: "Austrália",
  RUS: "Rússia", UKR: "Ucrânia", POL: "Polónia", HRV: "Croácia", SRB: "Sérvia",
  DNK: "Dinamarca", SWE: "Suécia", NOR: "Noruega", IRL: "Irlanda",
  TUR: "Turquia", GRC: "Grécia", ROU: "Roménia", HUN: "Hungria", CZE: "Rep. Checa",
  AUT: "Áustria", CHE: "Suíça", SVN: "Eslovénia", SVK: "Eslováquia",
  BIH: "Bósnia", MNE: "Montenegro",
}
