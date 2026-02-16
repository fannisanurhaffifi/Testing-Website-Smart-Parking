import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, otp, password_baru } = await req.json();

        if (!email || !otp || !password_baru) {
            return NextResponse.json(
                { success: false, message: "Semua field wajib diisi" },
                { status: 400 },
            );
        }

        const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pengguna/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, password_baru }),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(
                { success: false, message: data.message },
                { status: backendRes.status },
            );
        }

        return NextResponse.json(
            { success: true, message: data.message },
            { status: 200 },
        );
    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 },
        );
    }
}
