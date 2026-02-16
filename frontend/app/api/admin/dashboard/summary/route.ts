import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/summary`,
            { cache: "no-store" }
        );

        const data = await res.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { status: "error", message: "Gagal ambil dashboard summary" },
            { status: 500 }
        );
    }
}
