import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Hardcoded credentials for the factory management team
const VALID_CREDENTIALS = [
  { id: "Akbar", pass: "akbar9320" },
  { id: "Soheab", pass: "soheab9369" },
  { id: "Suhail", pass: "suhail9137" },
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, pass } = body;

    // Validate credentials
    const match = VALID_CREDENTIALS.find(
      (cred) => cred.id === id && cred.pass === pass
    );

    if (!match) {
      return NextResponse.json(
        { message: "Wrong ID or Password" },
        { status: 401 }
      );
    }

    // Issue the session cookie
    const cookieStore = await cookies();
    cookieStore.set("batta_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json(
      { message: "Login successful", user: match.id },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }
}
