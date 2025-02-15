"use client";
import { Answer, Question, Quiz as QuizType } from '@prisma/client'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import { Progress } from "@/components/ui/progress"


const Quiz = ({ quizData }: { quizData: QuizType & { questions: (Question & { answers: Answer[] })[] } }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = quizData.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1

  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }))
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    const finalScore = quizData.questions.reduce((acc, question) => {
      const selectedAnswerId = selectedAnswers[question.id]
      const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
      return selectedAnswer?.correct ? acc + 1 : acc
    }, 0)
    setScore(finalScore)
    setIsSubmitted(true)
  }

  return (
    <Card className="shadow-lg max-w-3xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress: {Math.round(progress)}%</span>
            <span>{currentQuestionIndex + 1} of {quizData.questions.length} questions</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isSubmitted && score === quizData.questions.length ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl font-bold text-green-600">🎉 Perfect Score! 🎉</div>
            <p className="text-lg text-muted-foreground">Congratulations! You got all questions correct!</p>
          </div>
        ) : isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-3xl font-bold">Quiz Completed!</div>
            <p className="text-lg text-muted-foreground">You scored {score} out of {quizData.questions.length}</p>
          </div>
        ) : currentQuestion && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">
                Question {currentQuestionIndex + 1}
              </div>
              {isSubmitted && (
                <div className="text-lg font-medium text-primary">
                  Score: {score}/{quizData.questions.length}
                </div>
              )}
            </div>
            
            <div className="text-xl font-semibold">{currentQuestion.question}</div>

            <RadioGroup
              value={selectedAnswers[currentQuestion.id]}
              onValueChange={handleAnswerSelect}
              className="pt-4"
            >
              <div className="space-y-4">
                {currentQuestion.answers.map((answer) => (
                  <div 
                    key={answer.id} 
                    className={`flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 ease-in-out
                      ${isSubmitted && answer.correct ? 'bg-green-50 border-green-200 border' : ''}
                      ${isSubmitted && !answer.correct && selectedAnswers[currentQuestion.id] === answer.id ? 'bg-red-50 border-red-200 border' : ''}
                      ${!isSubmitted ? 'hover:bg-accent hover:scale-[1.01] border border-transparent hover:border-primary/20' : ''}`}
                  >
                    <RadioGroupItem
                      value={answer.id}
                      id={answer.id}
                      disabled={isSubmitted}
                    />
                    <Label htmlFor={answer.id} className="text-lg flex-grow">
                      {answer.text}
                    </Label>
                    {isSubmitted && (
                      <span className={`flex items-center ${answer.correct ? "text-green-600" : "text-red-600"}`}>
                        {answer.correct ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="w-[120px] transition-transform hover:-translate-x-1"
              >
                ← Previous
              </Button>
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitted || !selectedAnswers[currentQuestion.id]}
                  className="w-[120px] bg-green-600 hover:bg-green-700"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQuestion.id]}
                  className="w-[120px] transition-transform hover:translate-x-1"
                >
                  Next →
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Quiz