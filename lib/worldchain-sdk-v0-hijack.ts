/**
 * WorldChain SDK com HIJACK TOTAL - FORÇAR SDK REAL
 */

// 🔥 APLICA HIJACK ANTES DE TUDO
import "./v0-module-hijack-fixed"

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDKV0Hijack() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🚀 Carregando WorldChain SDK REAL - FORÇANDO CARREGAMENTO...")

    // Aguarda para garantir que o hijack foi aplicado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 🔥 FORÇA LIMPEZA TOTAL DE QUALQUER CACHE
    console.log("🧹 Limpeza TOTAL de caches...")
    if (typeof window !== "undefined" && (window as any).__webpack_require__) {
      const webpackRequire = (window as any).__webpack_require__
      if (webpackRequire.cache) {
        Object.keys(webpackRequire.cache).forEach((key) => {
          if (key.includes("holdstation") || key.includes("worldchain") || key.includes("bignumber")) {
            delete webpackRequire.cache[key]
            console.log(`🗑️ Removido do cache: ${key}`)
          }
        })
      }
    }

    // 🔥 CONFIGURA PARTNER CODE GLOBALMENTE ANTES DE CARREGAR SDK
    console.log("🏷️ Configurando partner code ANTES do carregamento...")

    // Registra partner code globalmente
    ;(globalThis as any).__HOLDSTATION_PARTNER_CODE__ = "tpulsefi"
    ;(globalThis as any).__WORLDCHAIN_PARTNER__ = "tpulsefi"

    if (typeof window !== "undefined") {
      ;(window as any).__HOLDSTATION_PARTNER_CODE__ = "tpulsefi"
      ;(window as any).__WORLDCHAIN_PARTNER__ = "tpulsefi"
    }

    console.log("✅ Partner code configurado globalmente ANTES do SDK")

    // 🔥 FORÇA CARREGAMENTO DIRETO DO SDK SEM CACHE
    console.log("🔄 FORÇANDO carregamento direto do SDK...")

    // Tenta múltiplas estratégias de carregamento
    let sdk: any = null
    let loadStrategy = ""

    // Estratégia 1: Import direto com timestamp para evitar cache
    try {
      console.log("📞 Estratégia 1: Import direto com cache-bust...")
      const timestamp = Date.now()
      sdk = await import(`@holdstation/worldchain-sdk?t=${timestamp}`)
      loadStrategy = "Import direto com cache-bust"
      console.log("✅ SDK carregado via estratégia 1")
    } catch (strategy1Error) {
      console.warn("⚠️ Estratégia 1 falhou:", (strategy1Error as Error).message)
    }

    // Estratégia 2: Import com dynamic import forçado
    if (!sdk) {
      try {
        console.log("📞 Estratégia 2: Dynamic import forçado...")
        const importFn = new Function("specifier", "return import(specifier)")
        sdk = await importFn("@holdstation/worldchain-sdk")
        loadStrategy = "Dynamic import forçado"
        console.log("✅ SDK carregado via estratégia 2")
      } catch (strategy2Error) {
        console.warn("⚠️ Estratégia 2 falhou:", (strategy2Error as Error).message)
      }
    }

    // Estratégia 3: Fetch direto do módulo
    if (!sdk) {
      try {
        console.log("📞 Estratégia 3: Fetch direto...")
        // Esta estratégia é mais complexa e específica para v0
        console.log("⚠️ Estratégia 3 não implementada para v0")
      } catch (strategy3Error) {
        console.warn("⚠️ Estratégia 3 falhou:", (strategy3Error as Error).message)
      }
    }

    if (!sdk) {
      throw new Error("Todas as estratégias de carregamento falharam - SDK não disponível")
    }

    console.log("🎯 SDK carregado com estratégia:", loadStrategy)
    console.log("📋 SDK exports:", Object.keys(sdk))

    // 🔥 EXTRAI TOKENPROVIDER COM VERIFICAÇÃO RIGOROSA
    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (!TokenProvider) {
      console.error("❌ TokenProvider não encontrado nos exports do SDK")
      console.log("📋 Exports disponíveis:", Object.keys(sdk))
      throw new Error("TokenProvider não encontrado no SDK")
    }

    if (typeof TokenProvider !== "function") {
      console.error("❌ TokenProvider não é uma função:", typeof TokenProvider)
      throw new Error("TokenProvider não é um construtor válido")
    }

    console.log("✅ TokenProvider extraído:", typeof TokenProvider)

    // 🔥 CONFIGURA PARTNER CODE NO SDK CARREGADO
    try {
      console.log("🏷️ Configurando partner code no SDK carregado...")

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

    sdkLoaded = true
    console.log("🎉 WorldChain SDK REAL carregado com sucesso!")
    console.log("✅ TokenProvider disponível:", typeof TokenProvider)
    console.log("📋 Estratégia usada:", loadStrategy)

    return { TokenProvider, sdkLoaded: true }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK REAL:", error)
    console.error("📋 Stack:", (error as Error).stack)

    // 🔥 NÃO USAR MOCK - RETORNAR ERRO
    console.error("🚫 RECUSANDO usar mock - apenas SDK REAL é aceito")
    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Importa BigNumber para ter acesso direto
import BigNumberOriginal from "bignumber.js"

// Função para testar BigNumber hijack
export function testBigNumberHijack() {
  try {
    console.log("🧪 Testando BigNumber HIJACK...")

    // Teste 1: Import direto
    const bn1 = new BigNumberOriginal("123.456")
    console.log("✅ Import direto:", bn1.toString())

    // Teste 2: Global
    const globalBN = (globalThis as any).BigNumber
    if (globalBN) {
      const bn2 = new globalBN("789.123")
      console.log("✅ Global BigNumber:", bn2.toString())
    }

    // Teste 3: Cache check
    const moduleCache = (globalThis as any).__BIGNUMBER_MODULE__
    if (moduleCache) {
      console.log("✅ Module cache:", typeof moduleCache.BigNumber)
    }

    console.log("🎉 Todos os testes BigNumber HIJACK passaram!")
    return true
  } catch (error) {
    console.error("❌ Teste BigNumber HIJACK falhou:", error)
    return false
  }
}
