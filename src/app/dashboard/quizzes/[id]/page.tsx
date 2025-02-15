import { prisma } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React from "react";
import { redirect } from "next/navigation";
import Quiz from "@/components/Quiz";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/login");
  }

  const quiz = await prisma.quiz.findUnique({
    where: {
      id,
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
    return <div>Quiz not found</div>;
  }

  return (
    <MaxWidthWrapper>
      <Quiz quizData={quiz} />
    </MaxWidthWrapper>
  );
};

export default page;
