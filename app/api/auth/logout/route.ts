import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("🚪 TPulseFi Logout Request")

  // Remove cookies de sessão
  cookies().delete("tpulsefi_session")
  cookies().delete("siwe")

  // Adicionar esta linha para garantir que o localStorage também seja limpo no lado do cliente
  cookies().set("clear_local_storage", "true", {
    maxAge: 1, // Curta duração, apenas para sinalizar ao cliente
    path: "/",
  })

  console.log("✅ TPulseFi Logout Successful")

  return NextResponse.json({ message: "Logged out from TPulseFi" }, { status: 200 })
}
