/**
 * Templates PPTX para exportação profissional
 * 
 * Preparação do sistema de templates PowerPoint:
 * - Templates pré-definidos com layouts profissionais
 * - Systema para escolher template baseado em tema/conteúdo
 * - Mapeamento de layouts SlideDeck → layouts PowerPoint
 * - Preparação para uso com python-pptx ou biblioteca similar
 */

const PPTX_TEMPLATES = {
  corporate: {
    name: 'Corporate Professional',
    filename: 'corporate-template.pptx',
    layouts: {
      hero: { 
        name: 'Title Slide', 
        style: 'center-title', 
        bg_style: 'gradient-primary' 
      },
      timeline: { 
        name: 'Timeline', 
        style: 'vertical-timeline', 
        marker_style: 'circle-colored' 
      },
      'bullet-cards': { 
        name: 'Icon Bullets', 
        style: 'icon-cards', 
        card_corners: 'rounded' 
      },
      'stats-grid': { 
        name: 'Metrics', 
        style: 'three-cards', 
        highlight_numbers: true 
      },
      'quote-card': { 
        name: 'Quote', 
        style: 'quote-with-bar', 
        author_position: 'below' 
      }
    }
  },
  
  startup: {
    name: 'Startup Dynamic',
    filename: 'startup-template.pptx', 
    layouts: {
      hero: { 
        name: 'Hero Slide', 
        style: 'gradient-modern', 
        accent_color: 'purple' 
      },
      timeline: { 
        name: 'Roadmap', 
        style: 'horizontal-milestones', 
        gradient_bg: true 
      },
      'bullet-cards': { 
        name: 'Feature List', 
        style: 'feature-cards', 
        icon_size: 'large', 
        bg_style: 'minimal'
      },
      'stats-grid': { 
        name: 'Growth Metrics', 
        style: 'kpi-cards', 
        number_size: 'xlarge' 
      },
      'quote-card': { 
        name: 'Testimonial', 
        style: 'bubble-quote', 
        shadow_effect: 'card' 
      }
    }
  },

  educational: {
    name: 'Educational Clear',
    filename: 'educational-template.pptx',
    layouts: {
      hero: { 
        name: 'Lesson Title', 
        style: 'clean-title', 
        subtitle_support: true 
      },
      timeline: { 
        name: 'Historical Timeline', 
        style: 'educational-timeline', 
        year_visibility: 'prominent' 
      },
      'bullet-cards': { 
        name: 'Key Points', 
        style: 'bullet-list', 
        icon_theme: 'education', 
        spacing: 'comfortable'
      },
      'stats-grid': { 
        name: 'Statistics', 
        style: 'numbers-grid', 
        label_size: 'readable' 
      },
      'quote-card': { 
        name: 'Reference Quote', 
        style: 'reference-box', 
        citation_style: 'MLA' 
      }
    }
  }
};

/**
 * Seleciona template baseado em tema/conteúdo
 * @param {string} contentType - tipo de conteúdo 
 * @param {string} theme - tema desejado
 * @returns {object} template selecionado e seus layouts
 */
function selectPPTXTemplate(contentType, theme = 'corporate') {
  // Lógica de seleção baseada no conteúdo
  if (contentType === 'events_historical' && theme === 'educational') {
    return PPTX_TEMPLATES.educational;
  } else if (contentType === 'metrics_kpi') {
    return PPTX_TEMPLATES.corporate;
  } else if (theme === 'startup') {
    return PPTX_TEMPLATES.startup;
  }
  
  return PPTX_TEMPLATES.corporate;
}

/**
 * Mapeia layouts do SlideDeck para layouts do template PowerPoint
 * @param {string} slideDeckLayout - layout do SlideDeck
 * @param {object} template - template selecionado
 * @returns {object} mapeamento do layout PowerPoint correspondente
 */
function mapSlideDeckLayoutToPPTX(slideDeckLayout, template) {
  const mapping = {
    'hero': 'hero',
    'timeline': 'timeline', 
    'bullet': 'bullet-cards',
    'bullet_cards': 'bullet-cards',
    'stats-row': 'stats-grid',
    'quote': 'quote-card',
    'section': 'section', // usaríamos layout base do template
    'title': 'hero', // título simples usa versão hero minimalista
    'title-subtitle': 'hero', // com subtitle
    'two-column': 'two-column', // layout base
    'big-number': 'hero', // número em destaque
    'image-text': 'image-text' // layout base
  };
  
  const pptxLayoutKey = mapping[slideDeckLayout] || 'hero';
  return template.layouts[pptxLayoutKey] || template.layouts.hero;
}

/**
 * Preparação dos templates - informações sobre arquivos e estrutura
 * @returns {object} informações sobre os templates disponíveis
 */
function getTemplateInfo() {
  return {
    available_templates: Object.keys(PPTX_TEMPLATES),
    templates: PPTX_TEMPLATES,
    recommendation: 'Use selectPPTXTemplate(contentType, theme) para escolher o template apropriado'
  };
}

/**
 * Preparação do sistema: arquivos de template são necessários
 * Esta função retornaria, em produção, os caminhos reais dos arquivos PPTX
 */
function getTemplateFilePath(templateKey) {
  const template = PPTX_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Template ${templateKey} não encontrado`);
  }
  
  // Em produção, isso retornaria o caminho real do arquivo
  return {
    path: `./templates/${template.filename}`,
    info: template,
    layouts: template.layouts
  };
}

module.exports = {
  PPTX_TEMPLATES,
  selectPPTXTemplate,
  mapSlideDeckLayoutToPPTX,
  getTemplateInfo,
  getTemplateFilePath
};