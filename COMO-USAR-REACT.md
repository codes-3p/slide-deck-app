# Interface React do SlideDeck

## Ver a nova interface em React

A aplicação tem duas formas de rodar:

### 1. Interface React (nova, com chat lateral)

1. **Abra um terminal** no Cursor (Terminal → New Terminal).
2. Instale as dependências (só na primeira vez):
   ```bash
   cd C:\Users\rodri\slide-deck-app
   npm install
   ```
3. Inicie a interface React:
   ```bash
   npm start
   ```
4. No navegador, acesse: **http://localhost:3000** (use sempre a porta 3000; se já estiver em uso, é a mesma aplicação — basta abrir esse endereço).

Você verá a interface em React com:
- Chat lateral fixo à direita (estilo Manus.ai)
- Histórico de conversa com a IA
- Mesmos templates e edição de slides
- Modo apresentação (F5)

### 2. API para "Criar com IA"

Para o botão **Criar com IA** / chat gerar apresentações, o servidor Node precisa estar rodando:

1. **Abra outro terminal** (deixe o que está com `npm start` rodando).
2. No novo terminal:
   ```bash
   cd C:\Users\rodri\slide-deck-app\server
   npm start
   ```
3. Quando aparecer `SlideDeck: http://localhost:3788`, a API está ativa.

Com os dois rodando:
- **http://localhost:3000** → interface React (usa a API em 3788 por proxy)
- **http://localhost:3788** → interface antiga (HTML puro) + API

### Resumo

| O que você quer           | O que fazer |
|---------------------------|------------|
| Ver a interface React    | `npm start` na pasta slide-deck-app → abrir http://localhost:3000 |
| Usar "Criar com IA"       | Rodar também o servidor: `cd server` e `npm start` |
| Só a interface antiga    | Só rodar o servidor (server) e abrir http://localhost:3788 |
