# Deploy em produção — slides.rpce.com.br

## Checklist antes de subir

- [ ] Código no GitHub (push das alterações)
- [ ] Na VPS: em `server/.env` definir pelo menos um provider de IA:
  - `OPENAI_API_KEY` (OpenAI ou OpenRouter se usar OPENAI_BASE_URL)
  - **`OPENROUTER_API_KEY`** — para modelo gratuito **OpenRouter (free)**; modelo: `OPENROUTER_MODEL=openrouter/free`
  - `ANTHROPIC_API_KEY` e/ou `GOOGLE_API_KEY`
- [ ] DNS: `slides.rpce.com.br` → `207.180.229.32`
- [ ] (Opcional) Motor PPTX: subir `server/pptx_renderer` e definir `PPTX_RENDERER_URL` no `.env` para export com templates

## O que foi feito na VPS

- **App:** clonado em `/var/www/slide-deck-app` (repositório GitHub codes-3p/slide-deck-app).
- **Servidor:** Traefik (Docker Swarm) na porta 80/443.
- **Stack:** `slide_slide-deck` — um serviço que monta o app e expõe na rede `minharede1`.
- **URL:** https://slides.rpce.com.br (roteamento e SSL via Traefik + Let's Encrypt).

## DNS obrigatório

Para o site responder em **slides.rpce.com.br**, é preciso criar um registro **A** apontando para o IP da VPS:

- **Host:** `slides` (ou `slides.rpce.com.br` conforme o painel)
- **Valor/IP:** `207.180.229.32`
- **TTL:** 300 ou padrão

Depois que o DNS propagar (alguns minutos), acesse: **https://slides.rpce.com.br**

## Comandos úteis na VPS

```bash
# Ver serviço
docker service ls | grep slide

# Logs do app
docker service logs slide_slide-deck -f

# Reiniciar após alterar código em /var/www/slide-deck-app
docker service update --force slide_slide-deck
```

## Atualizar o app

Na VPS (com interface React em produção):

```bash
cd /var/www/slide-deck-app
git pull
npm install
npm run build
docker service update --force slide_slide-deck
```

O servidor serve automaticamente a pasta `build/` do React se existir; caso contrário usa o `index.html` da raiz. Assim, após `npm run build`, o próximo restart do container já mostra a nova interface.

**Atualização rápida (só backend):**

```bash
cd /var/www/slide-deck-app && git pull && docker service update --force slide_slide-deck
```

## Chave OpenAI (IA)

O ficheiro `/var/www/slide-deck-app/server/.env` na VPS deve ter pelo menos uma chave de IA para "Criar com IA" funcionar. Editar na VPS:

```bash
nano /var/www/slide-deck-app/server/.env
```

Exemplo com **OpenRouter (modelo gratuito)**:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
OPENROUTER_MODEL=openrouter/free
```

Obter chave em: https://openrouter.ai/keys — o modelo `openrouter/free` escolhe automaticamente modelos gratuitos na OpenRouter.

Outros providers (opcional): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`.

Depois: `docker service update --force slide_slide-deck`.
