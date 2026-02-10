# Banco de referências – elementos, gráficos e templates PPTX reais

O banco de referências **não é só texto**. É um **conjunto de ficheiros PPTX** (templates e componentes completos e modernos) que a IA usa para montar apresentações, no espírito de ferramentas como **Manus.ai**, que criam apresentações a partir de referências prontas.

---

## O que é o banco

- **Templates PPTX reais** – Ficheiros `.pptx` guardados no servidor (gráficos, layouts, estilos, elementos visuais).
- **Catálogo** – Ficheiro `catalog.json` que descreve cada template (id, nome, descrição, tipos de slide, tags). A IA recebe este catálogo no prompt e escolhe **que referência usar** para cada apresentação.
- **Performance** – A IA não “inventa” layouts a partir de texto: escolhe entre **recursos que existem** no banco (templates e componentes) e monta a apresentação com base neles.

---

## Onde está

| Local | Conteúdo |
|-------|----------|
| `server/reference-library/templates/` | Ficheiros `.pptx` (templates ou decks de componentes). |
| `server/reference-library/catalog.json` | Lista de todos os templates: id, name, description, filename, slideLayouts, tags. |
| `server/reference-library/catalogLoader.js` | Lógica para carregar/gravar o catálogo e gerar o texto que vai para o prompt da IA. |

O prompt da IA é montado em cada pedido com: regras de design (texto) **+ catálogo do banco** (templates disponíveis). Assim a IA “vê” os recursos reais disponíveis.

---

## Bibliotecas internas vs externas

- **Internas (atual):** Os PPTX ficam em `reference-library/templates/` no servidor. O catálogo referencia `filename` (nome do ficheiro local). Tudo é controlado pela aplicação.
- **Externas (futuro):** O catálogo pode ter entradas com `"url"` em vez de `"filename"`, para apontar para templates num CDN ou outro serviço. O backend pode descarregar e usar quando for gerar a apresentação. A estrutura do catálogo já permite evoluir para isso.

---

## Como enriquecer a biblioteca – incluir novos templates PPTX

### 1. Via API (recomendado)

**Endpoint:** `POST /api/reference-library/templates`

- **Body:** `multipart/form-data` com:
  - `file` – ficheiro `.pptx` (obrigatório)
  - `name` – nome do template (ex.: "Pitch Startup")
  - `description` – descrição para a IA (quando usar, estilo, tipo de conteúdo)
  - `tags` – opcional; lista de tags separadas por vírgula (ex.: "pitch, startup, moderno")
- O servidor guarda o ficheiro em `reference-library/templates/`, analisa o número de slides e adiciona/atualiza uma entrada no `catalog.json`. A partir daí a IA passa a poder escolher este template.

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3788/api/reference-library/templates \
  -F "file=@meu-template.pptx" \
  -F "name=Pitch Startup" \
  -F "description=Template para pitch de startups, hero forte e métricas em destaque." \
  -F "tags=pitch, startup, moderno"
```

### 2. Manualmente

1. Copiar o ficheiro `.pptx` para `server/reference-library/templates/`.
2. Editar `server/reference-library/catalog.json` e adicionar um objeto em `templates`:

```json
{
  "id": "pitch-startup",
  "name": "Pitch Startup",
  "description": "Template para pitch de startups, hero forte e métricas em destaque.",
  "filename": "pitch-startup.pptx",
  "slideLayouts": [
    { "index": 0, "type": "hero" },
    { "index": 1, "type": "section" },
    { "index": 2, "type": "bullet" }
  ],
  "tags": ["pitch", "startup", "moderno"]
}
```

- **slideLayouts:** tipos reconhecidos pelo SlideDeck: `hero`, `title`, `title-subtitle`, `section`, `bullet`, `timeline`, `two-column`, `big-number`, `stats-row`, `quote`, `image-text`. A ordem deve corresponder aos slides do PPTX (index 0 = primeiro slide, etc.).

---

## Pasta externa no disco (templates que já tens)

Podes usar **uma pasta no teu disco** (ex.: no drive) com vários .pptx prontos. A aplicação **escaneia essa pasta** e a IA **consulta** todos esses ficheiros para escolher templates.

**Como ativar:**

1. No ficheiro **`.env`** do servidor (pasta `server/`), define:
   ```env
   EXTERNAL_TEMPLATES_PATH=D:\MeusTemplates
   ```
   (Substitui pelo caminho real da tua pasta, ex.: `C:\Users\ti\Apresentacoes\templates`.)

2. Coloca os teus ficheiros **.pptx** nessa pasta.

3. Reinicia o servidor. Em cada pedido, o servidor lê essa pasta e **junta** os templates externos aos internos. A IA vê a lista completa e escolhe entre eles.

**Metadados opcionais:** Se quiseres dar nome, descrição e tags a um template externo, cria um **.json com o mesmo nome** ao lado do .pptx. Ex.: `pitch-vendas.pptx` e `pitch-vendas.json` com `{"name":"Pitch de Vendas","description":"...","tags":["pitch","vendas"],"slideLayouts":[...]}`. Sem .json, o sistema usa o nome do ficheiro e analisa o PPTX para o número de slides.

---

## Google Drive (pasta partilhada)

A IA pode consultar uma **pasta do Google Drive** onde tenhas os teus .pptx (ex.: [templates-app](https://drive.google.com/drive/folders/1uCEuKlBEJqb5FJ9V0rxf_UodizaV5q9y?usp=sharing)).

**Configuração:**

1. **Partilha a pasta** no Drive como **"Quem tiver o link pode ver"** (ou "Qualquer pessoa com o link").
2. Obtém o **ID da pasta** na URL: `https://drive.google.com/drive/folders/1uCEuKlBEJqb5FJ9V0rxf_UodizaV5q9y` → o ID é `1uCEuKlBEJqb5FJ9V0rxf_UodizaV5q9y`.
3. Cria uma **API key** no [Google Cloud Console](https://console.cloud.google.com/): ativa a **Google Drive API** para o teu projeto e gera uma chave de API (restrição opcional: só Drive API).
4. No **`.env`** do servidor:
   ```env
   GOOGLE_DRIVE_TEMPLATES_FOLDER_ID=1uCEuKlBEJqb5FJ9V0rxf_UodizaV5q9y
   GOOGLE_API_KEY=AIza...a_tua_chave
   ```
5. Reinicia o servidor. O servidor lista os .pptx dessa pasta e junta-os ao catálogo; a IA passa a poder escolhê-los (aparecem como [Google Drive]).

Os templates do Drive aparecem com o **nome do ficheiro** no Drive e descrição genérica. O `id` usado no catálogo é `gd-` + id do ficheiro no Drive (ex.: `gd-1abc...`).

---

## Consultar o catálogo

- **GET** `http://localhost:3788/api/reference-library/catalog` – devolve o `catalog.json` (lista de templates). Pode ser usado pela UI para mostrar a biblioteca ou para debug.

---

## Fluxo na geração com IA

1. O utilizador pede uma apresentação (chat).
2. O servidor monta o system prompt com: regras de design **+** texto do catálogo (templates PPTX disponíveis).
3. A IA escolhe um `templateId` (se houver templates no banco) e gera o JSON (deckTitle, slides com layout e content).
4. O backend pode usar o `templateId` para aplicar estilo ou composição a partir do PPTX real (evolução futura: clonar slides do template e preencher conteúdo). Hoje o catálogo já orienta a IA para **usar** essas referências; a montagem final do ficheiro pode continuar a usar pptxgenjs com o conteúdo gerado e, em seguida, evoluir para fusão com os PPTX do banco.

---

## Resumo

- O banco de referências é **baseado em PPTX reais** (elementos, gráficos, componentes), não só em texto.
- A IA **usa** esse banco através do **catálogo** injetado no prompt.
- Podes **incluir novos templates** por **API** (POST com ficheiro + nome/descrição/tags) ou **manualmente** (colocar o .pptx em `templates/` e editar `catalog.json`).
- Podes usar uma **pasta externa** no disco: define `EXTERNAL_TEMPLATES_PATH` no .env; a IA consulta todos os .pptx dessa pasta. Bibliotecas podem ser **internas** (reference-library/templates/) ou **pasta externa** (teu drive).
