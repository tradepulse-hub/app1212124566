#!/bin/bash

echo "🔧 Instalação Manual das Dependências WorldChain"
echo "================================================="

# Função para verificar se comando foi bem sucedido
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 - OK"
    else
        echo "❌ $1 - FALHOU"
        return 1
    fi
}

# Limpar tudo primeiro
echo "🧹 Limpando projeto..."
rm -rf node_modules package-lock.json .next
npm cache clean --force
check_success "Limpeza"

# Instalar dependências básicas do Next.js primeiro
echo ""
echo "📦 Instalando dependências básicas do Next.js..."
npm install --legacy-peer-deps --no-audit --no-fund
check_success "Dependências básicas"

# Verificar se node_modules foi criado
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules não foi criado. Abortando."
    exit 1
fi

echo ""
echo "🌐 Instalando dependências WorldChain uma por uma..."

# Instalar ethers primeiro (dependência base)
echo "⚡ Instalando ethers..."
npm install ethers@6.8.0 --save-exact --legacy-peer-deps --no-audit
check_success "ethers"

# Instalar bignumber.js
echo "🔢 Instalando bignumber.js..."
npm install bignumber.js@9.1.2 --save-exact --legacy-peer-deps --no-audit
check_success "bignumber.js"

# Instalar WorldChain SDK
echo "🌍 Instalando @holdstation/worldchain-sdk..."
npm install @holdstation/worldchain-sdk --legacy-peer-deps --no-audit
check_success "WorldChain SDK"

# Instalar WorldChain Ethers Adapter
echo "🔌 Instalando @holdstation/worldchain-ethers-v6..."
npm install @holdstation/worldchain-ethers-v6 --legacy-peer-deps --no-audit
check_success "WorldChain Ethers Adapter"

echo ""
echo "🧪 Testando instalação..."

# Teste individual de cada módulo
node -e "
const modules = [
  'ethers',
  'bignumber.js', 
  '@holdstation/worldchain-sdk',
  '@holdstation/worldchain-ethers-v6'
];

let success = 0;
let total = modules.length;

console.log('Testando módulos individualmente:');
modules.forEach(mod => {
  try {
    const m = require(mod);
    console.log('✅', mod, '- OK');
    success++;
  } catch (e) {
    console.log('❌', mod, '- FALHOU:', e.message);
  }
});

console.log('');
console.log('📊 Resultado:', success + '/' + total, 'módulos funcionando');

if (success === total) {
  console.log('🎉 TODAS AS DEPENDÊNCIAS INSTALADAS COM SUCESSO!');
  console.log('🚀 Execute: npm run dev');
} else {
  console.log('⚠️ Algumas dependências falharam.');
  console.log('💡 Tente instalar manualmente as que falharam.');
}
"

echo ""
echo "================================================="
echo "✅ Instalação manual concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. npm run test-deps  # Verificar dependências"
echo "2. npm run dev        # Iniciar desenvolvimento"
