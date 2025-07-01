#!/bin/bash

echo "🔧 Executando correção rápida do projeto..."

# Limpar cache e arquivos temporários
echo "🧹 Limpando cache..."
rm -rf node_modules/.cache
rm -rf .next
npm cache clean --force

# Verificar e corrigir permissões
echo "🔐 Verificando permissões..."
chmod -R 755 scripts/

# Reinstalar dependências problemáticas
echo "📦 Reinstalando dependências críticas..."
npm uninstall @holdstation/worldchain-sdk @holdstation/worldchain-ethers-v6
npm install @holdstation/worldchain-sdk@latest @holdstation/worldchain-ethers-v6@latest

# Verificar se ethers está na versão correta
echo "⚡ Verificando ethers..."
npm list ethers

# Corrigir vulnerabilidades automáticas
echo "🛡️ Corrigindo vulnerabilidades..."
npm audit fix --force

# Testar instalação
echo "🧪 Testando instalação..."
node -e "
try {
  const sdk = require('@holdstation/worldchain-sdk');
  const ethers = require('ethers');
  console.log('✅ Teste básico: OK');
  console.log('📦 SDK keys:', Object.keys(sdk).slice(0, 3));
  console.log('⚡ Ethers version:', ethers.version);
} catch (e) {
  console.log('❌ Teste falhou:', e.message);
}
"

echo "✅ Correção concluída!"
echo "🚀 Execute: npm run dev"
