/**
 * WorldChain SDK com HIJACK CORRIGIDO
 */

// 🔥 CARREGA O HIJACK CORRIGIDO PRIMEIRO
import "./v0-module-hijack-fixed"

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDKV0HijackFixed() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🚀 Carregando WorldChain SDK com HIJACK CORRIGIDO...")

    // Aguarda para garantir que o hijack foi aplicado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Testa BigNumber com proteção
    console.log("🧪 Teste BigNumber CORRIGIDO...")
    try {
      const bn = new BigNumberOriginal("999.888")
      console.log("✅ BigNumber CORRIGIDO test:", bn.toString())

      // Testa global com proteção
      const globalBN = (globalThis as any).BigNumber
      if (globalBN && typeof globalBN === "function") {
        const bn2 = new globalBN("777.666")
        console.log("✅ Global BigNumber CORRIGIDO:", bn2.toString())
      }
    } catch (bnError) {
      console.error("❌ BigNumber CORRIGIDO test falhou:", bnError)
      // Não retorna erro, continua tentando
    }

    console.log("🔄 Tentando carregar SDK com HIJACK CORRIGIDO...")

    // Tenta carregar o SDK com múltiplas tentativas
    let sdk: any = null
    let attempts = 0
    const maxAttempts = 3

    while (!sdk && attempts < maxAttempts) {
      attempts++
      console.log(`📞 Tentativa ${attempts}/${maxAttempts} de carregar SDK...`)

      try {
        sdk = await import("@holdstation/worldchain-sdk")
        console.log("✅ SDK carregado na tentativa", attempts)
        break
      } catch (sdkError) {
        console.warn(`⚠️ Tentativa ${attempts} falhou:`, (sdkError as Error).message)
        if (attempts < maxAttempts) {
          console.log("🔄 Aguardando antes da próxima tentativa...")
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    if (!sdk) {
      throw new Error("Falha ao carregar SDK após múltiplas tentativas")
    }

    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (TokenProvider && typeof TokenProvider === "function") {
      sdkLoaded = true
      console.log("🎉 WorldChain SDK carregado com HIJACK CORRIGIDO!")
      console.log("✅ TokenProvider disponível:", typeof TokenProvider)

      // 🔥 CONFIGURA PARTNER CODE GLOBALMENTE
      try {
        console.log("🏷️ Configurando partner code global CORRIGIDO...")

        // Múltiplas tentativas de configurar partner code
        let partnerCodeSet = false

        // Tentativa 1: Via SDK principal
        if (sdk.setPartnerCode && typeof sdk.setPartnerCode === "function") {
          try {
            const result = sdk.setPartnerCode("tpulsefi")
            console.log("✅ Partner code definido via SDK.setPartnerCode():", result)
            partnerCodeSet = true
          } catch (partnerError) {
            console.warn("⚠️ Erro no SDK.setPartnerCode:", partnerError)
          }
        }

        // Tentativa 2: Via módulo partner
        if (!partnerCodeSet) {
          try {
            const partnerModule = await import("@holdstation/worldchain-sdk/dist/partner")
            if (partnerModule.setPartnerCode && typeof partnerModule.setPartnerCode === "function") {
              const result = partnerModule.setPartnerCode("tpulsefi")
              console.log("✅ Partner code definido via partner module:", result)
              partnerCodeSet = true
            }
          } catch (partnerError) {
            console.log("ℹ️ Partner module não disponível:", partnerError)
          }
        }

        // Tentativa 3: Via importação direta
        if (!partnerCodeSet) {
          try {
            const { setPartnerCode } = await import("@holdstation/worldchain-sdk")
            if (setPartnerCode && typeof setPartnerCode === "function") {
              const result = setPartnerCode("tpulsefi")
              console.log("✅ Partner code definido via import direto:", result)
              partnerCodeSet = true
            }
          } catch (directError) {
            console.log("ℹ️ Import direto falhou:", directError)
          }
        }

        // Verifica se foi definido
        try {
          if (sdk.getPartnerCode && typeof sdk.getPartnerCode === "function") {
            const currentCode = sdk.getPartnerCode()
            console.log("📋 Partner code verificado:", currentCode)
          }
        } catch (verifyError) {
          console.warn("⚠️ Erro ao verificar partner code:", verifyError)
        }

        console.log("📋 Partner code configurado:", partnerCodeSet ? "✅ Sucesso" : "⚠️ Falhou")
      } catch (partnerError) {
        console.warn("⚠️ Erro geral ao configurar partner code:", partnerError)
      }

      return { TokenProvider, sdkLoaded: true }
    } else {
      throw new Error("TokenProvider não encontrado ou não é uma função")
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK HIJACK CORRIGIDO:", error)
    console.error("📋 Stack:", (error as Error).stack)

    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Importa BigNumber para ter acesso direto
import BigNumberOriginal from "bignumber.js"

// Função para testar BigNumber corrigido
export function testBigNumberHijackFixed() {
  try {
    console.log("🧪 Testando BigNumber HIJACK CORRIGIDO...")

    // Teste 1: Import direto com proteção
    try {
      const bn1 = new BigNumberOriginal("123.456")
      console.log("✅ Import direto CORRIGIDO:", bn1.toString())
    } catch (directError) {
      console.error("❌ Import direto falhou:", directError)
      return false
    }

    // Teste 2: Global com proteção
    try {
      const globalBN = (globalThis as any).BigNumber
      if (globalBN && typeof globalBN === "function") {
        const bn2 = new globalBN("789.123")
        console.log("✅ Global BigNumber CORRIGIDO:", bn2.toString())
      } else {
        console.warn("⚠️ Global BigNumber não disponível")
      }
    } catch (globalError) {
      console.error("❌ Global BigNumber falhou:", globalError)
    }

    // Teste 3: Cache check com proteção
    try {
      const moduleCache = (globalThis as any).__BIGNUMBER_MODULE__
      if (moduleCache && moduleCache.BigNumber) {
        console.log("✅ Module cache CORRIGIDO:", typeof moduleCache.BigNumber)
      } else {
        console.warn("⚠️ Module cache não disponível")
      }
    } catch (cacheError) {
      console.error("❌ Module cache falhou:", cacheError)
    }

    console.log("🎉 Teste BigNumber HIJACK CORRIGIDO concluído!")
    return true
  } catch (error) {
    console.error("❌ Teste BigNumber HIJACK CORRIGIDO falhou:", error)
    return false
  }
}
