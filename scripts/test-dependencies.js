#!/usr/bin/env node

console.log("🧪 Testando dependências do WorldChain SDK...\n")

const dependencies = ["@holdstation/worldchain-sdk", "@holdstation/worldchain-ethers-v6", "ethers", "bignumber.js"]

let allGood = true

for (const dep of dependencies) {
  try {
    const module = require(dep)
    console.log(`✅ ${dep}: OK`)

    // Mostrar algumas informações sobre o módulo
    if (dep === "ethers") {
      console.log(`   📦 Versão: ${module.version || "N/A"}`)
    } else if (dep === "@holdstation/worldchain-sdk") {
      const keys = Object.keys(module).slice(0, 5)
      console.log(`   🔑 Exports: ${keys.join(", ")}${keys.length >= 5 ? "..." : ""}`)
    } else if (dep === "bignumber.js") {
      const bn = new module("123.456")
      console.log(`   🔢 Teste: ${bn.toString()}`)
    }
  } catch (error) {
    console.log(`❌ ${dep}: FALHOU`)
    console.log(`   💥 Erro: ${error.message}`)
    allGood = false
  }
}

console.log("\n" + "=".repeat(50))

if (allGood) {
  console.log("🎉 Todas as dependências estão funcionando!")
  console.log("✅ Você pode executar: npm run dev")
} else {
  console.log("⚠️  Algumas dependências falharam.")
  console.log("🔧 Execute: npm run quick-fix")
}

console.log("=".repeat(50))

// Teste específico do WorldChain SDK
console.log("\n🌐 Testando WorldChain SDK específico...")

try {
  const worldchainSDK = require("@holdstation/worldchain-sdk")
  const ethers = require("@holdstation/worldchain-ethers-v6")

  console.log("✅ WorldChain SDK carregado com sucesso!")
  console.log(`📦 SDK exports: ${Object.keys(worldchainSDK).length} itens`)
  console.log(`⚡ Ethers exports: ${Object.keys(ethers).length} itens`)

  // Tentar criar instâncias básicas
  if (worldchainSDK.TokenProvider) {
    console.log("✅ TokenProvider disponível")
  }
  if (worldchainSDK.SwapHelper) {
    console.log("✅ SwapHelper disponível")
  }
  if (worldchainSDK.Sender) {
    console.log("✅ Sender disponível")
  }
} catch (error) {
  console.log("❌ Erro ao testar WorldChain SDK:")
  console.log(`   💥 ${error.message}`)
}

console.log("\n🚀 Teste concluído!")
