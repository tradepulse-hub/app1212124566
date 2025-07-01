#!/usr/bin/env node

const { execSync, spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 TPulseFi Wallet Setup Starting...\n")

// Função para executar comandos com timeout
function runCommand(command, options = {}) {
  const timeout = options.timeout || 300000 // 5 minutos
  console.log(`⚡ Executando: ${command}`)

  try {
    const result = execSync(command, {
      stdio: "inherit",
      timeout: timeout,
      ...options,
    })
    return true
  } catch (error) {
    console.error(`❌ Erro executando: ${command}`)
    console.error(`   ${error.message}`)
    return false
  }
}

// Função para verificar se um pacote existe
function packageExists(packageName) {
  try {
    require.resolve(packageName)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log("📋 Verificando ambiente...")

  // Verificar Node.js
  const nodeVersion = process.version
  console.log(`   Node.js: ${nodeVersion}`)

  // Verificar NPM
  try {
    const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim()
    console.log(`   NPM: ${npmVersion}`)
  } catch (error) {
    console.error("❌ NPM não encontrado")
    process.exit(1)
  }

  console.log("\n🧹 Limpando instalação anterior...")

  // Limpar cache do npm
  runCommand("npm cache clean --force")

  // Remover node_modules se existir
  if (fs.existsSync("node_modules")) {
    console.log("   Removendo node_modules...")
    fs.rmSync("node_modules", { recursive: true, force: true })
  }

  // Remover package-lock.json se existir
  if (fs.existsSync("package-lock.json")) {
    console.log("   Removendo package-lock.json...")
    fs.unlinkSync("package-lock.json")
  }

  console.log("\n📦 Instalando dependências básicas...")

  // Instalar dependências básicas primeiro
  const basicInstall = runCommand("npm install --no-optional --no-fund --no-audit", {
    timeout: 600000, // 10 minutos
  })

  if (!basicInstall) {
    console.error("❌ Falha na instalação básica")
    console.log("\n🔧 Tentativas de correção:")
    console.log("1. Verifique sua conexão com a internet")
    console.log("2. Execute: npm cache clean --force")
    console.log("3. Execute: rm -rf node_modules package-lock.json")
    console.log("4. Execute: npm install")
    process.exit(1)
  }

  console.log("\n🌐 Tentando instalar WorldChain SDK...")

  // Tentar instalar dependências WorldChain (opcional)
  const worldchainPackages = [
    "@holdstation/worldchain-sdk",
    "@holdstation/worldchain-ethers-v6",
    "ethers",
    "bignumber.js",
  ]

  let worldchainSuccess = 0

  for (const pkg of worldchainPackages) {
    console.log(`   Instalando ${pkg}...`)
    const success = runCommand(`npm install ${pkg} --save --no-fund --no-audit`, {
      timeout: 120000, // 2 minutos por pacote
    })

    if (success) {
      worldchainSuccess++
      console.log(`   ✅ ${pkg} instalado`)
    } else {
      console.log(`   ⚠️ ${pkg} falhou (continuando...)`)
    }
  }

  console.log("\n🧪 Verificando instalação...")

  // Verificar dependências básicas
  const basicDeps = ["next", "react", "react-dom"]
  let basicOk = 0

  for (const dep of basicDeps) {
    if (packageExists(dep)) {
      console.log(`   ✅ ${dep}`)
      basicOk++
    } else {
      console.log(`   ❌ ${dep}`)
    }
  }

  // Verificar dependências WorldChain
  let worldchainOk = 0
  for (const pkg of worldchainPackages) {
    if (packageExists(pkg)) {
      console.log(`   ✅ ${pkg}`)
      worldchainOk++
    } else {
      console.log(`   ⚠️ ${pkg} (modo simulação)`)
    }
  }

  console.log("\n📊 Resumo da Instalação:")
  console.log(`   Dependências básicas: ${basicOk}/${basicDeps.length}`)
  console.log(`   WorldChain SDK: ${worldchainOk}/${worldchainPackages.length}`)

  if (basicOk === basicDeps.length) {
    console.log("\n🎉 Setup básico completo!")
    console.log("   Execute: npm run dev")

    if (worldchainOk > 0) {
      console.log(`   WorldChain: ${worldchainOk} pacotes instalados`)
    } else {
      console.log("   WorldChain: Modo simulação (funcionalidades limitadas)")
    }
  } else {
    console.log("\n❌ Setup incompleto")
    console.log("   Algumas dependências básicas falharam")
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("\n💥 Erro no setup:", error.message)
  process.exit(1)
})
