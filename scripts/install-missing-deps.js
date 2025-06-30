import { execSync } from "child_process"

console.log("🔧 Instalando dependências faltantes...")

const missingDeps = ["async-mutex", "axios", "ws", "isomorphic-ws"]

try {
  console.log("📦 Instalando dependências do WorldChain SDK...")

  for (const dep of missingDeps) {
    try {
      console.log(`📥 Instalando ${dep}...`)
      execSync(`npm install ${dep} --legacy-peer-deps`, { stdio: "inherit" })
      console.log(`✅ ${dep} instalado`)
    } catch (error) {
      console.log(`⚠️ Erro ao instalar ${dep}:`, error.message)
    }
  }

  console.log("\n🧪 Testando WorldChain SDK...")
  try {
    const testResult = execSync(
      "node -e \"const sdk = require('@holdstation/worldchain-sdk'); console.log('✅ SDK funcionando:', Object.keys(sdk).slice(0,3));\"",
      { encoding: "utf8" },
    )
    console.log(testResult)
  } catch (testError) {
    console.log("⚠️ SDK ainda em modo mock:", testError.message)
  }

  console.log("\n✅ Instalação concluída!")
  console.log("💡 Para Next.js com Node 16, use: npm run dev-legacy")
} catch (error) {
  console.error("❌ Erro geral:", error.message)
}
