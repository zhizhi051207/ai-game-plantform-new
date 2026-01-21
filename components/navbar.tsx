"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">AI Game Generator</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/games" className="text-sm font-medium hover:text-primary">
              Public Games
            </Link>
            <Link href="/my-games" className="text-sm font-medium hover:text-primary">
              My Games
            </Link>
            <Link href="/generate" className="text-sm font-medium hover:text-primary">
              Generate
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-games">My Games</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="flex items-center gap-2">
               <Button 
                 variant="outline" 
                 className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                 asChild
               >
                 <Link href="/auth/signin">Sign In</Link>
               </Button>
               <Button 
                 className="bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900"
                 asChild
               >
                 <Link href="/auth/signup">Sign Up</Link>
               </Button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
}