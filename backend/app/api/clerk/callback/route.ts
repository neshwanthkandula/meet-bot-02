import prisma from "@/lib/prisma"
import { Webhook } from "svix"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  try {
    const evt = wh.verify(payload, headers) as {
      type: string
      data: any
    }

    if (evt.type === "user.created") {
      const user = evt.data

      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          name: user.first_name ?? "Unknown",
        },
        create: {
          id: user.id,
          name: user.first_name ?? "Unknown",
        },
      })
    }

    if (evt.type === "user.updated") {
      const user = evt.data

      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.first_name ?? "Unknown",
        },
      })
    }

    if (evt.type === "user.deleted") {
      const user = evt.data

      await prisma.user.delete({
        where: { id: user.id },
      })
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("Clerk webhook error:", err)
    return new Response("Unauthorized", { status: 401 })
  }
}
