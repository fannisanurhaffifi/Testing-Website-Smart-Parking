import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { npm, aksi } = await req.json();

        if (!npm || !aksi) {
            return NextResponse.json(
                { status: "error", message: "NPM dan aksi wajib diisi" },
                { status: 400 }
            );
        }

        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pengguna/parkir/manual`;

        const res = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ npm, aksi }),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("API MAHASISWA PARKIR ERROR:", error);
        return NextResponse.json(
            { status: "error", message: "Gagal memproses aksi parkir" },
            { status: 500 }
        );
    }
}
