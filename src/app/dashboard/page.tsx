import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageSquare, Brain } from "lucide-react"
import { Card } from "@/components/ui/card"
import { VideoUrlForm } from '@/components/VideoUrlForm'

const page = () => {
  return (
    <main className="container max-w-5xl mx-auto px-4 py-12">
    {/* Header Section */}
    <div className="text-center space-y-4 mb-12">
      <Badge variant="secondary" className="mb-4">
        <Sparkles className="w-3 h-3 mr-1" />
        AI-Powered Learning
      </Badge>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Generate Smart Quizzes from
        <span className="text-red-500"> YouTube</span> Videos
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Transform any YouTube video into an interactive quiz. Perfect for teachers, students, and self-learners.
      </p>
    </div>

    {/* Main Input Card */}
    <VideoUrlForm />

    {/* Features Grid */}
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      {[
        {
          icon: <Brain className="w-5 h-5" />,
          title: "Smart Questions",
          description: "AI generates relevant questions based on video content"
        },
        {
          icon: <MessageSquare className="w-5 h-5" />,
          title: "Multiple Formats",
          description: "Mix of multiple choice, true/false, and open-ended questions"
        },
        {
          icon: <Sparkles className="w-5 h-5" />,
          title: "Instant Generation",
          description: "Get your quiz ready in seconds, not minutes"
        }
      ].map((feature, i) => (
        <Card key={i} className="p-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </main>
  )
}

export default page