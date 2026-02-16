import { NextResponse } from "next/server";

const BE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pengguna/verifikasi`;

export async function PUT(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(BE_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("FE API PUT status pengguna error:", error);
        return NextResponse.json(
            { status: "error", message: "Gagal update status pengguna" },
            { status: 500 }
        );
    }
}
