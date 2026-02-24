# SlideDeck PPTX Renderer

Microserviço que gera ficheiros .pptx a partir de **templates PPTX reais** e do conteúdo gerado pela IA. Preserva o design, animações e transições do template.

## Requisitos

- Python 3.9+
- Dependências: `pip install -r requirements.txt`

## Uso

```bash
uvicorn app:app --host 0.0.0.0 --port 5001
```

## API

- **POST /render**

Body (JSON):

- `templatePath` – caminho absoluto do ficheiro .pptx do template
- `deckTitle` – título da apresentação (opcional)
- `slides` – lista de `{ "layout": "hero"|"bullet"|..., "content": { ... } }`
- `slideLayouts` – lista de `{ "index": 0, "type": "hero" }` que descreve cada slide do template

Para cada slide em `slides`, o renderer escolhe o slide do template cujo `type` em `slideLayouts` coincide com `layout`, duplica esse slide e preenche com `content`. Se não houver correspondência, usa o slide de índice 0.

## Integração com o SlideDeck

No servidor Node, definir no `.env`:

```
PPTX_RENDERER_URL=http://localhost:5001
```

Quando o utilizador faz **Baixar PPTX** e há `templateId`, o servidor envia o caminho do template, os slides e o `slideLayouts` do catálogo para este serviço e devolve o .pptx gerado.
