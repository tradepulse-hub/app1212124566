import { verifyCloudProof, type IVerifyResponse, type ISuccessResult } from "@worldcoin/minikit-js"
import { type NextRequest, NextResponse } from "next/server"

interface IRequestPayload {
  payload: ISuccessResult
  action: string
  signal: string | undefined
}

export async function POST(req: NextRequest) {
  console.log("🌐 TPulseFi WorldID Verification")

  const { payload, action, signal } = (await req.json()) as IRequestPayload
  const app_id = process.env.APP_ID as `app_${string}`

  console.log("🔍 Verifying WorldID proof for TPulseFi...")
  console.log("├─ Action:", action)
  console.log("├─ Signal:", signal)
  console.log("└─ App ID:", app_id)

  const verifyRes = (await verifyCloudProof(payload, app_id, action, signal)) as IVerifyResponse

  console.log("✅ WorldID verification result:", verifyRes)

  if (verifyRes.success) {
    // This is where you should perform backend actions if the verification succeeds
    // Such as, setting a user as "verified" in a database
    console.log("🎉 WorldID verification successful for TPulseFi!")
    return NextResponse.json({ verifyRes, status: 200 })
  } else {
    // This is where you should handle errors from the World ID /verify endpoint.
    // Usually these errors are due to a user having already verified.
    console.log("❌ WorldID verification failed for TPulseFi")
    return NextResponse.json({ verifyRes, status: 400 })
  }
}
