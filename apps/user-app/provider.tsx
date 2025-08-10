// Providers wraps the app with RecoilRoot (for global state) and SessionProvider (for user session) 
// This lets all child components use Recoil and access session data with useSession()
"use client"
import { RecoilRoot } from "recoil";
import { SessionProvider } from "next-auth/react";

export const Providers = ({children}: {children: React.ReactNode}) => {
    return <RecoilRoot>
        <SessionProvider>
            {children}
        </SessionProvider>
    </RecoilRoot>
}