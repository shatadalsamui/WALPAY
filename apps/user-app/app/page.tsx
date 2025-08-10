// This server component checks if the user is logged in: 
// - If authenticated, redirect to /dashboard 
// - If not authenticated, redirect to /api/auth/signin (login page)
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation'
import { authOptions } from "./lib/auth";

export default async function Page() {

  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect('/dashboard')
  } else {
    redirect('/api/auth/signin')
  }
}
