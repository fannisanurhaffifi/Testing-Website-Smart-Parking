import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

        if (!backendBaseUrl) {
            return NextResponse.json(
                { status: "error", message: "Konfigurasi BACKEND_URL di Railway Frontend belum diisi!" },
                { status: 500 }
            );
        }

        const BE_URL = `${backendBaseUrl}/api/admin/pengguna`;
        const { searchParams } = new URL(req.url);
        const FULL_URL = `${BE_URL}?${searchParams.toString()}`;

        console.log("🌐 FE Proxy Calling BE:", FULL_URL);

        const res = await fetch(FULL_URL, {
            cache: "no-store",
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error("FE API GET pengguna error:", error);
        return NextResponse.json(
            {
                status: "error",
                message: `FE Proxy Error: ${error.message}`
            },
            { status: 500 }
        );
    }
}
