console.log("🧪 Testando patch do BigNumber...")

try {
  // Testa importação default
  console.log("📦 Testando import default...")
  const BigNumberDefault = require("bignumber.js")
  console.log("✅ Default import OK:", typeof BigNumberDefault)

  // Testa se consegue criar instância
  const bn1 = new BigNumberDefault("123.456")
  console.log("✅ Instância default criada:", bn1.toString())

  // Testa se o patch funciona
  console.log("🔧 Testando patch named export...")

  // Simula o que o WorldChain SDK faz
  try {
    // Isso deveria funcionar após o patch
    const { BigNumber } = require("../lib/bignumber-patch.ts")
    console.log("✅ Named export funcionando:", typeof BigNumber)

    const bn2 = new BigNumber("789.123")
    console.log("✅ Instância named export criada:", bn2.toString())

    console.log("🎉 PATCH FUNCIONANDO! WorldChain SDK deve carregar agora.")
  } catch (patchError) {
    console.error("❌ Patch falhou:", patchError.message)
  }
} catch (error) {
  console.error("❌ Erro no teste:", error.message)
}
