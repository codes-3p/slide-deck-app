/**
 * Exporta o deck para .pptx via API do servidor e inicia o download no navegador.
 */
const API_BASE = '';

/**
 * Gera o .pptx no servidor e faz o download no browser.
 * @param {Object} params
 * @param {string} params.deckTitle - Título da apresentação
 * @param {Array} params.slides - Array de { layout, content }
 * @param {string} [params.templateId] - Id do template a usar (se houver)
 */
export async function downloadPptx({ deckTitle, slides, templateId }) {
  if (!slides || !slides.length) return;
  try {
    const res = await fetch((API_BASE || '') + '/api/export-pptx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckTitle, slides, templateId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erro ${res.status}`);
    }
    const blob = await res.blob();
    const fileName = res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1] || 'apresentacao.pptx';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erro ao baixar PPTX:', err);
    throw err;
  }
}
