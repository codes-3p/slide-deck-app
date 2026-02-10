/**
 * Script de teste para demonstrar o novo sistema de componentes visuais
 * Cria uma apresentação completa usando o novo sistema de seleção de componentes
 */

const fetch = globalThis.fetch || require('node-fetch'); // compatibilidade com diferentes ambientes

// Dados de teste para diferentes tipos de conteúdo
const TEST_CASES = [
  {
    nome: "História do Brasil (Timeline)",
    descricao: "Eventos históricos do Brasil: 1822 Independência do Brasil, 1888 Abolição da escravatura, 1891 Primeira República, 1964 Golpe militar, 1985 Redemocratização",
    expected_type: "events_historical"
  },
  {
    nome: "Métricas Empresariais (Stats Grid)",
    descricao: "Métricas de performance da empresa Q4 2023: Crescimento de vendas, Satisfação do cliente, Taxa de retenção, ROI marketing, Conversão de leads",
    expected_type: "metrics_kpi"
  },
  {
    nome: "Conquistas da Empresa (Bullet Cards)",
    descricao: "Principais conquistas da equipe este ano: Lançamento bem-sucedido de novo produto, Aumento de 40% na base de clientes, Prêmio de inovação, Certificação ISO, Expansão para novos mercados",
    expected_type: "achievements_list"
  },
  {
    nome: "Depoimentos de Clientes (Quote Cards)",
    descricao: "Feedback de clientes sobre nosso serviço: Excelente experiência, Suporte rápido, Qualidade excepcional, Recomendo a todos, Melhor decisão que tomei",
    expected_type: "testimonials"
  }
];

async function testComponentSelection() {
  console.log("\n🎯 TESTANDO SISTEMA DE SELEÇÃO DE COMPONENTES\n");
  
  for (const teste of TEST_CASES) {
    console.log(`\n--- Teste: ${teste.nome} ---`);
    console.log(`Descrição: ${teste.descricao}`);
    
    // Usar a função detectContentTypeAndComponents do servidor
    const { detectContentTypeAndComponents } = require('./index.js');
    const detection = detectContentTypeAndComponents(teste.descricao);
    
    console.log(`✅ Tipo detectado: ${detection.contentType} (esperado: ${teste.expected_type})`);
    console.log(`🎨 Tema: ${detection.theme}`);
    
    // Selecionar componentes 
    const { selectComponentsForContent } = require('./design-bank.js');
    const components = selectComponentsForContent(detection.contentType, detection.theme);
    
    console.log(`📋 Componentes selecionados:`);
    console.log(`   - Layout: ${components.layout_name} (${components.layout_id})`);
    console.log(`   - Ícones: ${components.icon_set_name} (${components.icon_set_id})`);
    console.log(`   - Cores: ${components.color_scheme.primary} / ${components.color_scheme.secondary}`);
    
    // Verificar se está correto
    const correcto = detection.contentType === teste.expected_type;
    console.log(correcto ? "✅ CORRETO!" : "❌ Diferente do esperado");
  }
}

async function createFullPresentation() {
  console.log("\n\n🚀 CRIANDO APRESENTAÇÃO COMPLETA\n\n");
  
  const descricao = "História do Brasil: eventos marcantes desde a Independência em 1822 até a Redemocratização em 1985. Incluir métricas de crescimento populacional e depoimentos históricos importantes. Apresentação educacional para escolas.";
  
  console.log(`Descrição da apresentação: ${descricao}`);
  
  // Criar apresentação usando o endpoint real
  console.log("\n📤 Gerando apresentação via API...");
  
  const payload = {
    description: descricao, 
    deckTitle: "História do Brasil: Da Independência à Redemocratização"
  };
  
  try {
    const response = await fetch('http://localhost:3788/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    console.log("\n📊 RESULTADO DA GERAÇÃO:");
    console.log(`Status: ${response.status}`);
    console.log(`Título: ${data.deckTitle || 'Sem título'}`);
    console.log(`Slades gerados: ${data.slides?.length || 0}`);
    
    if (data.slides && data.slides.length > 0) {
      console.log("\n📋 CONTEÚDO DOS SLIDES: ")
      data.slides.forEach((slide, index) => {
        console.log(`\nSlide ${index + 1}: ${slide.layout} - ${slide.content?.title || 'Sem título'}`);
        if (slide.layout === 'timeline' && slide.content?.events) {
          slide.content.events.forEach(event => {
            console.log(`  • ${event.year}: ${event.text} [${event.icon}]`);
          });
        } else if (slide.layout === 'bullet_cards' && slide.content?.items) {
          slide.content.items.forEach(item => {
            console.log(`  • ${item.text} [${item.icon}]`);
          });
        } else if (slide.layout === 'stats_grid' && slide.content) {
          console.log(`  📈 ${slide.content.stat1} - ${slide.content.label1}`);
          console.log(`  📈 ${slide.content.stat2} - ${slide.content.label2}`); 
          console.log(`  📈 ${slide.content.stat3} - ${slide.content.label3}`);
        }
      });
    }
    
    console.log("\n✅ APRESENTAÇÃO CRIADA COM SISTEMA DE COMPONENTES!");
    
  } catch (error) {
    console.error("❌ Erro ao gerar apresentação:", error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log("💡 Certifique-se de que o servidor está em execução em http://localhost:3788");
    }
  }
}

// Executar os testes
async function runTests() {
  console.log("\n=========================================");
  console.log("🧪 SISTEMA DE COMPONENTES VISUAIS - TESTE");
  console.log("=========================================");
  
  try {
    await testComponentSelection();
    await createFullPresentation();
    
    console.log("\n=========================================");
    console.log("✅ TODOS OS TESTES COMPLETADOS!");
    console.log("📊 Verifique a apresentação gerada no navegador");
    console.log("=========================================");
    
  } catch (error) {
    console.error("❌ Erro durante testes:", error);
  }
}

// Executar se este script for executado diretamente
if (require.main === module) {
  runTests().then(() => {
    console.log("\n🎯 Sistema de componentes testado com sucesso!");
  }).catch(console.error);
}