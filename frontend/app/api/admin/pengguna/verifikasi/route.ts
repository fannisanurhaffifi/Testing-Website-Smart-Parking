import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

        if (!backendBaseUrl) {
            return NextResponse.json(
                { status: "error", message: "Konfigurasi BACKEND_URL belum diisi!" },
                { status: 500 }
            );
        }

        const body = await req.json();
        const BE_URL = `${backendBaseUrl}/api/admin/pengguna/verifikasi`;

        const res = await fetch(BE_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error("FE API PUT verifikasi pengguna error:", error);
        return NextResponse.json(
            { status: "error", message: `FE Proxy Error: ${error.message}` },
            { status: 500 }
        );
    }
}
