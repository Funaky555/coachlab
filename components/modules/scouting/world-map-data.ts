// Mapa de normalização: texto livre → código ISO-3
// Cobre: nomes de país (PT+EN), adjetivos masculinos/femininos, códigos ISO diretos
export const NATIONALITY_TO_CODE: Record<string, string> = {
  // Códigos ISO diretos (ex: utilizador digita "PRT", "BRA", "AUS")
  "prt": "PRT", "esp": "ESP", "fra": "FRA", "deu": "DEU", "ita": "ITA",
  "gbr": "GBR", "nld": "NLD", "bel": "BEL", "bra": "BRA", "arg": "ARG",
  "ury": "URY", "col": "COL", "chl": "CHL", "per": "PER", "ven": "VEN",
  "ecu": "ECU", "mex": "MEX", "usa": "USA", "can": "CAN",
  "sen": "SEN", "civ": "CIV", "gha": "GHA", "nga": "NGA", "cmr": "CMR",
  "mar": "MAR", "dza": "DZA", "tun": "TUN", "egy": "EGY", "zaf": "ZAF",
  "moz": "MOZ", "ago": "AGO", "eth": "ETH", "mli": "MLI", "gin": "GIN",
  "jpn": "JPN", "kor": "KOR", "chn": "CHN", "aus": "AUS",
  "rus": "RUS", "ukr": "UKR", "pol": "POL", "hrv": "HRV", "srb": "SRB",
  "dnk": "DNK", "swe": "SWE", "nor": "NOR", "che": "CHE", "aut": "AUT",
  "cze": "CZE", "hun": "HUN", "rou": "ROU", "tur": "TUR", "grc": "GRC",
  "svn": "SVN", "svk": "SVK", "mne": "MNE", "bih": "BIH", "irl": "IRL",

  // Portugal
  "portugal": "PRT", "português": "PRT", "portuguesa": "PRT", "portuguese": "PRT",
  // Espanha
  "espanha": "ESP", "spain": "ESP", "español": "ESP", "espanhol": "ESP", "espanhola": "ESP", "spanish": "ESP",
  // França
  "frança": "FRA", "franca": "FRA", "france": "FRA", "français": "FRA", "francês": "FRA", "francesa": "FRA", "franceses": "FRA", "french": "FRA",
  // Alemanha
  "alemanha": "DEU", "germany": "DEU", "deutsch": "DEU", "alemão": "DEU", "alemoa": "DEU", "alemã": "DEU", "alemao": "DEU", "german": "DEU",
  // Itália
  "itália": "ITA", "italia": "ITA", "italy": "ITA", "italiano": "ITA", "italiana": "ITA", "italian": "ITA",
  // Inglaterra / Reino Unido
  "inglaterra": "GBR", "england": "GBR", "inglês": "GBR", "ingles": "GBR", "inglesa": "GBR",
  "reino unido": "GBR", "united kingdom": "GBR", "uk": "GBR", "english": "GBR", "british": "GBR",
  // Holanda
  "holanda": "NLD", "netherlands": "NLD", "países baixos": "NLD", "paises baixos": "NLD",
  "holandês": "NLD", "holandes": "NLD", "holandesa": "NLD", "dutch": "NLD",
  // Bélgica
  "bélgica": "BEL", "belgica": "BEL", "belgium": "BEL", "belga": "BEL", "belgian": "BEL",
  // Brasil
  "brasil": "BRA", "brazil": "BRA", "brasileiro": "BRA", "brasileira": "BRA", "brazilian": "BRA",
  // Argentina
  "argentina": "ARG", "argentino": "ARG", "argentinian": "ARG", "argentinean": "ARG",
  // Uruguai
  "uruguai": "URY", "uruguay": "URY", "uruguaio": "URY", "uruguaia": "URY", "uruguayan": "URY",
  // Colômbia
  "colômbia": "COL", "colombia": "COL", "colombiano": "COL", "colombiana": "COL", "colombian": "COL",
  // Chile
  "chile": "CHL", "chileno": "CHL", "chilena": "CHL", "chilean": "CHL",
  // Peru
  "peru": "PER", "peruano": "PER", "peruana": "PER", "peruvian": "PER",
  // Venezuela
  "venezuela": "VEN", "venezuelano": "VEN", "venezuelana": "VEN", "venezuelan": "VEN",
  // Equador
  "equador": "ECU", "ecuador": "ECU", "equatoriano": "ECU", "equatoriana": "ECU", "ecuadorian": "ECU",
  // México
  "méxico": "MEX", "mexico": "MEX", "mexicano": "MEX", "mexicana": "MEX", "mexican": "MEX",
  // EUA
  "eua": "USA", "estados unidos": "USA", "united states": "USA", "americano": "USA", "americana": "USA", "american": "USA",
  // Canadá
  "canadá": "CAN", "canada": "CAN", "canadiano": "CAN", "canadiana": "CAN", "canadian": "CAN",
  // Senegal
  "senegal": "SEN", "senegalês": "SEN", "senegales": "SEN", "senegalesa": "SEN", "senegalese": "SEN",
  // Costa do Marfim
  "costa do marfim": "CIV", "costa marfim": "CIV", "ivory coast": "CIV", "côte d'ivoire": "CIV", "cote d'ivoire": "CIV",
  "marfinense": "CIV", "ivoriano": "CIV", "ivoriana": "CIV",
  // Gana
  "gana": "GHA", "ghana": "GHA", "ganês": "GHA", "ganes": "GHA", "ganesa": "GHA", "ghanaian": "GHA",
  // Nigéria
  "nigéria": "NGA", "nigeria": "NGA", "nigeriano": "NGA", "nigeriana": "NGA", "nigerian": "NGA",
  // Camarões
  "camarões": "CMR", "camaroes": "CMR", "cameroon": "CMR", "camaronês": "CMR", "camaronesa": "CMR", "cameroonian": "CMR",
  // Marrocos
  "marrocos": "MAR", "morocco": "MAR", "marroquino": "MAR", "marroquina": "MAR", "moroccan": "MAR",
  // Egito
  "egito": "EGY", "egypt": "EGY", "egípcio": "EGY", "egipcio": "EGY", "egípcia": "EGY", "egyptian": "EGY",
  // África do Sul
  "áfrica do sul": "ZAF", "africa do sul": "ZAF", "south africa": "ZAF",
  "sul-africano": "ZAF", "sul africano": "ZAF", "sul-africana": "ZAF", "south african": "ZAF",
  // Tunísia
  "tunísia": "TUN", "tunisia": "TUN", "tunisino": "TUN", "tunisina": "TUN", "tunisian": "TUN",
  // Argélia
  "argélia": "DZA", "argelia": "DZA", "algeria": "DZA", "argelino": "DZA", "argelina": "DZA", "algerian": "DZA",
  // Mali
  "mali": "MLI", "maliano": "MLI", "maliana": "MLI", "malian": "MLI",
  // Guiné
  "guiné": "GIN", "guine": "GIN", "guinea": "GIN", "guineano": "GIN", "guineana": "GIN",
  // Etiópia
  "etiópia": "ETH", "etiopia": "ETH", "ethiopia": "ETH", "etíope": "ETH", "ethiopian": "ETH",
  // Angola
  "angola": "AGO", "angolano": "AGO", "angolana": "AGO", "angolan": "AGO",
  // Moçambique
  "moçambique": "MOZ", "mocambique": "MOZ", "mozambique": "MOZ",
  "moçambicano": "MOZ", "mocambicano": "MOZ", "mozambican": "MOZ",
  // Japão
  "japão": "JPN", "japao": "JPN", "japan": "JPN", "japonês": "JPN", "japones": "JPN", "japonesa": "JPN", "japanese": "JPN",
  // Coreia do Sul
  "coreia do sul": "KOR", "coreia": "KOR", "south korea": "KOR", "korea": "KOR",
  "coreano": "KOR", "coreana": "KOR", "korean": "KOR", "south korean": "KOR",
  // China
  "china": "CHN", "chinês": "CHN", "chines": "CHN", "chinesa": "CHN", "chinese": "CHN",
  // Austrália
  "austrália": "AUS", "australia": "AUS", "australiano": "AUS", "australiana": "AUS", "australian": "AUS",
  // Rússia
  "rússia": "RUS", "russia": "RUS", "russo": "RUS", "russa": "RUS", "russian": "RUS",
  // Ucrânia
  "ucrânia": "UKR", "ucrania": "UKR", "ukraine": "UKR", "ucraniano": "UKR", "ucraniana": "UKR", "ukrainian": "UKR",
  // Polónia
  "polónia": "POL", "polonia": "POL", "poland": "POL", "polaco": "POL", "polaca": "POL", "polish": "POL",
  // Croácia
  "croácia": "HRV", "croacia": "HRV", "croatia": "HRV", "croata": "HRV", "croatian": "HRV",
  // Sérvia
  "sérvia": "SRB", "servia": "SRB", "serbia": "SRB", "sérvio": "SRB", "servio": "SRB", "serbian": "SRB",
  // Dinamarca
  "dinamarca": "DNK", "denmark": "DNK", "dinamarquês": "DNK", "dinamarques": "DNK", "dinamarquesa": "DNK", "danish": "DNK",
  // Suécia
  "suécia": "SWE", "suecia": "SWE", "sweden": "SWE", "sueco": "SWE", "sueca": "SWE", "swedish": "SWE",
  // Noruega
  "noruega": "NOR", "norway": "NOR", "norueguês": "NOR", "noruegues": "NOR", "norueguesa": "NOR", "norwegian": "NOR",
  // Suíça
  "suíça": "CHE", "suica": "CHE", "switzerland": "CHE", "suíço": "CHE", "suico": "CHE", "swiss": "CHE",
  // Áustria
  "áustria": "AUT", "austria": "AUT", "austríaco": "AUT", "austriaco": "AUT", "austríaca": "AUT", "austrian": "AUT",
  // República Checa
  "república checa": "CZE", "republica checa": "CZE", "czech republic": "CZE", "czechia": "CZE",
  "checo": "CZE", "checa": "CZE", "czech": "CZE",
  // Hungria
  "hungria": "HUN", "hungary": "HUN", "húngaro": "HUN", "hungaro": "HUN", "húngara": "HUN", "hungarian": "HUN",
  // Roménia
  "roménia": "ROU", "romenia": "ROU", "romania": "ROU", "romeno": "ROU", "romena": "ROU", "romanian": "ROU",
  // Turquia
  "turquia": "TUR", "turkey": "TUR", "turco": "TUR", "turca": "TUR", "turkish": "TUR",
  // Grécia
  "grécia": "GRC", "grecia": "GRC", "greece": "GRC", "grego": "GRC", "grega": "GRC", "greek": "GRC",
  // Eslovénia
  "eslovénia": "SVN", "eslovenia": "SVN", "slovenia": "SVN", "esloveno": "SVN", "eslovena": "SVN", "slovenian": "SVN",
  // Eslováquia
  "eslováquia": "SVK", "eslovaquia": "SVK", "slovakia": "SVK", "eslovaco": "SVK", "eslovaca": "SVK", "slovak": "SVK",
  // Montenegro
  "montenegro": "MNE", "montenegrino": "MNE", "montenegrina": "MNE", "montenegrin": "MNE",
  // Bósnia
  "bósnia": "BIH", "bosnia": "BIH", "bósnio": "BIH", "bosnio": "BIH", "bósnia e herzegovina": "BIH", "bosnian": "BIH",
  // Irlanda
  "irlanda": "IRL", "ireland": "IRL", "irlandês": "IRL", "irlandes": "IRL", "irlandesa": "IRL", "irish": "IRL",
  // Escócia (aparece como GBR no mapa)
  "escócia": "GBR", "escocia": "GBR", "scotland": "GBR", "escocês": "GBR", "escoces": "GBR", "scottish": "GBR",
  // País de Gales (aparece como GBR no mapa)
  "país de gales": "GBR", "pais de gales": "GBR", "wales": "GBR", "welsh": "GBR",
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

// Bandeiras emoji por ISO-3
export const COUNTRY_FLAGS: Record<string, string> = {
  PRT: "🇵🇹", ESP: "🇪🇸", FRA: "🇫🇷", DEU: "🇩🇪", ITA: "🇮🇹",
  GBR: "🇬🇧", NLD: "🇳🇱", BEL: "🇧🇪", BRA: "🇧🇷", ARG: "🇦🇷",
  URY: "🇺🇾", COL: "🇨🇴", CHL: "🇨🇱", PER: "🇵🇪", VEN: "🇻🇪",
  ECU: "🇪🇨", MEX: "🇲🇽", USA: "🇺🇸", CAN: "🇨🇦", SEN: "🇸🇳",
  CIV: "🇨🇮", GHA: "🇬🇭", NGA: "🇳🇬", CMR: "🇨🇲", MAR: "🇲🇦",
  DZA: "🇩🇿", TUN: "🇹🇳", EGY: "🇪🇬", ZAF: "🇿🇦", MOZ: "🇲🇿",
  AGO: "🇦🇴", ETH: "🇪🇹", MLI: "🇲🇱", GIN: "🇬🇳", JPN: "🇯🇵",
  KOR: "🇰🇷", CHN: "🇨🇳", AUS: "🇦🇺", RUS: "🇷🇺", UKR: "🇺🇦",
  POL: "🇵🇱", HRV: "🇭🇷", SRB: "🇷🇸", DNK: "🇩🇰", SWE: "🇸🇪",
  NOR: "🇳🇴", IRL: "🇮🇪", TUR: "🇹🇷", GRC: "🇬🇷", ROU: "🇷🇴",
  HUN: "🇭🇺", CZE: "🇨🇿", AUT: "🇦🇹", CHE: "🇨🇭", SVN: "🇸🇮",
  SVK: "🇸🇰", BIH: "🇧🇦", MNE: "🇲🇪",
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
