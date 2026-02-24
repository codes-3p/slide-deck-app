/* Copy partilhado — single source of truth para microcopy e i18n futura */

export const SUGGESTIONS = [
  'Pitch de startup: problema, solução, métricas e call to action',
  'Relatório trimestral com dados e conclusões',
  'Onboarding: missão, valores e primeiros passos',
  'Apresentação de produto com benefícios e casos de uso'
];

export const EMPTY_STATE = {
  title: 'Descreva sua apresentação. A IA monta os slides.',
  subtitle: 'Você descreve; a IA estrutura os slides. Depois é só editar e exportar.',
  inputPlaceholder: 'Ex.: Apresentação para investidores sobre nossa startup de saúde digital, 10 slides, foco em problema e solução...',
  titleLabel: 'Nome da apresentação',
  titlePlaceholder: 'Minha Apresentação',
  attachFile: 'Anexar arquivo',
  generateButton: 'Gerar slides',
  generatingButton: 'Criando seus slides…',
  suggestionsLabel: 'Comece por aqui:',
  errorGeneric: 'Algo deu errado. Tente de novo.',
  errorNetwork: 'Sem conexão. Verifique a internet e tente novamente.',
  errorEmpty: 'Não conseguimos gerar slides para essa descrição. Tente ser mais específico ou use um dos exemplos abaixo.',
  errorRetry: 'Tentar de novo'
};

export const CHAT_SIDEBAR = {
  title: 'Assistente de IA',
  welcome: 'Descreva o tema ou o conteúdo da apresentação. Eu gero os slides para você. Edite à direita e exporte quando estiver pronto.',
  inputPlaceholder: 'Ex.: Pitch de startup, relatório trimestral...',
  attach: 'Anexar',
  send: 'Enviar',
  providerLabel: 'Modelo de IA:',
  footer: 'Enter para enviar · Shift+Enter nova linha',
  generating: 'Gerando sua apresentação...'
};

export const TOOLBAR = {
  createWithAI: 'Criar com IA',
  downloadPptx: 'Exportar PowerPoint',
  downloadPptxTitle: 'Descarregar .pptx (abre no PowerPoint ou Google Slides)',
  present: 'Apresentar',
  presentTitle: 'Abrir em tela cheia',
  addSlide: 'Adicionar slide'
};

export const EDITOR = {
  slidesLabel: 'Slides',
  hint: 'Clique no texto do slide para editar. Altere o layout abaixo se quiser outro tipo de slide.',
  layoutLabel: 'Layout do slide',
  transitionLabel: 'Transição',
  animationLabel: 'Animação',
  dragHint: 'Arraste os slides para reordenar',
  moveUp: 'Subir',
  moveDown: 'Descer',
  duplicate: 'Duplicar',
  remove: 'Remover'
};

export const LAYOUT_GROUPS = [
  { label: 'Abertura', keys: ['hero', 'title', 'title-subtitle'] },
  { label: 'Conteúdo', keys: ['bullet', 'two-column', 'quote', 'image-text'] },
  { label: 'Dados', keys: ['big-number', 'stats-row', 'timeline'] },
  { label: 'Estrutura', keys: ['section'] }
];
