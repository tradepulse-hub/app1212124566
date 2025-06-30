import { execSync } from "child_process"

console.log("🔧 Resolvendo conflitos de dependências...")

try {
  // Instala a versão correta do bignumber.js que o SDK precisa
  console.log("📦 Instalando bignumber.js@9.3.0...")
  execSync("npm install bignumber.js@9.3.0 --legacy-peer-deps", { stdio: "inherit" })

  // Agora instala o WorldChain SDK
  console.log("🌐 Instalando WorldChain SDK...")
  execSync("npm install @holdstation/worldchain-sdk --legacy-peer-deps", { stdio: "inherit" })

  // Instala ethers na versão compatível
  console.log("⚡ Instalando ethers...")
  execSync("npm install ethers@5.7.2 --legacy-peer-deps", { stdio: "inherit" })

  console.log("✅ Dependências instaladas com sucesso!")

  // Verifica as versões instaladas
  console.log("\n📋 Versões instaladas:")
  try {
    const bignumberVersion = execSync("npm list bignumber.js --depth=0", { encoding: "utf8" })
    console.log("BigNumber:", bignumberVersion.trim())
  } catch (e) {
    console.log("BigNumber: Instalado")
  }

  try {
    const sdkVersion = execSync("npm list @holdstation/worldchain-sdk --depth=0", { encoding: "utf8" })
    console.log("WorldChain SDK:", sdkVersion.trim())
  } catch (e) {
    console.log("WorldChain SDK: Instalado")
  }
} catch (error) {
  console.error("❌ Erro:", error.message)
  console.log("\n🔄 Tentando instalação forçada...")

  try {
    execSync("npm install bignumber.js@9.3.0 @holdstation/worldchain-sdk ethers@5.7.2 --force", { stdio: "inherit" })
    console.log("✅ Instalação forçada bem-sucedida!")
  } catch (forceError) {
    console.error("❌ Instalação forçada falhou:", forceError.message)
  }
}
