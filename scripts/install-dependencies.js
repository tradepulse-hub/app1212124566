import { execSync } from "child_process"

console.log("🚀 Instalando dependências do TPulseFi Wallet...")

try {
  // Limpa cache do npm
  console.log("🧹 Limpando cache...")
  execSync("npm cache clean --force", { stdio: "inherit" })

  // Remove node_modules e package-lock.json se existirem
  console.log("🗑️ Removendo instalações antigas...")
  try {
    execSync("rm -rf node_modules package-lock.json", { stdio: "inherit" })
  } catch (e) {
    console.log("ℹ️ Nenhuma instalação anterior encontrada")
  }

  // Instala dependências principais
  console.log("📦 Instalando dependências principais...")
  execSync("npm install ethers@5.7.2", { stdio: "inherit" })
  execSync("npm install bignumber.js@9.1.2", { stdio: "inherit" })

  // Instala o WorldChain SDK
  console.log("🌐 Instalando WorldChain SDK...")
  execSync("npm install @holdstation/worldchain-sdk", { stdio: "inherit" })

  // Instala dependências de desenvolvimento
  console.log("🛠️ Instalando dependências de desenvolvimento...")
  execSync("npm install --save-dev @types/node", { stdio: "inherit" })

  console.log("✅ Todas as dependências foram instaladas com sucesso!")
  console.log("🎉 TPulseFi Wallet está pronto para uso!")
} catch (error) {
  console.error("❌ Erro durante a instalação:", error.message)
  console.log("\n🔧 Tentando instalação alternativa...")

  try {
    // Instalação alternativa com --legacy-peer-deps
    execSync("npm install --legacy-peer-deps", { stdio: "inherit" })
    console.log("✅ Instalação alternativa bem-sucedida!")
  } catch (altError) {
    console.error("❌ Instalação alternativa falhou:", altError.message)
    console.log("\n💡 Tente executar manualmente:")
    console.log("npm cache clean --force")
    console.log("npm install --legacy-peer-deps")
  }
}
