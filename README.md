# TPulseFi Wallet

Carteira DeFi para WorldChain com integração Holdstation SDK.

## 🚀 Setup Rápido

### GitHub Codespaces (Recomendado)
1. Clique em **Code** > **Codespaces** > **Create codespace**
2. Aguarde o setup automático
3. Execute: `npm run dev`

### Local
\`\`\`bash
git clone <seu-repo>
cd tpulsefi-wallet
chmod +x scripts/setup.sh
./scripts/setup.sh
npm run dev
\`\`\`

### Dependências Principais
- `@holdstation/worldchain-sdk` - SDK oficial WorldChain
- `@holdstation/worldchain-ethers-v6` - Adapter Ethers v6
- `ethers` - Biblioteca Ethereum
- `bignumber.js` - Matemática de precisão

## 🔧 Comandos

\`\`\`bash
npm run dev              # Desenvolvimento
npm run build           # Build produção
npm run install-worldchain  # Instalar deps WorldChain
\`\`\`

## 🌐 Funcionalidades

- ✅ Swap de tokens WorldChain
- ✅ Envio de tokens
- ✅ Histórico de transações
- ✅ Balances em tempo real
- ✅ Integração Holdstation

## 📋 Requisitos

- Node.js 18+
- NPM ou Yarn
- Acesso ao WorldChain RPC
