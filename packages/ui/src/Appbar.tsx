import { Button } from "./button";

interface AppbarProps {
    user?: {
        name?: string | null;
    },
    onSignin?: () => void,
    onSignout?: () => void
}

export const Appbar = ({
    user,
    onSignin,
    onSignout
}: AppbarProps) => {
    return <div className="flex justify-between border-b px-4 border-slate-300 h-16 items-center">

        <div className="flex items-center gap-2">
            <div className="text-4xl text-blue-800 font-bold italic">WALPAY</div>
        </div>
        {(onSignin || onSignout) && (
            <div className="flex flex-col justify-center pt-2">
                <Button onClick={() => {
                    if (user && onSignout) onSignout();
                    if (!user && onSignin) onSignin();
                }}>
                    {user ? "Logout" : "Login"}
                </Button>
            </div>
        )}
    </div>
}

function WALPAYIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-10">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
}