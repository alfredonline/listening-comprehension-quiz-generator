import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import { MobileNav } from "./MobileNav";
import MaxWidthWrapper from "./MaxWidthWrapper";
import {
  getKindeServerSession,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

export default async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = (await getUser()) as KindeUser;
  return (
    <MaxWidthWrapper className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <Headphones className="h-6 w-6" />
            <span>LingualAI</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard/quizzes">Quizzes</Link>
                <Link href="/dashboard">Dashboard</Link>
                <LogoutLink
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  Logout
                </LogoutLink>
              </>
            ) : (
              <LoginLink
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Login
              </LoginLink>
            )}
          </div>
          <MobileNav user={user} />
        </div>
      </nav>
    </MaxWidthWrapper>
  );
}
