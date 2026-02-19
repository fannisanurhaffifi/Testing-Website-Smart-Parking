import { NextResponse } from "next/server";

const BE_URL = `${process.env.BACKEND_URL}/api/admin/pengguna`;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const FULL_URL = `${BE_URL}?${searchParams.toString()}`;

        console.log("🌐 FE Proxy Calling BE:", FULL_URL);

        const res = await fetch(FULL_URL, {
            cache: "no-store",
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("FE API GET pengguna error:", error);
        return NextResponse.json(
            { status: "error", message: "Gagal mengambil data pengguna" },
            { status: 500 }
        );
    }
}
