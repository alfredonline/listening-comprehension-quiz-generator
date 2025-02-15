"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";

interface MobileNavProps {
  user?: KindeUser | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full xs:w-80">
        <SheetHeader>
          <SheetTitle>LingualAI</SheetTitle>
          <SheetDescription>
            A language learning app that uses AI to help you learn languages.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col gap-2 pt-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ variant: "default" })}
                  >
                    Dashboard
                  </Link>
                  <LogoutLink
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    Logout
                  </LogoutLink>
                </>
              ) : (
                <LoginLink className={buttonVariants({ variant: "ghost" })}>
                  Sign In
                </LoginLink>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
