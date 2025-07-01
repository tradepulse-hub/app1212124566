#!/usr/bin/env node

console.log("🧪 Testando Dependências TPulseFi Wallet\n")

const dependencies = [
  { name: "next", required: true, category: "Framework" },
  { name: "react", required: true, category: "Framework" },
  { name: "react-dom", required: true, category: "Framework" },
  { name: "ethers", required: false, category: "Blockchain" },
  { name: "bignumber.js", required: false, category: "Blockchain" },
  { name: "@holdstation/worldchain-sdk", required: false, category: "WorldChain" },
  { name: "@holdstation/worldchain-ethers-v6", required: false, category: "WorldChain" },
]

const results = {
  framework: { success: 0, total: 0 },
  blockchain: { success: 0, total: 0 },
  worldchain: { success: 0, total: 0 },
  overall: { success: 0, total: dependencies.length },
}

console.log("📦 Verificando dependências por categoria...\n")

dependencies.forEach((dep) => {
  const category = dep.category.toLowerCase()
  results[category].total++
  results.overall.total = dependencies.length

  try {
    const module = require(dep.name)
    console.log(`✅ ${dep.name} (${dep.category})`)

    // Informações específicas
    if (dep.name === "ethers") {
      console.log(`   📦 Versão: ${module.version || "N/A"}`)
    } else if (dep.name === "bignumber.js") {
      const BigNumber = module.default || module
      const test = new BigNumber("123.456")
      console.log(`   🔢 Teste: ${test.toString()}`)
    } else if (dep.name.includes("@holdstation")) {
      const keys = Object.keys(module)
      console.log(`   🔑 Exports: ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? "..." : ""} (${keys.length} total)`)
    } else if (dep.name === "next") {
      console.log(`   🚀 Framework: Next.js`)
    }

    results[category].success++
    results.overall.success++
  } catch (error) {
    const status = dep.required ? "❌" : "⚠️"
    const type = dep.required ? "OBRIGATÓRIO" : "OPCIONAL"
    console.log(`${status} ${dep.name} (${dep.category}) - ${type}`)
    console.log(`   💥 ${error.message}`)
  }

  console.log("")
})

// Resumo por categoria
console.log("=" * 60)
console.log("📊 RESUMO POR CATEGORIA:")
console.log("")

Object.keys(results).forEach((category) => {
  if (category === "overall") return

  const cat = results[category]
  const percentage = cat.total > 0 ? Math.round((cat.success / cat.total) * 100) : 0
  const status = cat.success === cat.total ? "✅" : cat.success > 0 ? "⚠️" : "❌"

  console.log(`${status} ${category.toUpperCase()}: ${cat.success}/${cat.total} (${percentage}%)`)
})

console.log("")
console.log(`🎯 GERAL: ${results.overall.success}/${results.overall.total} dependências`)

// Determinar status do sistema
const frameworkOK = results.framework.success === results.framework.total
const blockchainOK = results.blockchain.success > 0
const worldchainOK = results.worldchain.success === results.worldchain.total

console.log("")
console.log("🔍 STATUS DO SISTEMA:")

if (frameworkOK) {
  console.log("✅ Framework: Pronto para desenvolvimento básico")
} else {
  console.log("❌ Framework: Problemas críticos detectados")
}

if (blockchainOK) {
  console.log("✅ Blockchain: Funcionalidades básicas disponíveis")
} else {
  console.log("⚠️ Blockchain: Funcionalidades limitadas")
}

if (worldchainOK && results.worldchain.total > 0) {
  console.log("✅ WorldChain: SDK completo disponível")
} else if (results.worldchain.success > 0) {
  console.log("⚠️ WorldChain: SDK parcialmente disponível")
} else {
  console.log("❌ WorldChain: SDK não disponível")
}

console.log("")

// Recomendações
if (frameworkOK && blockchainOK && worldchainOK) {
  console.log("🎉 SISTEMA COMPLETO!")
  console.log("🚀 Execute: npm run dev")
  console.log("🌐 Acesse: http://localhost:3000")
} else if (frameworkOK) {
  console.log("⚡ SISTEMA BÁSICO FUNCIONAL")
  console.log("🚀 Execute: npm run dev (funcionalidades limitadas)")
  console.log("")
  console.log("🔧 Para funcionalidades completas:")
  console.log("   npm run manual-install")
} else {
  console.log("❌ SISTEMA NÃO FUNCIONAL")
  console.log("🔧 Execute: npm run manual-install")
}

console.log("=" * 60)
