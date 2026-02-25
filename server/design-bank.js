/**
 * Banco de referências de design senior para apresentações
 * Inspirado em: Flowbite, Tailwind UI, Vercel, Linear, Stripe, Apple, Pitch, Gamma
 * Usado pelo prompt da IA para decisões de tipografia, cor, composição e distribuição de conteúdo.
 */

/**
 * Catálogo de componentes visuais pré-definidos
 * A IA usa esses IDs para selecionar componentes específicos, não criar do zero
 */
const VISUAL_COMPONENTS_CATALOG = {
  // Layouts principais
  layouts: {
    hero: {
      id: 'hero',
      name: 'Hero Slide',
      description: 'Slide de abertura impactante com gradiente de fundo',
      components: ['background-gradient', 'large-title', 'subtitle'],
      exportTemplate: 'powerpoint-hero'
    },
    timeline: {
      id: 'timeline',
      name: 'Timeline Events',
      description: 'Linha temporal vertical com eventos marcados',
      components: ['vertical-line', 'timeline-markers', 'event-cards'],
      exportTemplate: 'powerpoint-timeline'
    },
    bullet_cards: {
      id: 'bullet-cards',
      name: 'Bullet Cards',
      description: 'Lista com ícones em cards estilizados',
      components: ['icon-cards', 'icon-set', 'card-background'],
      exportTemplate: 'powerpoint-bullet-cards'
    },
    stats_grid: {
      id: 'stats-grid',
      name: 'Stats Grid',
      description: 'Grade de métricas em cards coloridos',
      components: ['metric-cards', 'number-highlight', 'small-icons'],
      exportTemplate: 'powerpoint-stats-grid'
    },
    quote_card: {
      id: 'quote-card',
      name: 'Quote Card',
      description: 'Citação com barra lateral e ícone de aspas',
      components: ['quote-bar', 'large-quotes', 'author-line'],
      exportTemplate: 'powerpoint-quote-card'
    }
  },

  // Componentes visuais individuais
  components: {
    backgrounds: {
      gradient_primary: {
        id: 'gradient-primary',
        type: 'gradient',
        colors: ['primary', 'secondary'],
        direction: '135deg'
      },
      card_bg: {
        id: 'card-bg',
        type: 'solid',
        color: 'background-muted',
        border: '1px solid border-color',
        border_radius: '12px',
        shadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }
    },
    
    icon_sets: {
      lucide_events: {
        id: 'lucide-events',
        set: 'lucide',
        icons: ['calendar-days', 'flag', 'landmark', 'book-open', 'clock', 'map-pin'],
        usage: 'dates, historical events, locations'
      },
      lucide_metrics: {
        id: 'lucide-metrics',
        set: 'lucide',
        icons: ['trending-up', 'target', 'award', 'star', 'trophy', 'gauge'],
        usage: 'performance, goals, achievements, metrics'
      },
      lucide_business: {
        id: 'lucide-business',
        set: 'lucide',
        icons: ['briefcase', 'building', 'users', 'globe', 'dollar-sign', 'chart'],
        usage: 'business, company, market, finance'
      }
    },
    
    typography: {
      title_hero: {
        id: 'title-hero',
        type: 'title',
        font_family: 'font-serif',
        size: '3rem',
        weight: '400',
        color: 'white'
      },
      title_section: {
        id: 'title-section',
        type: 'title',
        font_family: 'font-serif',
        size: '2.5rem',
        weight: '600',
        color: 'primary'
      },
      body_card: {
        id: 'body-card',
        type: 'body',
        font_family: 'font-sans',
        size: '1rem',
        weight: '400',
        color: 'text-primary',
        line_height: '1.6'
      }
    }
  },

  // Regras de seleção baseadas no conteúdo
  selectionRules: {
    // Quando usar cada layout
    content_mapping: {
      events_historical: 'timeline',
      dates_chronology: 'timeline',
      achievements_list: 'bullet_cards',
      metrics_kpi: 'stats_grid',
      testimonials: 'quote_card',
      opening_intro: 'hero'
    },
    
    // Quando usar cada conjunto de ícones
    icon_mapping: {
      history_events: 'lucide-events',
      performance_data: 'lucide-metrics',
      corporate_info: 'lucide-business'
    },
    
    // Paleta de cores por tema
    color_schemes: {
      corporate: { primary: '#001489', secondary: '#4A90E2', neutral: '#6B7280' },
      startup: { primary: '#6366f1', secondary: '#ec4899', neutral: '#6B7280' },
      educational: { primary: '#065f46', secondary: '#10B981', neutral: '#6B7280' }
    }
  }
};

const ADVANCED_DESIGN_UX = `
---- NOÇÃO AVANÇADA DE DESIGN E UX MODERNO (OBRIGATÓRIO) ----
A ferramenta DEVE demonstrar conhecimento avançado de design e produzir apresentações com UX moderno e sofisticado. Não é aceitável output genérico ou "template básico".

DESIGN AVANÇADO:
- Grid e ritmo visual: usa alinhamento consistente, grelha implícita (colunas, margens simétricas). Elementos alinhados criam ordem e credibilidade.
- Hierarquia visual clara: o olho deve saber onde começar (título) e seguir um fluxo lógico (subtítulo → corpo → detalhe). Tamanho, peso e cor definem prioridade.
- Consistência: mesma linguagem visual em todos os slides (estilo de cards, ícones, espaçamentos). Variação só onde há mudança de secção ou ênfase.
- Respiração e densidade: espaços em branco são parte do design. Slides sobrecarregados parecem amadores. Menos texto, mais impacto.

UX MODERNO E SOFISTICADO:
- Clareza imediata: cada slide comunica uma ideia em segundos. Títulos que funcionam sozinhos; bullets que complementam, não repetem.
- Escaneabilidade: padrões de leitura (F ou Z). Título no topo, conteúdo organizado em blocos visuais (cards, colunas), CTA ou conclusão onde o olho termina.
- Progressão narrativa: abertura forte (hero), secções que separam capítulos, transição lógica entre slides. O deck conta uma história.
- Acessibilidade visual: contraste suficiente, hierarquia óbvia, ícones que reforçam o texto (nunca decorativos sem sentido).

ESTÉTICA MODERNA:
- Minimalismo intencional: cada elemento tem razão de existir. Sem bordas ou sombras desnecessárias; quando usadas, são consistentes.
- Tipografia como interface: pares de fontes que contrastam (ex.: título bold/display + corpo limpo). Tamanhos que criam ritmo (não tudo 18px).
- Paleta restrita e deliberada: 1 cor de destaque + neutros (ou 2 cores de marca). Gradientes subtis em hero/section, não em todo o slide.
- Referências de excelência: nível visual de Apple Keynotes, Pitch, Gamma, Stripe, Linear, Vercel — apresentações que parecem produtos de design, não documentos.
`;

const DESIGN_BANK = `
=== BANCO DE REFERÊNCIAS DE DESIGN (OBRIGATÓRIO) ===

REFERÊNCIAS DE UX DE PONTA: Flowbite, Tailwind UI, Vercel, Linear, Stripe, Apple Keynotes, Pitch, Gamma, Beautiful.ai.
${ADVANCED_DESIGN_UX}

---- REGRA CRÍTICA: NUNCA SLIDES PLANOS ----
PROIBIDO: slides com fundo cinza liso, apenas texto branco e bullet points simples. INACEITÁVEL.
OBRIGATÓRIO em TODOS os slides:
- Ícones: usa o campo "icon" em cada item de bullet/timeline. Ícones Lucide: calendar, flag, award, book-open, landmark, trending-up, users, star, zap, target, heart, briefcase, globe, building, graduation-cap, etc.
- Elementos visuais: cards com bordas, barras de destaque, gradientes subtis, ícones junto a cada ponto.
- Layout timeline: para eventos, datas históricas, cronologias — usa layout "timeline" com events: [{ year, text, icon }].
- Variedade: alterna layouts (hero, section, timeline, bullet com ícones, stats-row, big-number, quote). NUNCA mais do que 2 slides seguidos do mesmo tipo.

---- TIPOGRAFIA ----
- Hierarquia clara: título principal (1 ideia, 4-8 palavras) > subtítulo/corpo (frases curtas) > detalhe (legendas, rodapé).
- Par de fontes: uma para títulos (impacto, serif ou sans bold), outra para corpo (legibilidade, sans). Ex.: Inter/Playfair, DM Sans/Instrument Serif, SF Pro.
- Tamanhos relativos: título ~2-3x o corpo; subtítulo ~1.2-1.5x o corpo. Nunca encher o slide de texto do mesmo tamanho.
- Máximo 1-2 frases por bloco; listas com 3-6 itens por slide; se há mais itens, divide em vários slides com títulos de secção.

---- CORES ----
- Prioridade 1: Se o utilizador ou manual de identidade indicar cores (hex, RGB ou nomes), usa APENAS essas cores. Extrai códigos hex do texto anexado e inclui no JSON em "brandColors".
- Paleta por slide: no máximo 2-3 cores (ex.: primária + neutro escuro/claro, ou primária + secundária + branco). Evitar misturar muitas cores.
- Uso: cor primária para títulos fortes, CTAs, números de destaque, ícones e barras de secção; secundária para subtítulos e ênfase leve; neutros para corpo e fundos.
- Contraste: texto legível sobre fundo (claro sobre escuro ou escuro sobre claro). Não usar cores vibrantes em grandes áreas de texto.
- Se o anexo for manual de identidade: "cor primária", "cor secundária", "hex #..." são OBRIGATÓRIOS em todos os slides. Inclui no JSON: "brandColors": { "primary": "#hex", "secondary": "#hex" }.

---- COMPOSIÇÃO E LAYOUT (UX DE PONTA) ----
- Uma ideia principal por slide. Respiração: margens generosas; não encher toda a área.
- Componentes visuais: cards com sombra/ borda, ícones em círculos coloridos, linhas de timeline, badges, gradientes.
- Quando usar cada layout:
  - hero: apenas abertura. Fundo com gradiente ou cor de marca.
  - section: separador. Barra lateral em cor de marca, fundo com gradiente subtil.
  - timeline: EVENTOS, DATAS, CRONOLOGIA. events: [{ year, text, icon }]. Ícone obrigatório por evento. Ex.: história do Brasil, roadmap, marcos.
  - bullet: listas com ícones. items: [{ text, icon }]. Ícone obrigatório por item. NUNCA apenas texto.
  - two-column: comparar blocos. Cards ou painéis por coluna.
  - big-number: métrica em destaque. Ícone opcional no topo.
  - stats-row: três métricas em cards com ícones.
  - quote: citação com ícone de aspas, barra lateral.
  - image-text: foto + texto. imageSuggestion obrigatório.

---- ÍCONES (Lucide - usa nomes exatos) ----
Para bullet: items: [{ "text": "1822: Independência do Brasil", "icon": "flag" }, { "text": "1824: Primeira Constituição", "icon": "book-open" }]
Para timeline: events: [{ "year": "1822", "text": "Independência do Brasil", "icon": "flag" }, ...]
Ícones por tema: eventos/datas→calendar,flag,landmark; conquistas→award,trophy,star; negócios→briefcase,trending-up,target; pessoas→users,heart; educação→graduation-cap,book-open; tecnologia→zap,globe; lugares→building,map-pin.

---- DISTRIBUIÇÃO DE CONTEÚDO ----
- COMPLETUDE: Todo o conteúdo que o utilizador pediu deve aparecer na apresentação. Nada pode ser omitido, resumido ou "sintetizado" à custa de pontos listados.
- Se o utilizador listou 10 tópicos: cria 2-3 slides com listas (ex.: slide "Serviços 1" com 4 itens, slide "Serviços 2" com 3, slide "Diferenciais" com 3) ou usa sections e bullets. Nunca colocar só 3 de 10.
- Textos longos: dividir em bullets por frase-chave ou em two-column. Manter a ordem lógica do que foi pedido.
- Se o anexo for manual de identidade ou documento com regras: essas regras têm prioridade sobre preferências genéricas. Cores, fontes e tom do manual aplicam-se a todos os slides.
`;

const REFERENCIAS_EXPLICITAS = `
---- REFERÊNCIAS EXPLÍCITAS (estilo a emular) ----
Estas são as referências de excelência. Usa-as como alvo de nível visual e UX. Quando não houver manual de identidade, inspira-te nestes estilos.

APPLE KEYNOTES:
- Minimalismo extremo: muito espaço em branco, um conceito por slide. Tipografia grande e bold para títulos; corpo legível e espaçado.
- Paleta: fundos escuros ou brancos puros; uma cor de destaque (ex.: azul Apple); texto branco ou preto com contraste alto.
- Sem bordas decorativas; formas geométricas simples; fotos em full-bleed quando há imagem. Narrativa clara: abertura → capítulos → conclusão.

STRIPE:
- Documentação e marketing: hierarquia tipográfica muito clara. Títulos curtos e directos; corpo com linha de altura generosa.
- Cores: primária forte (ex.: violeta Stripe), neutros (cinzas) para texto e bordas. Cards com sombra subtil, bordas arredondadas.
- Ícones e números em destaque; listas com ícones alinhados; secções bem separadas.

VERCEL:
- Estética dev/moderna: fundos escuros, acentos em cores vibrantes (preto + branco + uma cor). Tipografia monospace ou sans moderna.
- Layout limpo: grid implícito, alinhamento rigoroso. Blocos de conteúdo com padding generoso. Gradientes subtis em CTAs ou hero.

LINEAR:
- Interface de produto: densidade controlada, sem ruído. Uma ação ou ideia por bloco. Cores de estado (sucesso, destaque) usadas com parcimónia.
- Tipografia: sans moderna, pesos contrastados (bold para título, regular para corpo). Listas com ícones pequenos e alinhados.

PITCH / GAMMA:
- Decks gerados por IA de alto nível: hero impactante, sections que separam capítulos, bullets com ícones, stats em cards.
- Variedade de layouts no mesmo deck; transição lógica entre slides; nunca dois slides iguais seguidos. Paleta consistente em todo o deck.

BEAUTIFUL.AI / FLOWBITE / TAILWIND UI:
- Componentes de UI de nível produto: cards, badges, barras de progresso, ícones em círculos. Consistência visual em todos os elementos.
- Cores: sistema de design (primária, secundária, neutros). Tipografia: escala clara (text-sm, text-lg, etc.). Espaçamento sistemático.
`;

/**
 * Converte o catálogo de componentes em texto para a IA "consultar" no prompt.
 */
function getCatalogAsText() {
  const c = VISUAL_COMPONENTS_CATALOG;
  const schemes = c.selectionRules.color_schemes;
  const palettes = Object.entries(schemes).map(([name, s]) => `${name}: primary ${s.primary}, secondary ${s.secondary}, neutral ${s.neutral}`).join('; ');
  const iconSets = Object.entries(c.components.icon_sets).map(([k, v]) => `${v.id}: [${v.icons.join(', ')}] para ${v.usage}`).join('; ');
  const layouts = Object.entries(c.layouts).map(([k, v]) => `${v.id}: ${v.description}, componentes [${v.components.join(', ')}]`).join('; ');
  const contentMapping = Object.entries(c.selectionRules.content_mapping).map(([content, layout]) => `${content} → ${layout}`).join('; ');
  return `
---- CATÁLOGO CONSULTÁVEL (usa estes valores) ----
PALETAS POR TEMA (hex): ${palettes}. Quando o utilizador não especificar cores, escolhe uma paleta conforme o tema (corporate, startup, educational).

CONJUNTOS DE ÍCONES LUCIDE POR TEMA: ${iconSets}. Usa os ícones listados nos items/events conforme o tipo de conteúdo.

LAYOUTS E COMPONENTES: ${layouts}. Escolhe o layout adequado ao conteúdo.

MAPEAMENTO CONTEÚDO → LAYOUT: ${contentMapping}. Aplica estes mapeamentos para decidir layout (ex.: eventos/datas → timeline, métricas → stats-row).
`;
}

function getReferenceCatalog() {
  return REFERENCIAS_EXPLICITAS + getCatalogAsText();
}

const IDENTITY_MANUAL_INSTRUCTIONS = `
---- MANUAL DE IDENTIDADE (quando o utilizador anexa PDF/PPTX/documento) ----
- O conteúdo do ficheiro anexado pode ser um MANUAL DE IDENTIDADE VISUAL. Se contiver regras de cores, fontes, logótipo ou estilo de comunicação:
  1. Extrai e aplica as cores indicadas (procura "hex", "#", "RGB", "primária", "secundária"). Inclui no JSON: "brandColors": { "primary": "#hex", "secondary": "#hex" }.
  2. Segue as fontes indicadas (nomes de tipo de letra). Se não puderes aplicar no JSON, descreve no conteúdo dos slides o estilo pedido.
  3. Respeita cabeçalhos, rodapés e composição descritos no manual.
  4. NÃO inventes cores nem estilos que contrariem o manual. Se o manual diz "azul #001489", usa apenas esse azul para elementos de destaque.
`;

const CONTENT_COMPLETENESS = `
---- COMPLETUDE DO CONTEÚDO (OBRIGATÓRIO) ----
- O utilizador forneceu o conteúdo completo que quer na apresentação. A tua tarefa é DISTRIBUIR esse conteúdo pelos slides, não selecionar ou resumir.
- Inclui 100% dos tópicos, números, frases e blocos que o utilizador listou ou colou. Se há muitos itens, cria mais slides (section + bullet ou vários bullets).
- Mantém a ordem e a hierarquia que o utilizador sugeriu. Não juntes pontos não relacionados no mesmo slide só para "reduzir" slides.
- Cada slide deve ter conteúdo concreto (títulos e textos preenchidos com o que foi pedido). Evita placeholders genéricos quando o utilizador já deu o texto.

---- NUNCA SLIDES VAZIOS OU COM UMA FRASE SÓ ----
- PROIBIDO: slides com apenas um título ou uma única frase. Cada slide deve ter conteúdo RICO e completo.
- Hero: título + subtítulo preenchidos (2+ linhas). Bullet: título + 3 a 6 itens com texto e ícone cada. Timeline: título + 3+ eventos com year e text. Section: título impactante. Two-column: ambas as colunas com texto. Quote: citação + autor. Stats/big-number: valores e etiquetas preenchidos.
- Para temas como "primavera", "empresa X", "produto Y": desenvolve o tema em vários slides com conteúdo variado (características, benefícios, dados, citações), não apenas títulos soltos. Apresentações devem parecer profissionais e prontas para apresentar.
`;

function getDesignBank() {
  return DESIGN_BANK;
}

function getIdentityManualInstructions() {
  return IDENTITY_MANUAL_INSTRUCTIONS;
}

function getContentCompleteness() {
  return CONTENT_COMPLETENESS;
}

/**
 * Função principal que a IA usa para escolher componentes
 * @param {string} contentType - tipo de conteúdo (ex: 'historical_events', 'kpi_metrics')
 * @param {string} theme - tema desejado (ex: 'corporate', 'startup')
 * @returns {object} conjunto de componentes recomendados
 */
function selectComponentsForContent(contentType, theme = 'corporate') {
  const catalog = VISUAL_COMPONENTS_CATALOG;
  const rules = catalog.selectionRules;
  const scheme = rules.color_schemes[theme] || rules.color_schemes.corporate;
  
  // Mapa de conteúdo → layout
  const layoutKey = rules.content_mapping[contentType] || 'hero';
  const layout = catalog.layouts[layoutKey];
  
  // Mapa de conteúdo → ícones
  const iconSetKey = rules.icon_mapping[contentType] || 'lucide-business';
  const iconSet = catalog.components.icon_sets[iconSetKey];
  
  return {
    layout_id: layout.id,
    layout_name: layout.name,
    layout_components: layout.components,
    export_template: layout.exportTemplate,
    icon_set_id: iconSet.id,
    icon_set_name: iconSet.name,
    available_icons: iconSet.icons,
    color_scheme: scheme,
    typography: {
      title_level: 'title_section',
      body_level: 'body_card'
    }
  };
}

module.exports = {
  getDesignBank,
  getIdentityManualInstructions,
  getContentCompleteness,
  getReferenceCatalog,
  DESIGN_BANK,
  IDENTITY_MANUAL_INSTRUCTIONS,
  CONTENT_COMPLETENESS
};
