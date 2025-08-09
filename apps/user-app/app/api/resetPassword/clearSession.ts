import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export async function POST(req: NextRequest) {
    // This will clear the session cookie
    const response = NextResponse.json({ message: "Session cleared" });
    response.cookies.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
    response.cookies.set("__Secure-next-auth.session-token", "", { path: "/", maxAge: 0 });
    return response;
}
