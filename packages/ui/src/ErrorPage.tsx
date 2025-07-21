import { Button } from "./button";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
    title?: string;
    message?: string;
    showHomeButton?: boolean;
}

export function ErrorPage({
    title = "Something went wrong",
    message = "We encountered an unexpected error",
    showHomeButton = true
}: ErrorPageProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">{title}</h1>
                <p className="text-gray-600 mb-6">{message}</p>

                {showHomeButton && (
                    <Button
                        onClick={() => router.push('/')}
                    >
                        Return Home
                    </Button>
                )}
            </div>
        </div>
    );
}
