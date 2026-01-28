import { NextResponse } from "next/server";
import { getSummaryText } from "../../../../lib/s3";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
  });

//   if (!meeting || meeting.status !== "COMPLETED") {
//     return NextResponse.json(
//       { error: "Summary not available" },
//       { status: 404 }
//     );
//   }

  const summary = await getSummaryText(params.id);

  return new Response(summary, {
    headers: { "Content-Type": "text/plain" },
  });
}