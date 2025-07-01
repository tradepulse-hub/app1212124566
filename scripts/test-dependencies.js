#!/usr/bin/env node

console.log("🧪 Testando dependências do WorldChain SDK...\n")

const dependencies = ["@holdstation/worldchain-sdk", "@holdstation/worldchain-ethers-v6", "ethers", "bignumber.js"]

let allWorking = true

for (const dep of dependencies) {
  try {
    const module = require(dep)
    console.log(`✅ ${dep}: OK`)

    // Testes específicos
    if (dep === "@holdstation/worldchain-sdk") {
      const keys = Object.keys(module)
      console.log(`   📦 Exports: ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "..." : ""}`)
    }

    if (dep === "ethers") {
      console.log(`   ⚡ Version: ${module.version || "unknown"}`)
    }

    if (dep === "bignumber.js") {
      const BigNumber = module.default || module
      const test = new BigNumber("123.456")
      console.log(`   🔢 Test: ${test.toString()}`)
    }
  } catch (error) {
    console.log(`❌ ${dep}: FALHOU`)
    console.log(`   💥 Erro: ${error.message}`)
    allWorking = false
  }
}

console.log("\n" + "=".repeat(50))

if (allWorking) {
  console.log("🎉 TODAS AS DEPENDÊNCIAS FUNCIONANDO!")
  console.log("✅ O SDK real do WorldChain está pronto para uso!")

  // Teste avançado do SDK
  try {
    const sdk = require("@holdstation/worldchain-sdk")
    console.log("\n🔬 Teste avançado do SDK:")

    if (sdk.TokenProvider) {
      console.log("✅ TokenProvider disponível")
    }
    if (sdk.SwapHelper) {
      console.log("✅ SwapHelper disponível")
    }
    if (sdk.Sender) {
      console.log("✅ Sender disponível")
    }
    if (sdk.Manager) {
      console.log("✅ Manager disponível")
    }
  } catch (error) {
    console.log("⚠️ SDK carregado mas com limitações:", error.message)
  }
} else {
  console.log("❌ ALGUMAS DEPENDÊNCIAS FALHARAM")
  console.log("🔧 Execute: npm run quick-fix")
}

console.log("=".repeat(50))
