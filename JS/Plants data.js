/**
 * PLANTS-DATA.JS — Ervas & Vida
 * Banco de dados local único das plantas medicinais.
 *
 * Antes, esses dados existiam duplicados e DIFERENTES em dois lugares:
 * dentro de homepage.js (12 plantas, com rating/tags/etc.) e dentro de
 * perfilpage.js (6 plantas completamente distintas, sem id, sem rating).
 * Isso impedia o perfil de saber quais plantas reais o usuário favoritou
 * na home — eram "mundos" de dados diferentes.
 *
 * Agora existe um único array, carregado por qualquer página que precise
 * dele (home, perfil, busca, etc.) via:
 *   <script src="JS/plants-data.js"></script>
 * — sempre ANTES do script que for usar a variável PLANTS.
 */

const PLANTS = [
  {
    id: 1,
    name: 'Marcela',
    sci: 'Achyrocline satureioides',
    img: 'ING/Slides/marcela.jpg',
    imgAlt: 'Ramo de Marcela com flores amarelas pequenas',
    badge: 'Popular',
    badgeType: '',
    desc: 'Tradicionalmente usada em chás digestivos e calmantes, nativa do Rio Grande do Sul.',
    tags: ['chá', 'calmante', 'digestivo'],
    rating: 4.9,
    reviews: 382,
    url: 'plantas/plantas marcela.html',
  },
  {
    id: 2,
    name: 'Hortelã',
    sci: 'Mentha piperita',
    img: 'ING/Slides/ortelã.jpg',
    imgAlt: 'Folhas frescas de hortelã com gotas de água',
    badge: 'Refrescante',
    badgeType: '',
    desc: 'Poderosa ação digestiva e analgésica. Alivia dores de cabeça, enjoos e problemas gastrointestinais.',
    tags: ['chá', 'digestivo', 'gel'],
    rating: 4.8,
    reviews: 291,
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 3,
    name: 'Babosa',
    sci: 'Aloe vera',
    img: 'ING/Slides/babosa.jpg',
    imgAlt: 'Folhas verdes e espessas de babosa ao lado de um pote de vidro contendo gel transparente extraído da planta.',
    badge: 'Cicatrizante',
    badgeType: 'accent',
    desc: 'Ação sedativa suave, antisséptica e antifúngica. Ideal para ansiedade, insônia e cuidados com a pele.',
    tags: ['cicatrização', 'externa', 'gel'],
    rating: 4.7,
    reviews: 213,
    url: 'plantas/babosa.html',
  },
  {
    id: 4,
    name: 'Boldo',
    sci: 'Peumus boldus',
    img: null,
    imgAlt: 'Folhas de boldo de cor verde escura',
    badge: 'Digestivo',
    badgeType: '',
    desc: 'Protetor hepático por excelência. Estimula a produção de bile, auxilia na digestão e no funcionamento do fígado.',
    tags: ['chá', 'digestivo'],
    rating: 4.6,
    reviews: 178,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 5,
    name: 'Gengibre',
    sci: 'Zingiber officinale',
    img: null,
    imgAlt: 'Raiz de gengibre fresca e folhas verdes',
    badge: 'Termogênico',
    badgeType: 'accent',
    desc: 'Anti-inflamatório e antioxidante potente. Combate náuseas, melhora a circulação e fortalece a imunidade.',
    tags: ['chá', 'xarope', 'digestivo'],
    rating: 4.8,
    reviews: 344,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 6,
    name: 'Erva-cidreira',
    sci: 'Melissa officinalis',
    img: null,
    imgAlt: 'Folhas verdes brilhantes de erva-cidreira com bordas serrilhadas',
    badge: 'Sedativo',
    badgeType: '',
    desc: 'Famosa por seus efeitos ansiolíticos e calmantes. Reduz o estresse, melhora o sono e alivia enxaquecas.',
    tags: ['chá', 'calmante'],
    rating: 4.5,
    reviews: 156,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 7,
    name: 'Alecrim',
    sci: 'Salvia rosmarinus',
    img: null,
    imgAlt: 'Ramos de alecrim com flores roxas e folhas em agulha',
    badge: 'Memória',
    badgeType: '',
    desc: 'Estimulante da circulação cerebral. Melhora memória, concentração e combate a fadiga mental.',
    tags: ['chá', 'externa', 'compressa'],
    rating: 4.4,
    reviews: 132,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 8,
    name: 'Equinácea',
    sci: 'Echinacea purpurea',
    img: null,
    imgAlt: 'Flores de equinácea com pétalas rosa e centro espinhoso',
    badge: 'Imunidade',
    badgeType: 'accent',
    desc: 'Poderoso imunoestimulante natural. Reduz a duração de resfriados e infecções respiratórias.',
    tags: ['xarope', 'chá'],
    rating: 4.7,
    reviews: 267,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 9,
    name: 'Calêndula',
    sci: 'Calendula officinalis',
    img: null,
    imgAlt: 'Flores de calêndula laranja-amarelo vibrantes',
    badge: 'Pele',
    badgeType: '',
    desc: 'Anti-inflamatória e cicatrizante excepcional. Ideal para cuidados com a pele, queimaduras e dermatites.',
    tags: ['gel', 'externa', 'compressa'],
    rating: 4.6,
    reviews: 198,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 10,
    name: 'Urtiga',
    sci: 'Urtica dioica',
    img: null,
    imgAlt: 'Planta de urtiga com folhas verdes dentadas',
    badge: 'Nutritiva',
    badgeType: '',
    desc: 'Rica em ferro, vitaminas e minerais. Excelente para anemia, artrite e problemas urinários.',
    tags: ['chá', 'compressa'],
    rating: 4.3,
    reviews: 89,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 11,
    name: 'Própolis',
    sci: 'Propolis extractum',
    img: null,
    imgAlt: 'Extrato de própolis dourado em frasco de vidro',
    badge: 'Antisséptico',
    badgeType: 'accent',
    desc: 'Antibacteriano e antiviral natural produzido pelas abelhas. Protege a garganta e fortalece a imunidade.',
    tags: ['xarope', 'externa'],
    rating: 4.9,
    reviews: 412,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },
  {
    id: 12,
    name: 'Valeriana',
    sci: 'Valeriana officinalis',
    img: null,
    imgAlt: 'Raiz e flores de valeriana com flores brancas delicadas',
    badge: 'Sono',
    badgeType: '',
    desc: 'Um dos mais eficazes sedativos naturais. Combate insônia, ansiedade e tensão nervosa sem dependência.',
    tags: ['chá', 'calmante'],
    rating: 4.6,
    reviews: 224,
    emoji: '🌿',
    url: null, // ainda sem página própria — card mostra aviso "em construção"
  },

  /* ================================================================
     PLANTAS 13–21 — adicionadas a partir da planilha "Projeto - Seu
     Jardim", cada uma já com página própria gerada a partir do
     modelo plantas_-_marcela.html (ver pasta /plantas).
     Mantidas separadas das 1–12 originais por pedido explícito —
     a lista anterior continua intacta, estas são um acréscimo.
  ================================================================ */
  {
    id: 13,
    name: 'Carqueja',
    sci: 'Baccharis trimera',
    img: 'ING/Slides/carqueja.jpg',
    imgAlt: 'Ramos verde-acinzentados e alados de carqueja',
    badge: 'Digestiva',
    badgeType: '',
    desc: 'Tônico amargo tradicional gaúcho, usado para digestão, proteção hepática e apoio glicêmico.',
    tags: ['chá', 'digestivo'],
    rating: 4.5,
    reviews: 0,
    emoji: '🌾',
    url: 'plantas/carqueja.html',
  },
  {
    id: 14,
    name: 'Espinheira-santa',
    sci: 'Maytenus ilicifolia',
    img: 'ING/Slides/espinheira-santa.webp',
    imgAlt: 'Folhas coriáceas e espinhosas de espinheira-santa',
    badge: 'Gástrica',
    badgeType: 'accent',
    desc: 'Uma das plantas mais estudadas para gastrite, refluxo e proteção da mucosa estomacal.',
    tags: ['chá', 'digestivo'],
    rating: 4.7,
    reviews: 0,
    emoji: '🍃',
    url: 'plantas/plantas_-_espinheira-santa.html',
  },
  {
    id: 15,
    name: 'Capim-cidreira',
    sci: 'Cymbopogon citratus',
    img: 'ING/Slides/capim-cidreira.webp',
    imgAlt: 'Touceira de folhas longas e estreitas de capim-cidreira',
    badge: 'Calmante',
    badgeType: '',
    desc: 'Chá cítrico popular para ansiedade leve, insônia e relaxamento do dia a dia.',
    tags: ['chá', 'calmante'],
    rating: 4.6,
    reviews: 0,
    emoji: '🌿',
    url: 'plantas/plantas_-_capim-cidreira.html',
  },
  {
    id: 16,
    name: 'Hortelã (Mentha spicata)',
    sci: 'Mentha spicata',
    img: 'ING/Slides/ortelã.jpg',
    imgAlt: 'Folhas verdes e serrilhadas de hortelã',
    badge: 'Digestiva',
    badgeType: '',
    // Nome distinto da "Hortelã" (id 2, Mentha piperita) já existente
    // no catálogo — são espécies diferentes, mantidas separadas
    desc: 'Chá digestivo clássico, também usado em inalação para vias respiratórias.',
    tags: ['chá', 'digestivo', 'externa'],
    rating: 4.5,
    reviews: 0,
    emoji: '🌱',
    url: 'plantas/plantas_-_hortela.html',
  },
  {
    id: 17,
    name: 'Funcho (Erva-doce)',
    sci: 'Foeniculum vulgare',
    img: 'ING/Slides/funcho.jpg',
    imgAlt: 'Sementes estriadas e folhas plumosas de funcho',
    badge: 'Carminativo',
    badgeType: 'accent',
    desc: 'Sementes tradicionais contra cólicas, gases e desconforto digestivo, inclusive em bebês.',
    tags: ['chá', 'digestivo'],
    rating: 4.6,
    reviews: 0,
    emoji: '🌼',
    url: 'plantas/plantas_-_funcho-erva-doce.html',
  },
  {
    id: 18,
    name: 'Guaco',
    sci: 'Mikania glomerata',
    img: 'ING/Slides/guaco.webp',
    imgAlt: 'Trepadeira de folhas com três nervuras características do guaco',
    badge: 'Expectorante',
    badgeType: '',
    desc: 'Xarope caseiro tradicional para tosse, bronquite e congestão das vias respiratórias.',
    tags: ['xarope', 'externa'],
    rating: 4.7,
    reviews: 0,
    emoji: '🌬️',
    url: 'plantas/plantas_-_guaco.html',
  },
  {
    id: 19,
    name: 'Tanchagem',
    sci: 'Plantago major',
    img: 'ING/Slides/tanchagem.jpg',
    imgAlt: 'Roseta de folhas largas com nervuras paralelas da tanchagem',
    badge: 'Anti-inflamatória',
    badgeType: '',
    desc: 'Chá e compressas tradicionais para garganta inflamada, feridas leves e picadas de inseto.',
    tags: ['chá', 'compressa', 'externa'],
    rating: 4.4,
    reviews: 0,
    emoji: '🍀',
    url: 'plantas/plantas_-_tanchagem.html',
  },
  {
    id: 20,
    name: 'Erva-de-santa-maria (Mastruz)',
    sci: 'Chenopodium ambrosioides',
    img: 'ING/Slides/images (3).jpg',
    imgAlt: 'Folhas lanceoladas e dentadas do mastruz',
    badge: 'Atenção',
    badgeType: 'accent',
    desc: 'Uso tradicional vermífugo, porém com alta toxicidade — requer extrema cautela na dosagem.',
    tags: ['xarope', 'compressa'],
    rating: 4.0,
    reviews: 0,
    emoji: '⚠️',
    url: 'plantas/plantas_-_erva-de-santa-maria-mastruz.html',
  },
];

/* Gradientes de fundo para cards sem foto (movido junto, mesma razão) */
const GRADIENTS = [
  'linear-gradient(135deg, #2d5a1b 0%, #5c8a3c 50%, #8fbc5a 100%)',
  'linear-gradient(135deg, #7b4f1a 0%, #b8763a 50%, #e0a060 100%)',
  'linear-gradient(135deg, #1a4a3b 0%, #3a8a6e 50%, #6abfa0 100%)',
  'linear-gradient(135deg, #4a2060 0%, #8b5ca8 50%, #c090d8 100%)',
  'linear-gradient(135deg, #5a3a1a 0%, #a06828 50%, #d4984e 100%)',
  'linear-gradient(135deg, #1a3a5a 0%, #3a6a9a 50%, #6a9aca 100%)',
];

/**
 * Busca uma planta pelo id — usado pelo perfil para montar os cards
 * de favoritos a partir da lista de ids salva no Auth.
 */
function getPlantById(id) {
  return PLANTS.find((p) => p.id === id) || null;
}