#!/bin/bash

echo "🔧 Executando correção rápida do projeto..."
echo "================================================"

# Limpar cache e dependências
echo "🧹 Limpando cache e dependências..."
rm -rf node_modules package-lock.json .next
npm cache clean --force

echo "📦 Reinstalando dependências básicas..."
npm install --no-optional --no-fund --no-audit

echo "🌐 Instalando dependências WorldChain..."
npm install @holdstation/worldchain-sdk @holdstation/worldchain-ethers-v6 ethers bignumber.js

echo "🧪 Testando instalação..."
node -e "
try {
  const sdk = require('@holdstation/worldchain-sdk');
  const ethers = require('ethers');
  const BigNumber = require('bignumber.js');
  console.log('✅ Todas as dependências OK!');
} catch (error) {
  console.log('❌ Ainda há problemas:', error.message);
}
"

echo "================================================"
echo "✅ Correção concluída!"
echo "🚀 Execute: npm run dev"
