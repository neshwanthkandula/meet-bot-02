"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavBar = () => {
  const { isSignedIn } = useUser();

  return (
    <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Meeting Bot</span>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="bg-black/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Sign in
                  </Button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Get started
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
