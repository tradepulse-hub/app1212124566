import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("🔍 TPulseFi Session Check")

    // Obter o cookie de sessão
    const sessionCookie = cookies().get("tpulsefi_session")

    if (!sessionCookie) {
      console.log("❌ No TPulseFi session cookie found")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Analisar os dados do usuário do cookie
    const user = JSON.parse(sessionCookie.value)

    // Verificar se o usuário está autenticado
    if (!user || !user.authenticated) {
      console.log("❌ TPulseFi user not authenticated")
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    console.log("✅ TPulseFi Session Valid:", user.walletAddress)

    // Retornar os dados do usuário (exceto informações sensíveis)
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        authTime: user.authTime,
        chainId: user.chainId,
        network: user.network,
        tpulseFiUser: user.tpulseFiUser,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao verificar sessão TPulseFi:", error)
    return NextResponse.json({ error: "Erro ao verificar sessão" }, { status: 500 })
  }
}
