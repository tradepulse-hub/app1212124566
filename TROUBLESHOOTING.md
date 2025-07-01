# 🔧 Guia de Solução de Problemas - TPulseFi Wallet

## 🚨 Problemas Comuns

### 1. **npm install travado**
\`\`\`bash
# Parar processo
Ctrl+C

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
\`\`\`

### 2. **Dependências do WorldChain falhando**
\`\`\`bash
# Reinstalar dependências específicas
npm uninstall @holdstation/worldchain-sdk @holdstation/worldchain-ethers-v6
npm install @holdstation/worldchain-sdk@latest @holdstation/worldchain-ethers-v6@latest
\`\`\`

### 3. **Erro de BigNumber**
\`\`\`bash
# Verificar versão do ethers
npm list ethers

# Se necessário, forçar versão
npm install ethers@^6.8.0 --save-exact
\`\`\`

### 4. **Vulnerabilidades de segurança**
\`\`\`bash
# Corrigir automaticamente
npm audit fix

# Se persistir
npm audit fix --force
\`\`\`

## 🧪 **Comandos de Teste**

### Testar dependências:
\`\`\`bash
npm run test-deps
\`\`\`

### Correção rápida:
\`\`\`bash
npm run quick-fix
\`\`\`

### Teste manual:
\`\`\`bash
node -e "
console.log('Testando SDK...');
try {
  const sdk = require('@holdstation/worldchain-sdk');
  console.log('✅ SDK OK:', Object.keys(sdk));
} catch (e) {
  console.log('❌ SDK falhou:', e.message);
}
"
\`\`\`

## 🔄 **Reset Completo**

Se nada funcionar:

\`\`\`bash
# 1. Limpar tudo
rm -rf node_modules package-lock.json .next

# 2. Reinstalar do zero
npm install

# 3. Instalar WorldChain
npm run install-worldchain

# 4. Testar
npm run test-deps

# 5. Iniciar
npm run dev
\`\`\`

## 📞 **Suporte**

Se os problemas persistirem:
1. Verifique os logs completos
2. Documente o erro exato
3. Inclua versão do Node.js: `node --version`
4. Inclua versão do NPM: `npm --version`
