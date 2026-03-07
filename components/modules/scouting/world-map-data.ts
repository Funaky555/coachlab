export interface CountryData {
  code: string
  name: string
  aliases: string[]
  cx: number
  cy: number
  path: string
}

// Mapa de normalização: texto livre → código ISO
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
  // Inglaterra / Reino Unido
  "inglaterra": "ENG", "england": "ENG", "inglês": "ENG", "british": "ENG",
  "reino unido": "ENG", "united kingdom": "ENG",
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

export function getNationalityCode(nacionalidade?: string): string | null {
  if (!nacionalidade) return null
  const key = nacionalidade.toLowerCase().trim()
  return NATIONALITY_TO_CODE[key] ?? null
}

// Países com paths SVG simplificados — projeção equirectangular 1000x500
// Fontes: Natural Earth 110m simplificado
export const COUNTRY_PATHS: CountryData[] = [
  {
    code: "PRT", name: "Portugal", aliases: ["portugal"],
    cx: 86, cy: 230,
    path: "M82,218 L88,215 L91,221 L89,229 L86,232 L82,228 Z"
  },
  {
    code: "ESP", name: "Espanha", aliases: ["espanha"],
    cx: 112, cy: 225,
    path: "M88,215 L130,213 L132,220 L125,232 L110,235 L96,230 L89,229 L91,221 Z"
  },
  {
    code: "FRA", name: "França", aliases: ["franca"],
    cx: 135, cy: 205,
    path: "M110,195 L148,193 L152,200 L148,210 L132,220 L130,213 L114,210 L108,200 Z"
  },
  {
    code: "DEU", name: "Alemanha", aliases: ["alemanha"],
    cx: 168, cy: 188,
    path: "M150,178 L185,176 L188,185 L182,195 L165,197 L152,193 L148,185 Z"
  },
  {
    code: "ITA", name: "Itália", aliases: ["italia"],
    cx: 175, cy: 220,
    path: "M158,205 L175,203 L180,210 L178,220 L170,235 L162,245 L158,235 L155,220 L158,210 Z"
  },
  {
    code: "ENG", name: "Inglaterra", aliases: ["inglaterra", "england"],
    cx: 125, cy: 180,
    path: "M118,172 L133,170 L135,178 L130,186 L120,188 L116,181 Z"
  },
  {
    code: "NLD", name: "Holanda", aliases: ["holanda"],
    cx: 152, cy: 180,
    path: "M148,175 L160,174 L162,180 L158,184 L148,184 L146,179 Z"
  },
  {
    code: "BEL", name: "Bélgica", aliases: ["belgica"],
    cx: 148, cy: 190,
    path: "M140,186 L155,185 L157,190 L152,195 L140,194 L138,190 Z"
  },
  {
    code: "CHE", name: "Suíça", aliases: ["suica"],
    cx: 155, cy: 205,
    path: "M148,202 L165,200 L166,207 L160,210 L148,209 Z"
  },
  {
    code: "AUT", name: "Áustria", aliases: ["austria"],
    cx: 178, cy: 200,
    path: "M166,197 L192,196 L194,202 L185,205 L166,204 Z"
  },
  {
    code: "POL", name: "Polónia", aliases: ["polonia"],
    cx: 193, cy: 180,
    path: "M183,172 L210,171 L212,180 L205,186 L182,186 L180,180 Z"
  },
  {
    code: "CZE", name: "Rep. Checa", aliases: ["checa"],
    cx: 186, cy: 190,
    path: "M175,187 L200,186 L202,192 L195,196 L174,195 Z"
  },
  {
    code: "HUN", name: "Hungria", aliases: ["hungria"],
    cx: 197, cy: 202,
    path: "M185,198 L212,197 L214,205 L205,209 L184,208 Z"
  },
  {
    code: "ROU", name: "Roménia", aliases: ["romenia"],
    cx: 215, cy: 205,
    path: "M205,198 L230,197 L232,208 L220,214 L204,212 L202,205 Z"
  },
  {
    code: "HRV", name: "Croácia", aliases: ["croacia"],
    cx: 188, cy: 215,
    path: "M178,210 L200,209 L202,218 L190,222 L176,219 Z"
  },
  {
    code: "SRB", name: "Sérvia", aliases: ["servia"],
    cx: 202, cy: 218,
    path: "M196,212 L214,211 L216,221 L206,224 L194,222 Z"
  },
  {
    code: "SVN", name: "Eslovénia", aliases: ["eslovenia"],
    cx: 177, cy: 208,
    path: "M170,205 L184,204 L185,210 L178,213 L169,211 Z"
  },
  {
    code: "SVK", name: "Eslováquia", aliases: ["eslovaquia"],
    cx: 196, cy: 192,
    path: "M185,189 L210,188 L211,194 L198,197 L184,196 Z"
  },
  {
    code: "GRC", name: "Grécia", aliases: ["grecia"],
    cx: 213, cy: 230,
    path: "M204,224 L224,222 L226,232 L218,238 L204,236 Z"
  },
  {
    code: "TUR", name: "Turquia", aliases: ["turquia"],
    cx: 245, cy: 220,
    path: "M222,213 L275,211 L278,222 L265,228 L220,226 L218,220 Z"
  },
  {
    code: "UKR", name: "Ucrânia", aliases: ["ucrania"],
    cx: 228, cy: 188,
    path: "M208,178 L255,177 L258,192 L240,198 L206,195 L204,185 Z"
  },
  {
    code: "RUS", name: "Rússia", aliases: ["russia"],
    cx: 350, cy: 155,
    path: "M210,120 L490,118 L500,160 L450,175 L300,178 L208,168 Z"
  },
  {
    code: "DNK", name: "Dinamarca", aliases: ["dinamarca"],
    cx: 162, cy: 165,
    path: "M155,160 L170,159 L172,166 L165,170 L154,169 Z"
  },
  {
    code: "SWE", name: "Suécia", aliases: ["suecia"],
    cx: 178, cy: 150,
    path: "M165,130 L190,128 L195,155 L182,165 L162,162 L160,148 Z"
  },
  {
    code: "NOR", name: "Noruega", aliases: ["noruega"],
    cx: 162, cy: 138,
    path: "M142,120 L175,118 L180,135 L167,145 L145,140 L138,128 Z"
  },
  {
    code: "IRL", name: "Irlanda", aliases: ["irlanda"],
    cx: 108, cy: 172,
    path: "M102,167 L116,165 L118,173 L112,178 L101,176 Z"
  },
  {
    code: "MNE", name: "Montenegro", aliases: ["montenegro"],
    cx: 196, cy: 223,
    path: "M191,220 L202,219 L203,225 L196,228 L190,226 Z"
  },
  {
    code: "BIH", name: "Bósnia", aliases: ["bosnia"],
    cx: 188, cy: 220,
    path: "M180,216 L198,215 L200,222 L190,226 L178,224 Z"
  },
  // BRASIL
  {
    code: "BRA", name: "Brasil", aliases: ["brasil"],
    cx: 270, cy: 330,
    path: "M220,290 L295,285 L315,300 L320,335 L300,360 L265,365 L240,350 L222,325 Z"
  },
  // ARGENTINA
  {
    code: "ARG", name: "Argentina", aliases: ["argentina"],
    cx: 258, cy: 380,
    path: "M240,355 L280,353 L284,385 L270,420 L248,418 L238,390 Z"
  },
  // COLÔMBIA
  {
    code: "COL", name: "Colômbia", aliases: ["colombia"],
    cx: 235, cy: 305,
    path: "M218,292 L255,290 L258,308 L245,318 L218,316 Z"
  },
  // VENEZUELA
  {
    code: "VEN", name: "Venezuela", aliases: ["venezuela"],
    cx: 255, cy: 295,
    path: "M240,285 L275,283 L278,295 L262,302 L238,300 Z"
  },
  // CHILE
  {
    code: "CHL", name: "Chile", aliases: ["chile"],
    cx: 242, cy: 385,
    path: "M234,355 L248,353 L250,400 L240,420 L230,415 L232,380 Z"
  },
  // PERU
  {
    code: "PER", name: "Peru", aliases: ["peru"],
    cx: 232, cy: 340,
    path: "M218,318 L248,316 L250,345 L240,360 L215,358 Z"
  },
  // EQUADOR
  {
    code: "ECU", name: "Equador", aliases: ["equador"],
    cx: 222, cy: 315,
    path: "M214,308 L234,307 L236,320 L224,325 L212,323 Z"
  },
  // URUGUAI
  {
    code: "URY", name: "Uruguai", aliases: ["uruguai"],
    cx: 278, cy: 378,
    path: "M265,365 L290,363 L292,380 L278,385 L263,382 Z"
  },
  // MÉXICO
  {
    code: "MEX", name: "México", aliases: ["mexico"],
    cx: 168, cy: 268,
    path: "M140,255 L200,253 L205,270 L190,282 L145,280 Z"
  },
  // EUA
  {
    code: "USA", name: "EUA", aliases: ["eua", "usa"],
    cx: 165, cy: 220,
    path: "M100,195 L225,192 L230,225 L215,240 L100,238 L95,222 Z"
  },
  // CANADA
  {
    code: "CAN", name: "Canadá", aliases: ["canada"],
    cx: 155, cy: 165,
    path: "M85,135 L230,132 L235,175 L215,190 L82,188 Z"
  },
  // MARROCOS
  {
    code: "MAR", name: "Marrocos", aliases: ["marrocos"],
    cx: 113, cy: 248,
    path: "M100,238 L130,236 L132,255 L118,262 L98,259 Z"
  },
  // ARGÉLIA
  {
    code: "DZA", name: "Argélia", aliases: ["argelia"],
    cx: 145, cy: 252,
    path: "M130,238 L170,236 L172,260 L158,268 L128,266 Z"
  },
  // TUNÍSIA
  {
    code: "TUN", name: "Tunísia", aliases: ["tunisia"],
    cx: 170, cy: 242,
    path: "M164,232 L180,231 L182,248 L172,252 L162,250 Z"
  },
  // EGIPTO
  {
    code: "EGY", name: "Egito", aliases: ["egito"],
    cx: 215, cy: 252,
    path: "M196,238 L235,236 L237,265 L218,270 L194,268 Z"
  },
  // SENEGAL
  {
    code: "SEN", name: "Senegal", aliases: ["senegal"],
    cx: 94, cy: 278,
    path: "M82,268 L108,266 L110,282 L96,288 L80,285 Z"
  },
  // MALI
  {
    code: "MLI", name: "Mali", aliases: ["mali"],
    cx: 120, cy: 278,
    path: "M108,262 L148,260 L150,285 L132,292 L106,289 Z"
  },
  // GUINÉ
  {
    code: "GIN", name: "Guiné", aliases: ["guine"],
    cx: 94, cy: 292,
    path: "M80,285 L110,283 L112,300 L96,305 L78,302 Z"
  },
  // COSTA DO MARFIM
  {
    code: "CIV", name: "Costa do Marfim", aliases: ["marfim"],
    cx: 115, cy: 300,
    path: "M105,290 L130,288 L132,308 L118,312 L103,310 Z"
  },
  // GANA
  {
    code: "GHA", name: "Gana", aliases: ["gana"],
    cx: 128, cy: 302,
    path: "M122,290 L140,289 L142,308 L130,312 L120,310 Z"
  },
  // NIGÉRIA
  {
    code: "NGA", name: "Nigéria", aliases: ["nigeria"],
    cx: 150, cy: 295,
    path: "M138,280 L168,278 L170,305 L155,312 L136,308 Z"
  },
  // CAMARÕES
  {
    code: "CMR", name: "Camarões", aliases: ["camaroes"],
    cx: 168, cy: 300,
    path: "M162,285 L182,283 L184,308 L170,314 L160,310 Z"
  },
  // ANGOLA
  {
    code: "AGO", name: "Angola", aliases: ["angola"],
    cx: 178, cy: 335,
    path: "M162,318 L198,316 L200,348 L180,355 L160,350 Z"
  },
  // ETIÓPIA
  {
    code: "ETH", name: "Etiópia", aliases: ["etiopia"],
    cx: 245, cy: 295,
    path: "M228,280 L265,278 L268,305 L248,312 L226,308 Z"
  },
  // AFRICA DO SUL
  {
    code: "ZAF", name: "África do Sul", aliases: ["africa do sul"],
    cx: 202, cy: 380,
    path: "M178,358 L225,356 L228,390 L205,400 L178,395 Z"
  },
  // MOÇAMBIQUE
  {
    code: "MOZ", name: "Moçambique", aliases: ["mocambique"],
    cx: 220, cy: 358,
    path: "M210,335 L232,333 L234,368 L220,375 L208,370 Z"
  },
  // JAPÃO
  {
    code: "JPN", name: "Japão", aliases: ["japao"],
    cx: 468, cy: 208,
    path: "M458,198 L480,196 L482,215 L468,220 L456,218 Z"
  },
  // COREIA DO SUL
  {
    code: "KOR", name: "Coreia do Sul", aliases: ["coreia do sul"],
    cx: 450, cy: 215,
    path: "M440,207 L460,205 L462,222 L448,226 L438,224 Z"
  },
  // CHINA
  {
    code: "CHN", name: "China", aliases: ["china"],
    cx: 415, cy: 215,
    path: "M355,185 L455,182 L460,225 L435,240 L355,238 L350,220 Z"
  },
  // AUSTRÁLIA
  {
    code: "AUS", name: "Austrália", aliases: ["australia"],
    cx: 448, cy: 358,
    path: "M388,325 L508,322 L515,385 L460,400 L385,395 Z"
  },
]
