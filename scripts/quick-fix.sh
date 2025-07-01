#!/bin/bash

echo "🔧 Correção Rápida - Instalação Limpa"
echo "====================================="

# Limpar completamente
echo "🧹 Limpando tudo..."
rm -rf node_modules package-lock.json .next
npm cache clean --force

# Instalar apenas dependências básicas primeiro
echo "📦 Instalando dependências básicas..."
npm install --legacy-peer-deps --no-audit --no-fund --no-optional

if [ $? -ne 0 ]; then
    echo "❌ Falha na instalação básica. Tentando com --force..."
    npm install --force --legacy-peer-deps --no-audit --no-fund --no-optional
fi

# Verificar se funcionou
if [ -d "node_modules" ]; then
    echo "✅ Dependências básicas instaladas"
    
    echo ""
    echo "🌐 Agora execute manualmente:"
    echo "npm install ethers@6.8.0 --save-exact --legacy-peer-deps"
    echo "npm install bignumber.js --legacy-peer-deps"
    echo "npm install @holdstation/worldchain-sdk --legacy-peer-deps"
    echo "npm install @holdstation/worldchain-ethers-v6 --legacy-peer-deps"
    echo ""
    echo "Ou execute: npm run manual-install"
else
    echo "❌ Falha na instalação básica"
    echo "💡 Tente: npm run manual-install"
fi

echo "====================================="
