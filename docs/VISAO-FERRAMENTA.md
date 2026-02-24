# Visão: Ferramenta ideal para apresentações PPT (nível MANUS+)

Este documento descreve a visão e o roadmap para tornar o SlideDeck uma ferramenta **extremamente potente e impecável** para criar apresentações com IA e export em PPT compatível.

## Princípios

1. **Chat primeiro** – Tudo começa na conversa: descrever, anexar, pedir alterações. O editor complementa.
2. **Export = PPTX real** – O .ppt final vem de **templates PPTX reais** (abrir, duplicar slide correspondente ao layout, preencher). Animações e efeitos vêm do template.
3. **Liberdade sem incompatibilidade** – A IA e o utilizador escolhem conteúdo e template; o export nunca “inventa” formato que depois não seja compatível com PowerPoint.

## Pilares implementados

| Pilar | Estado |
|-------|--------|
| Chat conversacional | ✅ Chat lateral, sugestões, anexos |
| Banco de templates PPTX | ✅ Catálogo (internos, pasta externa, Google Drive) |
| Motor template-first | ✅ IA obrigada a devolver `templateId` quando há templates; export usa `pptx_renderer` com mapeamento layout → slide do template |
| Fallback | ✅ Sem motor PPTX configurado: export via PptxGenJS (conteúdo apenas) |

## Como ativar o export com templates (motor PPTX)

1. **Colocar templates .pptx** em `server/reference-library/templates/` (ou configurar `EXTERNAL_TEMPLATES_PATH`).
2. **Registar no catálogo** – via `POST /api/reference-library/templates` com ficheiro + nome/descrição/tags, ou editar `server/reference-library/catalog.json` com `slideLayouts` por slide (ex.: `[{ "index": 0, "type": "hero" }, { "index": 1, "type": "bullet" }]`).
3. **Subir o microserviço de renderização** (Python):
   ```bash
   cd server/pptx_renderer
   pip install -r requirements.txt
   uvicorn app:app --host 0.0.0.0 --port 5001
   ```
4. **Configurar no servidor Node** – no `server/.env`:
   ```
   PPTX_RENDERER_URL=http://localhost:5001
   ```

Com isso, ao clicar em **Baixar PPTX**, o servidor usa o template escolhido pela IA e o motor preenche os slides corretos (hero, bullet, etc.), preservando o design e efeitos do PPTX.

## Próximas fases (roadmap)

- **Fase 2 (templates ricos):** Incluir 1–2 templates PPTX com transições/animações e garantir `slideLayouts` no catálogo.
- **Fase 3 (editor de refinamento):** ✅ Lista de slides com preview, reordenar (↑↓ ou **arrastar e largar**), editar texto por slide, trocar layout. **Atalhos:** Ctrl+↑/↓ mover slide, Ctrl+D duplicar, Delete remover (fora de campos de texto).
- **Fase 4 (multi-LLM):** ✅ Suporte a vários backends (OpenAI, OpenRouter, Ollama, Anthropic Claude, Google Gemini). Parâmetro `provider` no body de `/api/generate`; GET `/api/providers` lista os configurados. No chat, dropdown "Modelo" quando há mais de um provider.
- **Polish:** Indicador de template na toolbar ("Template: id"), estado vazio no editor quando não há slides. Variáveis opcionais no `.env`: `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`.

## Ficheiros-chave

- `server/prompt.js` – Prompt da IA; `templateId` obrigatório quando há templates.
- `server/reference-library/catalogLoader.js` – Catálogo e texto para o prompt.
- `server/pptx_renderer/app.py` – Motor que abre o PPTX, mapeia layout → slide do template e preenche conteúdo.
- `server/pptxRendererClient.js` – Cliente Node que chama o motor com `templatePath`, `slides`, `slideLayouts`.
