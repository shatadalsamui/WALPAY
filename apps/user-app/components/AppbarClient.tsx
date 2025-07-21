"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { usePathname } from "next/navigation";

export function AppbarClient() {
  const session = useSession();
  const pathname = usePathname();

  const isAuthPage = pathname?.includes('signin') || pathname?.includes('signup') || pathname?.includes('error');

  return (
    <div>
      <Appbar
        user={session.data?.user}
        {...(!isAuthPage && {
          onSignin: signIn,
          onSignout: async () => {
            await signOut({ callbackUrl: '/signin' });
          }
        })}
      />
    </div>
  );
}
