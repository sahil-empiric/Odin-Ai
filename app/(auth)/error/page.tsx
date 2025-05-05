"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
                    <CardDescription className="text-center">
                        There was a problem with your authentication request.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="mb-4">
                        This could be due to an invalid email or password, or another issue with your account.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/login">Return to Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Create Account</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
} 