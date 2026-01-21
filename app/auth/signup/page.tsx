import { SignUpForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-gray-900 to-black p-3 rounded-full">
              <Gamepad2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join the AI Game Generator community
          </p>
        </div>

        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Sign Up</CardTitle>
            <CardDescription className="text-gray-600">
              Create an account to start generating AI games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-gray-900 font-medium hover:text-black">
                  Sign in here
                </Link>
              </p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 block text-center"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}