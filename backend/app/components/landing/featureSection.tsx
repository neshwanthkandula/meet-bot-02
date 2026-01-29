import { Bot, Calendar, Mail, MessageSquare, Share2, Slack } from 'lucide-react'
import React from 'react'


const features = [
    {
        icon : Bot, 
        title : "AI Meeting Summaries",
        description : "Automatic meeting summaries and action tems after each meeting", 
        color : "text-blue-400",
        bgColor : "bg-blue-500/10"
    },
     {
        icon : Calendar, 
        title : "Smart Calender Integration",
        description : "connect Google Calender & bots automatically join meeting's", 
        color : "text-green-400",
        bgColor : "bg-green-500/10"
    },
    {
        icon : Mail, 
        title : "Automated Email Reports",
        description : "Recieve beautiful email summaries with action items", 
        color : "text-orange-200",
        bgColor : "bg-orange-500/10"
    },
    {
        icon : MessageSquare, 
        title : "Chat with Meetings",
        description : "Ask Question's about meetings using our RAG pipeline", 
        color : "text-purple-400",
        bgColor : "bg-purple-500/10"
    },
     {
        icon : Share2, 
        title : "One-Click Integration",
        description : "Push action iteems to Slack ,Asana Jira and Trello", 
        color : "text-cyan-400",
        bgColor  :  "bg-cyan-500/10"
    },
     {
        icon : Slack, 
        title : "slack bot Integration",
        description : "Install our Slack Bot to ask questions and share insights", 
        color : "text-pink-400",
        bgColor : "bg-pink-500/10"
    }
]
const FeatureSection = () => {
  return (
    <section className='py-20 bg-black'>
        <div className='max-w-6xl mx-auto px-4'>
            <div className='text-center mb-16'>
                <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
                    Everything you need for{' '}
                     <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                        Smarter Meetings
                    </span>

                </h2>

                <p className="text-lg max-w-2xl mx-auto bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent">
                    From AI summaries to summeraise semless Integration , we've got every aspect covered
                </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {features.map((feature, index)=>(
                    <div
                     key = {index}
                     className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:bg-gray-900/70 hover:border-gray-700 transition-all'
                    >
                        <div className={`w-12 h-12 p-2 ${feature.bgColor} rounded-lg flex items-center`}>
                            <feature.icon className={`w-6 h-6 ${feature.color}`}/>
                        </div>
                        <h3 className='text-xl font-semibold text-white mb-2'>
                            {feature.title}
                        </h3>
                        <p className='text-gray-400 '>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
  )
}

export default FeatureSection