# 🔧 Guia de Solução de Problemas - TPulseFi Wallet

## 🚨 Problema Principal: Conflito de Dependências

### Sintomas:
- `npm error code EOVERRIDE`
- `Override for ethers@latest conflicts with direct dependency`
- Módulos não encontrados após instalação

### Solução:

#### 1. **Limpeza Completa** (Recomendado)
\`\`\`bash
# Limpar tudo
npm run clean

# Ou manualmente:
rm -rf node_modules package-lock.json .next
npm cache clean --force
\`\`\`

#### 2. **Instalação com Legacy Peer Deps**
\`\`\`bash
# Instalar com flag especial
npm install --legacy-peer-deps --no-audit --no-fund

# Instalar WorldChain separadamente
npm install @holdstation/worldchain-sdk --legacy-peer-deps
npm install @holdstation/worldchain-ethers-v6 --legacy-peer-deps
npm install ethers@^6.8.0 --legacy-peer-deps
npm install bignumber.js --legacy-peer-deps
\`\`\`

#### 3. **Correção Automática**
\`\`\`bash
npm run quick-fix
\`\`\`

## 🔍 Verificações

### Verificar se funcionou:
\`\`\`bash
npm run test-deps
\`\`\`

### Verificação manual:
\`\`\`bash
# Testar cada dependência
node -e "console.log(require('@holdstation/worldchain-sdk'))"
node -e "console.log(require('@holdstation/worldchain-ethers-v6'))"
node -e "console.log(require('ethers').version)"
node -e "console.log(new (require('bignumber.js'))('123.45').toString())"
\`\`\`

## 🛠️ Soluções Alternativas

### Se `npm install` continuar falhando:

#### Opção 1: Yarn
\`\`\`bash
# Instalar Yarn
npm install -g yarn

# Usar Yarn em vez de npm
yarn install
yarn add @holdstation/worldchain-sdk @holdstation/worldchain-ethers-v6 ethers bignumber.js
\`\`\`

#### Opção 2: Forçar instalação
\`\`\`bash
npm install --force --legacy-peer-deps --no-audit
\`\`\`

#### Opção 3: Instalar uma por vez
\`\`\`bash
npm install next react react-dom
npm install @holdstation/worldchain-sdk --legacy-peer-deps
npm install @holdstation/worldchain-ethers-v6 --legacy-peer-deps
npm install ethers@6.8.0 --save-exact
npm install bignumber.js
\`\`\`

## 🔄 Reset Completo

Se nada funcionar:

\`\`\`bash
# 1. Deletar Codespace atual no GitHub
# 2. Criar novo Codespace
# 3. Executar:
npm install --legacy-peer-deps
npm run install-worldchain
npm run test-deps
npm run dev
\`\`\`

## 📋 Comandos Úteis

\`\`\`bash
# Verificar versões
node --version
npm --version

# Listar dependências instaladas
npm list --depth=0

# Verificar conflitos
npm ls

# Auditoria de segurança
npm audit

# Limpar cache
npm cache clean --force
\`\`\`

## 🆘 Se Persistir o Problema

1. **Copie o erro completo** dos logs
2. **Verifique versão do Node.js**: `node --version` (deve ser >= 16)
3. **Tente em ambiente local** se possível
4. **Reporte o problema** com logs completos

## ✅ Verificação Final

Quando tudo estiver funcionando:

\`\`\`bash
npm run test-deps  # Deve mostrar ✅ para todas
npm run dev        # Deve iniciar sem erros
\`\`\`

Acesse: http://localhost:3000
