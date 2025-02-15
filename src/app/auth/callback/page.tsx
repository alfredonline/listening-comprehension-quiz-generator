import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const Page = async () => {
    let redirectPath: string | null = null;
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id || !user.email) {
    redirect('/');
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
        email: user.email,
      },
    });

    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user?.email || "",
          name: user?.given_name
            ? `${user.given_name} ${user.family_name}`
            : "John Doe",
        },
      });
    }

    redirectPath = '/dashboard';
  } catch (error) {
    console.error(error);
    redirectPath = '/';
  } finally {
    if (redirectPath) {
      redirect(redirectPath);
    }
  }


}

export default Page;