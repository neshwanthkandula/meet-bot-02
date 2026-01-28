import { MeetingStatus } from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req : Request){
    console.log("Api point")
    try{
        const { userId } = await auth()
        console.log(userId)
        if(!userId){
            return NextResponse.json({error  : "unauthorized"}, {status : 401})
        }

        const { meetingUrl, startTime, endTime  , title} = await req.json()
        console.log(meetingUrl , startTime, endTime, title)
        if(!meetingUrl || !startTime || !endTime || !title){
            return NextResponse.json({error : "missing credentials"}, {status : 400})
        }

        const start = new Date(startTime)
        const end = new Date(endTime)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json({ error: "invalid date format" }, { status: 400 })
        }

        if (end <= start) {
        return NextResponse.json(
            { error: "end time must be after start time" },
            { status: 400 }
        )
        }

        if (end <= new Date()) {
        return NextResponse.json(
            { error: "meeting already completed" },
            { status: 400 }
        )
        }

        //exsisting meeting or not
        const exsisting = await prisma.meeting.findMany({
            where : {
                userId : userId,
                meetingUrl : meetingUrl
            }
        })

        if(exsisting.length > 0){
            return NextResponse.json({error : "exsisting Meeting"}, {status : 400})
        }

        let status : MeetingStatus = "RUNNING"
        if(new Date(startTime) > new Date()){
            status = "UPCOMING"
        }

        const new_meeting = await prisma.meeting.create({
            data : {
                meetingUrl : meetingUrl,
                startTime : startTime,
                endTime : endTime,
                title : title,
                userId : userId,
                status : status
            }
        })

        return NextResponse.json({sucess : "meeting Sucessfully Created"}, {status : 200})
    }catch(err){

    console.error("internal", err)
    return NextResponse.json({error : "internal server error"}, {status : 500})
   }
}

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        status: {
          in: ["UPCOMING", "RUNNING"],
        },
      },
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("GET /api/meetings error:", error)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}
