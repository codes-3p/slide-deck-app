export const LAYOUTS = {
  hero: { name: 'Hero', defaultContent: { title: 'Título impactante', subtitle: 'Subtítulo ou tagline' } },
  title: { name: 'Título', defaultContent: { title: 'Título do slide' } },
  'title-subtitle': { name: 'Título + Subtítulo', defaultContent: { title: 'Título', subtitle: 'Subtítulo ou descrição breve' } },
  bullet: {
    name: 'Lista',
    defaultContent: {
      title: 'Título da lista',
      items: [
        { text: 'Primeiro ponto', icon: 'circle' },
        { text: 'Segundo ponto', icon: 'circle' },
        { text: 'Terceiro ponto', icon: 'circle' }
      ]
    }
  },
  timeline: {
    name: 'Timeline',
    defaultContent: {
      title: 'Principais Eventos',
      events: [
        { year: '1822', text: 'Independência do Brasil', icon: 'flag' },
        { year: '1824', text: 'Primeira Constituição', icon: 'book-open' }
      ]
    }
  },
  'two-column': { name: 'Duas colunas', defaultContent: { left: 'Coluna esquerda.', right: 'Coluna direita.' } },
  'big-number': { name: 'Número grande', defaultContent: { number: '42', label: 'Métrica ou descrição' } },
  'stats-row': { name: '3 estatísticas', defaultContent: { stat1: '99%', label1: 'Satisfação', stat2: '10x', label2: 'Crescimento', stat3: '24h', label3: 'Suporte' } },
  quote: { name: 'Citação', defaultContent: { text: 'Uma citação inspiradora.', author: '— Nome do autor' } },
  section: { name: 'Seção', defaultContent: { title: 'Nome da seção' } },
  'image-text': { name: 'Imagem + texto', defaultContent: { title: 'Título', body: 'Texto.', imageUrl: '', imageSuggestion: 'Sugestão de imagem' } }
};

export const LAYOUT_KEYS = Object.keys(LAYOUTS);

export const DEFAULT_SLIDE = {
  layout: 'title',
  content: { ...LAYOUTS.title.defaultContent },
  transition: 'fade',
  elementAnimation: 'fade'
};

export const TRANSITIONS = [
  { id: 'none', name: 'Nenhuma' },
  { id: 'fade', name: 'Dissolver' },
  { id: 'slide', name: 'Deslizar' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'convex', name: 'Convexo' },
  { id: 'concave', name: 'Côncavo' }
];

export const ELEMENT_ANIMATIONS = [
  { id: 'none', name: 'Nenhuma' },
  { id: 'fade', name: 'Aparecer' },
  { id: 'slideUp', name: 'Entrar de baixo' },
  { id: 'slideLeft', name: 'Entrar da esquerda' },
  { id: 'zoom', name: 'Zoom' }
];
