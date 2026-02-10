# Banco de referências – templates PPTX

Esta pasta contém o **banco de referências real** da ferramenta: **ficheiros PPTX** (templates e componentes) que a IA usa para montar apresentações, no espírito de ferramentas como Manus.ai.

## Estrutura

- **`templates/`** – Ficheiros `.pptx` (templates completos ou decks de componentes). Cada ficheiro deve estar listado em `catalog.json`.
- **`catalog.json`** – Catálogo de todos os templates: id, nome, descrição, nome do ficheiro, tipos de slide, tags. A IA recebe este catálogo no prompt para escolher que referências usar.

## Como enriquecer a biblioteca

1. **Via API:** `POST /api/reference-library/templates` com o ficheiro `.pptx` e campos `name`, `description`, `tags` (opcional). O servidor guarda o ficheiro em `templates/` e adiciona uma entrada ao catálogo.
2. **Manualmente:** Colocar um `.pptx` em `templates/` e adicionar uma entrada em `catalog.json` (ver formato abaixo).

## Formato de entrada no catálogo

```json
{
  "id": "identificador-unico",
  "name": "Nome do template",
  "description": "Descrição para a IA (quando usar, estilo, tipo de conteúdo).",
  "filename": "nome-do-ficheiro.pptx",
  "slideLayouts": [
    { "index": 0, "type": "hero" },
    { "index": 1, "type": "section" }
  ],
  "tags": ["corporate", "pitch", "modern"]
}
```

- **slideLayouts**: tipos conhecidos pelo SlideDeck: hero, title, title-subtitle, section, bullet, timeline, two-column, big-number, stats-row, quote, image-text. A ordem deve refletir os slides do PPTX.

## Bibliotecas internas vs externas

- **Internas (atual):** Os ficheiros ficam em `reference-library/templates/` e o catálogo em `catalog.json`. Tudo no servidor.
- **Externas (futuro):** O catálogo pode ter entradas com `"url"` em vez de `"filename"`, para referenciar templates num CDN ou outro serviço. O servidor pode descarregar e usar quando necessário.
