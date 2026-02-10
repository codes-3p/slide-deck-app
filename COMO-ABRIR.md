# Como abrir o SlideDeck no navegador

## Se nada acontece em http://localhost:3788

É porque **o servidor precisa estar rodando**. Siga um dos jeitos abaixo.

---

## Opção 1: Duplo clique (mais fácil)

1. Abra a pasta do projeto no Explorador de Arquivos:
   ```
   C:\Users\rodri\slide-deck-app
   ```
2. Dê **duplo clique** no arquivo **`START-SERVER.bat`**
3. Vai abrir uma janela preta (terminal). **Deixe essa janela aberta.**
4. Quando aparecer a mensagem:
   ```
   SlideDeck: http://localhost:3788 (frontend + API)
   ```
5. Abra o **Chrome, Edge ou Firefox** e digite na barra de endereço:
   ```
   http://localhost:3788
   ```
6. Aperte **Enter**. A interface do SlideDeck deve carregar.

---

## Opção 2: Pelo terminal do Cursor

1. No Cursor, abra o **Terminal** (menu Terminal → New Terminal ou `` Ctrl+` ``).
2. Cole e execute:
   ```bash
   cd C:\Users\rodri\slide-deck-app\server
   npm start
   ```
3. Deixe o terminal aberto (não feche).
4. Abra o navegador em: **http://localhost:3788**

---

## Resumo

| O que fazer | Por quê |
|-------------|--------|
| Deixar o terminal/janela do servidor **aberta** | O app só funciona enquanto o servidor está rodando. |
| Usar **http://localhost:3788** | É a porta em que o servidor escuta. |
| Se der erro de porta em uso | Alguém já está usando a 3788; feche esse programa ou mude a porta no `.env` (variável `PORT`). |

---

## Se ainda não abrir

- Confirme que a pasta é mesmo `C:\Users\rodri\slide-deck-app`.
- Na pasta `server`, execute `npm install` e depois `npm start`.
- Se aparecer erro no terminal, copie a mensagem e use para debugar ou pedir ajuda.
