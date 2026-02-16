import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email wajib diisi" },
                { status: 400 },
            );
        }

        const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pengguna/auth/request-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
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
        console.error("REQUEST OTP ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 },
        );
    }
}
