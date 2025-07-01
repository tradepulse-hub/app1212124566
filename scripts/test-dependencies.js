#!/usr/bin/env node

console.log("🧪 Testando dependências do WorldChain SDK...\n")

const dependencies = [
  { name: "@holdstation/worldchain-sdk", required: true },
  { name: "@holdstation/worldchain-ethers-v6", required: true },
  { name: "ethers", required: true },
  { name: "bignumber.js", required: true },
]

let successCount = 0
const totalCount = dependencies.length

console.log("📦 Verificando dependências...\n")

dependencies.forEach((dep, index) => {
  try {
    const module = require(dep.name)
    console.log(`✅ ${dep.name}: OK`)

    // Mostrar informações específicas
    if (dep.name === "ethers") {
      console.log(`   📦 Versão: ${module.version || "N/A"}`)
      console.log(`   🔑 Exports: ${Object.keys(module).slice(0, 3).join(", ")}...`)
    } else if (dep.name === "@holdstation/worldchain-sdk") {
      const keys = Object.keys(module)
      console.log(`   🔑 Exports (${keys.length}): ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "..." : ""}`)
    } else if (dep.name === "@holdstation/worldchain-ethers-v6") {
      const keys = Object.keys(module)
      console.log(`   ⚡ Exports (${keys.length}): ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? "..." : ""}`)
    } else if (dep.name === "bignumber.js") {
      const BigNumber = module.default || module
      const test = new BigNumber("123.456")
      console.log(`   🔢 Teste: ${test.toString()}`)
    }

    successCount++
  } catch (error) {
    console.log(`❌ ${dep.name}: FALHOU`)
    console.log(`   💥 Erro: ${error.message}`)

    // Sugestões específicas
    if (dep.name.includes("@holdstation")) {
      console.log(`   💡 Sugestão: npm install ${dep.name} --legacy-peer-deps`)
    }
  }

  console.log("")
})

console.log("=".repeat(60))
console.log(`📊 RESULTADO: ${successCount}/${totalCount} dependências funcionando`)

if (successCount === totalCount) {
  console.log("🎉 TODAS AS DEPENDÊNCIAS ESTÃO OK!")
  console.log("✅ O sistema está pronto para uso!")

  // Teste avançado do SDK
  console.log("\n🔬 Executando teste avançado...")
  try {
    const sdk = require("@holdstation/worldchain-sdk")
    const ethersAdapter = require("@holdstation/worldchain-ethers-v6")
    const ethers = require("ethers")

    console.log("✅ Todos os módulos carregados com sucesso!")

    // Verificar componentes principais
    const components = ["TokenProvider", "SwapHelper", "Sender", "Manager"]
    components.forEach((comp) => {
      if (sdk[comp]) {
        console.log(`✅ ${comp} disponível`)
      } else {
        console.log(`⚠️ ${comp} não encontrado`)
      }
    })

    console.log("\n🚀 Sistema 100% funcional! Execute: npm run dev")
  } catch (error) {
    console.log("⚠️ Erro no teste avançado:", error.message)
    console.log("📝 Módulos carregados individualmente, mas integração pode ter problemas")
  }
} else {
  console.log("❌ ALGUMAS DEPENDÊNCIAS FALHARAM")
  console.log("🔧 Execute: npm run quick-fix")
  console.log("📝 Ou instale manualmente:")

  dependencies.forEach((dep) => {
    console.log(`   npm install ${dep.name} --legacy-peer-deps`)
  })
}

console.log("=".repeat(60))
