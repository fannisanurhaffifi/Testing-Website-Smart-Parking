import { NextResponse } from "next/server";

const BE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pengguna`;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const res = await fetch(`${BE_URL}?${searchParams.toString()}`, {
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
