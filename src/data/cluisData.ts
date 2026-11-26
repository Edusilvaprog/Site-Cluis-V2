export type BrandId = 'roma' | 'soprano' | 'carbografite';
export type RegionId = 'baixada' | 'vale';

export interface BrandCatalogLink {
  id: string;
  label: string;
  shortLabel: string;
  brandId: BrandId;
  url: string;
}

export interface BrandInfo {
  id: BrandId;
  name: string;
  shortName: string;
  origin: string;
  since: string;
  specialty: string;
  description: string;
  highlight: string;
  officialSite: string;
  logo: string;
  factoryImage: string;
  factoryImageAlt: string;
}

export interface ProductLine {
  id: string;
  brandId: BrandId;
  name: string;
  exampleLabel: string;
  description: string;
  highlights: string[];
  thumbnail: string;
  image: string;
  catalogUrl: string;
  catalogLabel: string;
}

export interface Attendant {
  id: 'carlos' | 'eduardo';
  name: string;
  role: string;
  description: string;
  phoneDisplay: string;
  phoneRaw: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const MEDIA_ASSETS = {
  logoCluis: '/assets/cluis/logo-cluis-20261101.webp',
  heroDesktop: '/assets/cluis/hero-cluis-composicao.webp',
  heroMobile: '/assets/cluis/hero-cluis-composicao-mobile.webp',
  logoRoma: '/assets/cluis/roma-pinceis-clean.webp',
  logoSoprano: '/assets/cluis/soprano.webp',
  logoCarbografite: '/assets/cluis/carbografite.webp',
  factoryRoma: '/assets/cluis/fabrica-roma.webp',
  factorySoprano: '/assets/cluis/fabrica-soprano.webp',
  factoryCarbografite: '/assets/cluis/fabrica-carbografite.webp',
} as const;

export const COMPANY_CONTACT = {
  email: 'contato@cluisrepresentacoes.com.br',
  instagramHandle: '@cluisrep',
  instagramUrl: 'https://www.instagram.com/cluisrep/',
  baseCity: 'Praia Grande, SP',
  googleMapsBase: 'https://maps.google.com/?q=Praia+Grande,+SP',
} as const;

export const ATTENDANTS: Attendant[] = [
  {
    id: 'carlos',
    name: 'Carlos',
    role: 'Representante Comercial · Visitas e negociação',
    description:
      'Visitas presenciais nas lojas, apresentação de linhas e condições comerciais direto da fábrica.',
    phoneDisplay: '(13) 99804-5406',
    phoneRaw: '5513998045406',
  },
  {
    id: 'eduardo',
    name: 'Eduardo',
    role: 'Atendimento Comercial · Orçamentos e pedidos',
    description:
      'Orçamentos pelo WhatsApp, conferência de códigos e acompanhamento de pedidos.',
    phoneDisplay: '(13) 99634-2118',
    phoneRaw: '5513996342118',
  },
];

export const PDF_CATALOGS: BrandCatalogLink[] = [
  {
    id: 'pdf-roma-geral',
    brandId: 'roma',
    label: 'Catálogo Geral Roma Pincéis',
    shortLabel: 'Catálogo Geral (PDF)',
    url: 'https://drive.google.com/file/d/1ugAOS0o8eU4HlL6HaUL3magSzJjKGSmY/view?usp=sharing',
  },
  {
    id: 'pdf-soprano-eletrica',
    brandId: 'soprano',
    label: 'Materiais Elétricos',
    shortLabel: 'Materiais Elétricos',
    url: 'https://drive.google.com/file/d/1DjxDrGBdIIdAwnzKnqjI4r0fOF6gHKNX/view?usp=sharing',
  },
  {
    id: 'pdf-soprano-tomadas',
    brandId: 'soprano',
    label: 'Interruptores e Tomadas',
    shortLabel: 'Interruptores e Tomadas',
    url: 'https://drive.google.com/file/d/1nzu9NhKA_9QL4xEhZ4RmjGx6eJlymWS5/view?usp=sharing',
  },
  {
    id: 'pdf-soprano-fechaduras',
    brandId: 'soprano',
    label: 'Fechaduras e Ferragens',
    shortLabel: 'Fechaduras e Ferragens',
    url: 'https://drive.google.com/file/d/1pV78SaoTv76Vdd4njCh4zIsDiZI1YKQV/view?usp=sharing',
  },
  {
    id: 'pdf-soprano-moveis',
    brandId: 'soprano',
    label: 'Componentes para Móveis',
    shortLabel: 'Componentes para Móveis',
    url: 'https://drive.google.com/file/d/1QGSQKvKme5hm9Vgq5PkQdxv6-VdjNaU6/view?usp=sharing',
  },
  {
    id: 'pdf-carbografite-epis',
    brandId: 'carbografite',
    label: 'EPIs e Segurança',
    shortLabel: 'EPIs e Segurança',
    url: 'https://drive.google.com/file/d/1OoVUZnD--pa0DEb-wCOPx4dMddPzYP0J/view?usp=sharing',
  },
  {
    id: 'pdf-carbografite-ferramentas',
    brandId: 'carbografite',
    label: 'Ferramentas',
    shortLabel: 'Ferramentas',
    url: 'https://drive.google.com/file/d/1V67C6mTLzX6a3f7wD5pqeMWJm_3ys5ji/view?usp=sharing',
  },
  {
    id: 'pdf-carbografite-solda',
    brandId: 'carbografite',
    label: 'Solda e Acessórios',
    shortLabel: 'Solda e Acessórios',
    url: 'https://drive.google.com/file/d/1-ZaC3yfukK0HozBC-4JgTymIAWlZpmfQ/view?usp=sharing',
  },
];

export const BRANDS: BrandInfo[] = [
  {
    id: 'roma',
    name: 'Roma Pincéis',
    shortName: 'Roma',
    origin: 'Nova Roma do Sul, RS',
    since: '1989',
    specialty: 'Pintura e acabamento',
    description:
      'Referência nacional em acessórios para pintura desde 1989, com unidades fabris em Nova Roma do Sul (RS) e Paulista (PE). Trinchas, pincéis, rolos de lã e microfibra, desempenadeiras e bandejas de alto giro no balcão.',
    highlight: 'Unidades fabris no RS e em PE',
    officialSite: 'https://www.pinceisroma.com.br',
    logo: MEDIA_ASSETS.logoRoma,
    factoryImage: MEDIA_ASSETS.factoryRoma,
    factoryImageAlt: 'Parque fabril da Roma Pincéis em Nova Roma do Sul, RS.',
  },
  {
    id: 'soprano',
    name: 'Soprano',
    shortName: 'Soprano',
    origin: 'Farroupilha, RS',
    since: '1954',
    specialty: 'Fechaduras, elétrica e ferragens',
    description:
      'Indústria brasileira fundada em 1954 em Farroupilha (RS), referência em fechaduras mecânicas e digitais — com opções em aço inox para o litoral —, materiais elétricos certificados pelo INMETRO, tomadas e ferragens para móveis.',
    highlight: 'Certificação INMETRO · Opções em inox para o litoral',
    officialSite: 'https://www.soprano.com.br',
    logo: MEDIA_ASSETS.logoSoprano,
    factoryImage: MEDIA_ASSETS.factorySoprano,
    factoryImageAlt: 'Unidade industrial da Soprano em Farroupilha, RS.',
  },
  {
    id: 'carbografite',
    name: 'Carbografite',
    shortName: 'Carbografite',
    origin: 'Petrópolis, RJ',
    since: '1967',
    specialty: 'EPIs, solda e ferramentas',
    description:
      'Tradição industrial desde 1967 em Petrópolis (RJ) com gestão certificada ISO 9001. Linha completa de EPIs com Certificado de Aprovação (CA) vigente, equipamentos para solda e corte e ferramentas manuais profissionais.',
    highlight: 'Gestão ISO 9001 · EPIs com CA vigente',
    officialSite: 'https://www.carbografite.com.br',
    logo: MEDIA_ASSETS.logoCarbografite,
    factoryImage: MEDIA_ASSETS.factoryCarbografite,
    factoryImageAlt: 'Complexo fabril da Carbografite em Petrópolis, RJ.',
  },
];

export const PRODUCT_LINES: ProductLine[] = [
  {
    id: 'roma-trinchas',
    brandId: 'roma',
    name: 'Trinchas e Pincéis',
    exampleLabel: 'Trincha Gold',
    description:
      'Trinchas médias, duplas e pincéis em bitolas de 1/2" a 4" para acrílica, látex, esmalte e verniz.',
    highlights: ['Bitolas de 1/2" a 4"', 'Linhas econômicas e profissionais', 'Cerdas grisalhas, pretas e sintéticas'],
    thumbnail: '/assets/cluis/linhas/roma-trinchas-20261016-mini.webp',
    image: '/assets/cluis/linhas/roma-trinchas-20261016.webp',
    catalogUrl: 'https://drive.google.com/file/d/1ugAOS0o8eU4HlL6HaUL3magSzJjKGSmY/view?usp=sharing',
    catalogLabel: 'Catálogo Roma (PDF)',
  },
  {
    id: 'roma-rolos',
    brandId: 'roma',
    name: 'Rolos de Pintura',
    exampleLabel: 'Rolo de lã com poliéster',
    description:
      'Rolos de lã sintética, mista, microfibra, espuma e textura em 23cm, 15cm e 9cm com opções antigota.',
    highlights: ['Lã natural, mista e microfibra', 'Opções antigota para acabamento fino', 'Rolos de textura, espuma e refis'],
    thumbnail: '/assets/cluis/linhas/roma-rolos-20261016-mini.webp',
    image: '/assets/cluis/linhas/roma-rolos-20261016.webp',
    catalogUrl: 'https://drive.google.com/file/d/1ugAOS0o8eU4HlL6HaUL3magSzJjKGSmY/view?usp=sharing',
    catalogLabel: 'Catálogo Roma (PDF)',
  },
  {
    id: 'roma-desempenadeiras',
    brandId: 'roma',
    name: 'Desempenadeiras e Espátulas',
    exampleLabel: 'Desempenadeira dentada',
    description:
      'Desempenadeiras de aço dentadas, lisas em inox ou PVC e espátulas para argamassa e massa corrida.',
    highlights: ['Aço carbono, inox e PVC', 'Modelos dentados e lisos', 'Espátulas rígidas e flexíveis'],
    thumbnail: '/assets/cluis/linhas/roma-desempenadeiras-20261016-mini.webp',
    image: '/assets/cluis/linhas/roma-desempenadeiras-20261016.webp',
    catalogUrl: 'https://drive.google.com/file/d/1ugAOS0o8eU4HlL6HaUL3magSzJjKGSmY/view?usp=sharing',
    catalogLabel: 'Catálogo Roma (PDF)',
  },
  {
    id: 'roma-acessorios',
    brandId: 'roma',
    name: 'Acessórios de Pintura',
    exampleLabel: 'Bandeja para tinta',
    description:
      'Bandejas, caçambas, garfos gaiola, cabos extensores telescópicos e misturadores de tinta.',
    highlights: ['Bandejas e caçambas reforçadas', 'Cabos extensores telescópicos', 'Garfos, suportes e misturadores'],
    thumbnail: '/assets/cluis/linhas/roma-acessorios-20261016-mini.webp',
    image: '/assets/cluis/linhas/roma-acessorios-20261016.webp',
    catalogUrl: 'https://drive.google.com/file/d/1ugAOS0o8eU4HlL6HaUL3magSzJjKGSmY/view?usp=sharing',
    catalogLabel: 'Catálogo Roma (PDF)',
  },
  {
    id: 'soprano-fechaduras',
    brandId: 'soprano',
    name: 'Fechaduras e Ferragens',
    exampleLabel: 'Fechadura digital Soprano com maçaneta',
    description:
      'Fechaduras residenciais internas, externas, banheiro, modelos digitais, molas aéreas, dobradiças e cadeados.',
    highlights: ['Acabamentos em inox para áreas litorâneas', 'Fechaduras digitais e mecânicas', 'Cadeados, molas aéreas e dobradiças'],
    thumbnail: '/assets/cluis/linhas/soprano-fechaduras-20261030-mini.webp',
    image: '/assets/cluis/linhas/soprano-fechaduras-20261030.webp',
    catalogUrl: 'https://drive.google.com/file/d/1pV78SaoTv76Vdd4njCh4zIsDiZI1YKQV/view?usp=sharing',
    catalogLabel: 'Catálogo Fechaduras (PDF)',
  },
  {
    id: 'soprano-eletricos',
    brandId: 'soprano',
    name: 'Materiais Elétricos',
    exampleLabel: 'Minidisjuntor SHB LII C40 bipolar',
    description:
      'Disjuntores DIN e caixa moldada, DPS, DR, quadros de distribuição e contatores para painéis.',
    highlights: ['Minidisjuntores certificados INMETRO', 'Proteção contra surto (DPS) e fuga (DR)', 'Quadros de embutir e sobrepor'],
    thumbnail: '/assets/cluis/linhas/soprano-eletrica-20261016-mini.webp',
    image: '/assets/cluis/linhas/soprano-eletrica-20261016.webp',
    catalogUrl: 'https://drive.google.com/file/d/1DjxDrGBdIIdAwnzKnqjI4r0fOF6gHKNX/view?usp=sharing',
    catalogLabel: 'Catálogo Elétrica (PDF)',
  },
  {
    id: 'soprano-interruptores',
    brandId: 'soprano',
    name: 'Interruptores e Tomadas',
    exampleLabel: 'Conjunto Brava! Up',
    description:
      'Linhas modulares, placas 4x2 e 4x4, tomadas 10A/20A, módulos USB e conjuntos prontos para balcão.',
    highlights: ['Linha Brava! Up e linhas modulares', 'Tomadas 10A, 20A e módulos USB', 'Encaixe rápido e acabamento limpo'],
    thumbnail: '/assets/cluis/linhas/soprano-tomadas-20261016-mini.webp',
    image: '/assets/cluis/linhas/soprano-tomadas-20261016.webp',
    catalogUrl: 'https://drive.google.com/file/d/1nzu9NhKA_9QL4xEhZ4RmjGx6eJlymWS5/view?usp=sharing',
    catalogLabel: 'Catálogo Tomadas (PDF)',
  },
  {
    id: 'soprano-moveis',
    brandId: 'soprano',
    name: 'Componentes para Móveis',
    exampleLabel: 'Dobradiça com pistão e click',
    description:
      'Dobradiças com amortecimento e click, corrediças telescópicas, pistões a gás e fechaduras para móveis.',
    highlights: ['Dobradiças com pistão e sistema click', 'Corrediças telescópicas reforçadas', 'Pistões a gás e fechaduras de armário'],
    thumbnail: '/assets/cluis/linhas/soprano-moveis-20261016-v2-mini.webp',
    image: '/assets/cluis/linhas/soprano-moveis-20261016-v2.webp',
    catalogUrl: 'https://drive.google.com/file/d/1QGSQKvKme5hm9Vgq5PkQdxv6-VdjNaU6/view?usp=sharing',
    catalogLabel: 'Catálogo Móveis (PDF)',
  },
  {
    id: 'carbografite-epis',
    brandId: 'carbografite',
    name: 'EPIs e Segurança',
    exampleLabel: 'Óculos de segurança Spectra 2100',
    description:
      'Óculos de proteção, capacetes, respiradores, protetores auditivos, luvas e trabalho em altura.',
    highlights: ['Certificado de Aprovação (CA) vigente', 'Óculos, capacetes, luvas e respiradores', 'Cinturões e talabartes para altura'],
    thumbnail: '/assets/cluis/linhas/carbografite-epis-20261016-v2-mini.webp',
    image: '/assets/cluis/linhas/carbografite-epis-20261016-v2.webp',
    catalogUrl: 'https://drive.google.com/file/d/1OoVUZnD--pa0DEb-wCOPx4dMddPzYP0J/view?usp=sharing',
    catalogLabel: 'Catálogo EPIs (PDF)',
  },
  {
    id: 'carbografite-solda',
    brandId: 'carbografite',
    name: 'Solda e Acessórios',
    exampleLabel: 'Kit para corte portátil Carbografite',
    description:
      'Máscaras de escurecimento automático, kits de corte portátil, maçaricos, reguladores e porta-eletrodos.',
    highlights: ['Kits de corte e maçaricos profissionais', 'Máscaras de solda automáticas', 'Reguladores de pressão, garras e lentes'],
    thumbnail: '/assets/cluis/linhas/carbografite-solda-20261016-v2-mini.webp',
    image: '/assets/cluis/linhas/carbografite-solda-20261016-v2.webp',
    catalogUrl: 'https://drive.google.com/file/d/1-ZaC3yfukK0HozBC-4JgTymIAWlZpmfQ/view?usp=sharing',
    catalogLabel: 'Catálogo Solda (PDF)',
  },
  {
    id: 'carbografite-ferramentas',
    brandId: 'carbografite',
    name: 'Ferramentas Manuais',
    exampleLabel: 'Alicate universal 8" Carbografite',
    description:
      'Alicates profissionais, trenas emborrachadas, níveis, chaves, estiletes industriais e itens de oficina.',
    highlights: ['Alicates isolados e universais', 'Trenas, níveis e estiletes reforçados', 'Alta durabilidade para uso contínuo'],
    thumbnail: '/assets/cluis/linhas/carbografite-ferramentas-originais-v3-mini.webp',
    image: '/assets/cluis/linhas/carbografite-ferramentas-originais-v3.webp',
    catalogUrl: 'https://drive.google.com/file/d/1V67C6mTLzX6a3f7wD5pqeMWJm_3ys5ji/view?usp=sharing',
    catalogLabel: 'Catálogo Ferramentas (PDF)',
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'quem-pode-comprar',
    question: 'Quem pode abrir cadastro e comprar com a Cluis?',
    answer:
      'Atendemos exclusivamente empresas com CNPJ e Inscrição Estadual ativa — depósitos, casas de tintas, ferragens, elétricas, marcenarias e serralherias da Baixada Santista e do Vale do Ribeira.',
  },
  {
    id: 'faturamento',
    question: 'Quem emite a nota fiscal e o boleto do pedido?',
    answer:
      'A nota fiscal e os boletos saem direto da fábrica escolhida (Roma Pincéis, Soprano ou Carbografite), sem intermediário. A Cluis acompanha o pedido do orçamento até a entrega.',
  },
  {
    id: 'pedido-minimo',
    question: 'Cada fábrica tem pedido mínimo diferente?',
    answer:
      'Sim. Roma Pincéis, Soprano e Carbografite têm regras próprias de pedido mínimo e prazo. Ao enviar sua lista, montamos a cotação já ajustada para cada fábrica.',
  },
  {
    id: 'visita-presencial',
    question: 'Vocês fazem visita presencial na loja?',
    answer:
      'Sim. Percorremos a Baixada Santista e o Vale do Ribeira para apresentar as linhas, tirar dúvidas sobre códigos e ajudar na reposição do seu balcão.',
  },
];
