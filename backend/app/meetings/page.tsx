
import React from "react"

import Meeting from "../components/meeting"
import { AddMeeting } from "../components/add-meeting-card"

// export default function Page() {
//   return (
//     <div className=" bg-background">
//       <div className="p-10">
//       {/* Centered container styled like sidebar */}
//       <div className="min-w-xl rounded-lg bg-sidebar-accent/40 border border-sidebar-border p-6 space-y-8 text-foreground">
        
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-semibold text-blue-400">
//             Meetings
//           </h1>

//           {/* Same AddMeeting component, only visual wrapper */}
          
//             <AddMeeting />
//         </div>

//         {/* Lists */}
//         <div className="space-y-8">
//           <Meeting link="upcoming" />
//           <Meeting link="running" />
//           <Meeting link="past" />
//         </div>
//       </div>
//       </div>
//     </div>
//   )
// }

export default function Page() {
  // return (
  //   <div className="bg-white w-full h-full">

  //   </div>
  // )
  return (
    <div className="bg-background px-20">
      <div className="p-10">
        <div className="w-full rounded-lg bg-card border border-border p-6 space-y-8 text-foreground">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-blue-400">
              Meetings
            </h1>
            <AddMeeting />
          </div>

          <div className="space-y-8">
            <Meeting link="upcoming" />
            <Meeting link="running" />
            <Meeting link="past" />
          </div>
        </div>
      </div>
    </div>
  )
}
