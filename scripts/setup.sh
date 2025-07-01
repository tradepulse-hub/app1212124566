#!/bin/bash

echo "🚀 Configurando TPulseFi Wallet..."

# Instalar dependências básicas
echo "📦 Instalando dependências básicas..."
npm install

# Instalar dependências WorldChain
echo "🌐 Instalando WorldChain SDK..."
npm install @holdstation/worldchain-sdk
npm install @holdstation/worldchain-ethers-v6
npm install ethers
npm install bignumber.js

# Verificar instalação
echo "✅ Verificando instalação..."
node -e "
try {
  require('@holdstation/worldchain-sdk');
  require('@holdstation/worldchain-ethers-v6');
  require('ethers');
  require('bignumber.js');
  console.log('✅ Todas as dependências instaladas com sucesso!');
} catch (error) {
  console.log('❌ Erro:', error.message);
}
"

echo "🎉 Setup completo!"
