import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { npm, password } = await req.json();

    if (!npm || !password) {
      return NextResponse.json(
        { success: false, message: "NPM dan password wajib diisi" },
        { status: 400 },
      );
    }

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pengguna/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ npm, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: backendRes.status },
      );
    }

    return NextResponse.json(
      { success: true, data: data.data },
      { status: 200 },
    );
  } catch (error) {
    console.error("LOGIN MAHASISWA ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
