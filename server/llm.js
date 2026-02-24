/**
 * Abstração multi-LLM: OpenAI, OpenRouter (incl. openrouter/free), Ollama, Anthropic Claude, Google Gemini.
 * Cada provider recebe systemContent, userContent e opcionalmente image (buffer + mime).
 * Devolve o texto da resposta.
 */
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || undefined;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

function hasOpenAI() {
  return !!OPENAI_API_KEY;
}

function hasOpenRouter() {
  return !!OPENROUTER_API_KEY;
}

function hasAnthropic() {
  return !!ANTHROPIC_API_KEY;
}

function hasGoogle() {
  return !!GOOGLE_API_KEY;
}

/**
 * Lista os providers configurados (com chave definida).
 * Cada provider tem id único para evitar duplicados no select.
 * OpenRouter dedicado: OPENROUTER_API_KEY + OPENROUTER_MODEL (default openrouter/free).
 */
function getAvailableProviders() {
  const list = [];
  const baseUrl = (OPENAI_BASE_URL || '').toLowerCase();

  if (hasOpenAI()) {
    if (!OPENAI_BASE_URL) {
      list.push({ id: 'openai', name: 'OpenAI (GPT)', model: OPENAI_MODEL });
    } else if (baseUrl.includes('openrouter')) {
      list.push({ id: 'openrouter-custom', name: 'OpenRouter', model: OPENAI_MODEL });
    } else {
      list.push({ id: 'ollama', name: 'Ollama', model: OPENAI_MODEL });
    }
  }
  if (hasOpenRouter()) {
    list.push({ id: 'openrouter', name: 'OpenRouter (free)', model: OPENROUTER_MODEL });
  }
  if (hasAnthropic()) list.push({ id: 'anthropic', name: 'Anthropic (Claude)', model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet' });
  if (hasGoogle()) list.push({ id: 'google', name: 'Google (Gemini)', model: process.env.GOOGLE_MODEL || 'gemini-1.5-flash' });
  if (list.length === 0) list.push({ id: 'openai', name: 'OpenAI (não configurado)', model: '' });
  return list;
}

/**
 * Chama o provider escolhido e devolve o texto da resposta.
 */
async function getCompletion({ provider, systemContent, userContent, imageBuffer, imageMimeType }) {
  const effectiveProvider = provider || (hasOpenAI() ? 'openai' : (hasOpenRouter() ? 'openrouter' : (hasAnthropic() ? 'anthropic' : (hasGoogle() ? 'google' : 'openai'))));

  if (effectiveProvider === 'anthropic' && hasAnthropic()) {
    return runAnthropic(systemContent, userContent, imageBuffer, imageMimeType);
  }
  if (effectiveProvider === 'google' && hasGoogle()) {
    return runGoogle(systemContent, userContent, imageBuffer, imageMimeType);
  }
  if (effectiveProvider === 'openrouter' && hasOpenRouter()) {
    return runOpenRouter(systemContent, userContent, imageBuffer, imageMimeType);
  }
  if (effectiveProvider === 'openrouter-custom' && hasOpenAI()) {
    return runOpenAI(systemContent, userContent, imageBuffer, imageMimeType);
  }

  return runOpenAI(systemContent, userContent, imageBuffer, imageMimeType);
}

async function runOpenAI(systemContent, userContent, imageBuffer, imageMimeType) {
  const { OpenAI } = require('openai');
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: OPENAI_BASE_URL || undefined
  });

  let userMsg = userContent;
  if (imageBuffer && imageMimeType) {
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:${imageMimeType};base64,${base64}`;
    userMsg = [
      { type: 'text', text: (typeof userContent === 'string' ? userContent : '') + '\n\n[Imagem anexada: descreve e usa como referência. Gera o JSON da apresentação.]' },
      { type: 'image_url', image_url: { url: dataUrl } }
    ];
  }

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userMsg }
    ],
    temperature: 0.7,
    max_tokens: 4096
  });

  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Resposta vazia da IA');
  return text;
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

async function runOpenRouter(systemContent, userContent, imageBuffer, imageMimeType) {
  const { OpenAI } = require('openai');
  const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL
  });

  let userMsg = userContent;
  if (imageBuffer && imageMimeType) {
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:${imageMimeType};base64,${base64}`;
    userMsg = [
      { type: 'text', text: (typeof userContent === 'string' ? userContent : '') + '\n\n[Imagem anexada: descreve e usa como referência. Gera o JSON da apresentação.]' },
      { type: 'image_url', image_url: { url: dataUrl } }
    ];
  }

  const completion = await openai.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userMsg }
    ],
    temperature: 0.7,
    max_tokens: 4096
  });

  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Resposta vazia da IA');
  return text;
}

async function runAnthropic(systemContent, userContent, imageBuffer, imageMimeType) {
  let Anthropic;
  try {
    Anthropic = require('@anthropic-ai/sdk');
  } catch (e) {
    throw new Error('Provider Anthropic não disponível. Instale: npm install @anthropic-ai/sdk');
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  const content = [];
  if (typeof userContent === 'string') {
    content.push({ type: 'text', text: userContent });
  } else if (Array.isArray(userContent)) {
    content.push(...userContent.filter((c) => c.type === 'text').map((c) => ({ type: 'text', text: c.text })));
  }
  if (imageBuffer && imageMimeType) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMimeType,
        data: imageBuffer.toString('base64')
      }
    });
  }
  if (content.length === 0) content.push({ type: 'text', text: String(userContent) });

  const msg = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemContent,
    messages: [{ role: 'user', content }]
  });

  const block = msg.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('Resposta vazia da IA');
  return block.text;
}

async function runGoogle(systemContent, userContent, imageBuffer, imageMimeType) {
  let genAI;
  try {
    genAI = require('@google/generative-ai').GoogleGenerativeAI;
  } catch (e) {
    throw new Error('Provider Google não disponível. Instale: npm install @google/generative-ai');
  }
  const gen = new genAI(GOOGLE_API_KEY);
  const modelName = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';
  const model = gen.getGenerativeModel({ model: modelName });

  const parts = [{ text: typeof userContent === 'string' ? userContent : (userContent && userContent[0]?.text) || '' }];
  if (imageBuffer && imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBuffer.toString('base64')
      }
    });
  }

  const result = await model.generateContent([
    { text: systemContent + '\n\nResponde apenas com o JSON da apresentação (deckTitle, templateId, slides).' },
    ...parts
  ]);
  const response = result.response;
  const text = response.text?.() || '';
  if (!text) throw new Error('Resposta vazia da IA');
  return text;
}

module.exports = {
  getCompletion,
  getAvailableProviders,
  hasOpenAI,
  hasOpenRouter,
  hasAnthropic,
  hasGoogle
};
