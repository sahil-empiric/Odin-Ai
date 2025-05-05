"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupSuccessPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
                    <CardDescription className="text-center">
                        We've sent you a confirmation email. Please click the link in the email to verify your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="mb-4">
                        If you don't see the email in your inbox, please check your spam folder.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Once verified, you'll be able to log in to your account.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild variant="outline">
                        <Link href="/login">Return to Login</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 