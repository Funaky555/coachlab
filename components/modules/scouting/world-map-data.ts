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

// Mapeamento ID UN M49 → ISO-3
// IMPORTANTE: world-atlas armazena IDs como strings de 3 dígitos com zeros à esquerda
// Ex: Austrália = "036", Brasil = "076", Argentina = "032"
export const UN_TO_ISO3: Record<string, string> = {
  "004": "AFG", "008": "ALB", "012": "DZA", "024": "AGO", "031": "AZE",
  "032": "ARG", "036": "AUS", "040": "AUT", "050": "BGD", "056": "BEL",
  "068": "BOL", "070": "BIH", "076": "BRA", "100": "BGR", "104": "MMR",
  "108": "BDI", "112": "BLR", "116": "KHM", "120": "CMR", "124": "CAN",
  "140": "CAF", "144": "LKA", "148": "TCD", "152": "CHL", "156": "CHN",
  "170": "COL", "178": "COG", "180": "COD", "188": "CRI", "191": "HRV",
  "192": "CUB", "196": "CYP", "203": "CZE", "204": "BEN", "208": "DNK",
  "214": "DOM", "218": "ECU", "222": "SLV", "226": "GNQ", "231": "ETH",
  "232": "ERI", "233": "EST", "242": "FJI", "246": "FIN", "250": "FRA",
  "262": "DJI", "266": "GAB", "268": "GEO", "270": "GMB", "275": "PSE",
  "276": "DEU", "288": "GHA", "300": "GRC", "304": "GRL", "320": "GTM",
  "324": "GIN", "328": "GUY", "332": "HTI", "340": "HND", "348": "HUN",
  "352": "ISL", "356": "IND", "360": "IDN", "364": "IRN", "368": "IRQ",
  "372": "IRL", "376": "ISR", "380": "ITA", "384": "CIV", "388": "JAM",
  "392": "JPN", "398": "KAZ", "400": "JOR", "404": "KEN", "408": "PRK",
  "410": "KOR", "414": "KWT", "417": "KGZ", "418": "LAO", "422": "LBN",
  "426": "LSO", "428": "LVA", "430": "LBR", "434": "LBY", "440": "LTU",
  "442": "LUX", "450": "MDG", "454": "MWI", "458": "MYS", "466": "MLI",
  "478": "MRT", "484": "MEX", "496": "MNG", "498": "MDA", "499": "MNE",
  "504": "MAR", "508": "MOZ", "512": "OMN", "516": "NAM", "524": "NPL",
  "528": "NLD", "540": "NCL", "554": "NZL", "558": "NIC", "562": "NER",
  "566": "NGA", "578": "NOR", "586": "PAK", "591": "PAN", "598": "PNG",
  "600": "PRY", "604": "PER", "608": "PHL", "616": "POL", "620": "PRT",
  "624": "GNB", "634": "QAT", "642": "ROU", "643": "RUS", "646": "RWA",
  "682": "SAU", "686": "SEN", "688": "SRB", "694": "SLE", "703": "SVK",
  "704": "VNM", "705": "SVN", "706": "SOM", "710": "ZAF", "716": "ZWE",
  "724": "ESP", "728": "SSD", "729": "SDN", "740": "SUR", "748": "SWZ",
  "752": "SWE", "756": "CHE", "760": "SYR", "762": "TJK", "764": "THA",
  "768": "TGO", "780": "TTO", "784": "ARE", "788": "TUN", "792": "TUR",
  "795": "TKM", "800": "UGA", "804": "UKR", "807": "MKD", "818": "EGY",
  "826": "GBR", "834": "TZA", "840": "USA", "854": "BFA", "858": "URY",
  "860": "UZB", "862": "VEN", "887": "YEM", "894": "ZMB",
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
