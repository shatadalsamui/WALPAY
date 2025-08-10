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