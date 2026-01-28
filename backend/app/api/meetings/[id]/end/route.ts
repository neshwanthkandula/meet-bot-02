import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request, { params }:  { params: Promise<{ id: string }> }){
    try{
        const { id } = await params
        const meeting = await prisma.meeting.findUnique({
            where: { id },
        });

        if (!meeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }
        const updated = await prisma.meeting.update({
        where: { id },
        data: {
        status: "COMPLETED",
        },
    });
        return NextResponse.json({sucess : "true"}, {status : 200})
   }catch(err){
        console.error("internal server error", err);
        return NextResponse.json({sucess : "false"}, {status : 500})
   }
}