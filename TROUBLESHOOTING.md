# 🔧 Guia de Solução de Problemas - TPulseFi Wallet

## 🚨 Problemas Comuns

### 1. **npm install travado**
\`\`\`bash
# Parar processo
Ctrl+C

# Limpar tudo
rm -rf node_modules package-lock.json .next
npm cache clean --force

# Reinstalar
npm install --no-optional --no-fund --no-audit
\`\`\`

### 2. **Dependências WorldChain não encontradas**
\`\`\`bash
# Instalar manualmente
npm install @holdstation/worldchain-sdk
npm install @holdstation/worldchain-ethers-v6
npm install ethers
npm install bignumber.js
\`\`\`

### 3. **Erro de BigNumber**
\`\`\`bash
# Verificar versão
npm list bignumber.js

# Reinstalar se necessário
npm uninstall bignumber.js
npm install bignumber.js@^9.1.2
\`\`\`

### 4. **Conflitos de versão do Ethers**
\`\`\`bash
# Forçar versão específica
npm install ethers@^6.8.0 --save-exact
\`\`\`

## 🛠️ Scripts Úteis

### Testar Dependências
\`\`\`bash
npm run test-deps
\`\`\`

### Correção Rápida
\`\`\`bash
npm run quick-fix
\`\`\`

### Instalação Limpa
\`\`\`bash
npm run clean && npm install
\`\`\`

## 🔍 Verificações Manuais

### 1. **Verificar Node.js**
\`\`\`bash
node --version  # Deve ser >= 16.0.0
npm --version   # Deve ser >= 8.0.0
\`\`\`

### 2. **Verificar Dependências**
\`\`\`bash
npm list @holdstation/worldchain-sdk
npm list ethers
npm list bignumber.js
\`\`\`

### 3. **Teste Manual**
\`\`\`bash
node -e "
console.log('Testando...');
try {
  const sdk = require('@holdstation/worldchain-sdk');
  console.log('✅ SDK OK');
} catch (e) {
  console.log('❌ SDK Falhou:', e.message);
}
"
\`\`\`

## 🆘 Se Nada Funcionar

1. **Deletar Codespace atual**
2. **Criar novo Codespace**
3. **Aguardar setup automático**
4. **Executar:**
   \`\`\`bash
   npm install
   npm run install-worldchain
   npm run test-deps
   npm run dev
   \`\`\`

## 📞 Suporte

- **GitHub Issues**: Reporte problemas no repositório
- **Logs**: Sempre inclua logs completos
- **Versões**: Mencione versões do Node.js e npm
