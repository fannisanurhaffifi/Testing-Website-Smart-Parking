import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${BASE_URL}/api/pengguna/users/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("PROXY CHANGE PASSWORD ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghubungkan ke server untuk ganti kata sandi" },
            { status: 500 }
        );
    }
}
