#!/bin/bash

echo "🔧 Executando correção rápida do projeto..."
echo "================================================"

# Limpar completamente
echo "🧹 Limpando tudo..."
rm -rf node_modules package-lock.json .next
npm cache clean --force

# Instalar dependências básicas primeiro
echo "📦 Instalando dependências básicas..."
npm install --no-optional --no-fund --no-audit --legacy-peer-deps

# Verificar se as dependências básicas foram instaladas
echo "🔍 Verificando instalação básica..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules criado"
else
    echo "❌ Falha ao criar node_modules"
    exit 1
fi

# Instalar dependências WorldChain uma por uma
echo "🌐 Instalando WorldChain SDK..."
npm install @holdstation/worldchain-sdk --legacy-peer-deps --no-audit

echo "⚡ Instalando WorldChain Ethers..."
npm install @holdstation/worldchain-ethers-v6 --legacy-peer-deps --no-audit

echo "🔢 Instalando Ethers..."
npm install ethers@^6.8.0 --legacy-peer-deps --no-audit

echo "🧮 Instalando BigNumber..."
npm install bignumber.js --legacy-peer-deps --no-audit

# Testar instalação
echo "🧪 Testando instalação..."
node -e "
const modules = ['@holdstation/worldchain-sdk', '@holdstation/worldchain-ethers-v6', 'ethers', 'bignumber.js'];
let success = 0;
modules.forEach(mod => {
  try {
    require(mod);
    console.log('✅', mod, 'OK');
    success++;
  } catch (e) {
    console.log('❌', mod, 'FALHOU:', e.message);
  }
});
console.log('📊 Resultado:', success + '/' + modules.length, 'dependências funcionando');
"

echo "================================================"
echo "✅ Correção concluída!"
echo "🚀 Execute: npm run test-deps"
echo "🚀 Depois: npm run dev"
