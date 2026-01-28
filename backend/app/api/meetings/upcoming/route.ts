import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const { userId } = await auth()
        if(!userId){
            return NextResponse.json({error  : "unauthorized"}, {status : 401})
        }

        const meeting = await prisma.meeting.findMany({
            where : {
                userId : userId,
                status :  "UPCOMING"
            }
        })
    
    return NextResponse.json(meeting)
    }catch(err){

    console.error("internal", err)
    return NextResponse.json({error : "internal server error"}, {status : 500})
   }
}