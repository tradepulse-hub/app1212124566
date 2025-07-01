import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { type MiniAppWalletAuthSuccessPayload, verifySiweMessage } from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export const POST = async (req: NextRequest) => {
  console.log("🔐 TPulseFi SIWE Verification")

  const { payload, nonce }: IRequestPayload = await req.json()

  const siweCookie = cookies().get("siwe")?.value

  if (nonce !== siweCookie) {
    console.log("❌ Invalid nonce for TPulseFi")
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid nonce",
    })
  }

  try {
    console.log("🔍 Verifying SIWE message for TPulseFi...")
    const validMessage = await verifySiweMessage(payload, nonce)

    console.log("✅ SIWE verification result:", validMessage.isValid)

    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    })
  } catch (error) {
    const err = error as Error
    console.error("❌ SIWE verification error:", err.message)
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: err.message,
    })
  }
}
