"use server";

import { prisma } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Answer } from "@prisma/client";

export async function submitQuiz(quizId: string, answers: Record<string, string>) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
      userId: user.id,
    },
    include: {
      questions: {
        include: {
          answers: true,
        },
      },
    },
  });


  if (!quiz) {
    return { error: "Quiz not found" };
  }

  const totalQuestions = quiz.questions.length;
  let score = 0;

  for (const question of quiz.questions) {
    const selectedAnswer = answers[question.id];
    const correctAnswer = question.answers.find((answer: Answer) => answer.correct);

    if (selectedAnswer === correctAnswer?.id) {
      score++;
    }
  }

  const percentage = (score / totalQuestions) * 100;

  await prisma.quiz.update({
    where: { id: quizId },
    data: {
      lastAttempted: new Date(),
      attempts: {
        create: {
          score,
          percentage,
        },
      },
    },
  });

  return { score, percentage };
  

}


