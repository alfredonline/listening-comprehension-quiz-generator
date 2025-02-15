import { prisma } from "@/lib/db";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, ListChecks } from "lucide-react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

async function getQuizzes() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/login");
  }

  const quizzes = await prisma.quiz.findMany({
    where: {
      userId: user.id,
    },
    include: {
      questions: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return quizzes;
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <MaxWidthWrapper className="py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Quizzes</h1>
        <Link href="/dashboard">
          <Button>Create New Quiz</Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Card className="bg-muted">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold mb-2">No Quizzes Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first quiz to get started!
            </p>
            <Link href="/dashboard/quizzes/create">
              <Button>Create Your First Quiz</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ListChecks className="mr-2 h-4 w-4" />
                    {quiz.questions.length} Questions
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/quizzes/${quiz.id}`} className="w-full">
                  <Button className="w-full">Take Quiz</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </MaxWidthWrapper>
  );
}
