import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ npm: string }> }
) {
    try {
        const { npm } = await params;

        if (!npm) {
            return NextResponse.json(
                { status: "error", message: "NPM wajib dikirim" },
                { status: 400 }
            );
        }

        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pengguna/users/riwayat/${npm}`;

        const res = await fetch(backendUrl, {
            method: "GET",
            cache: "no-store",
        });

        const result = await res.json();

        return NextResponse.json(result, { status: res.status });
    } catch (error) {
        console.error("RIWAYAT PARKIR API ERROR:", error);
        return NextResponse.json(
            { status: "error", message: "Gagal mengambil riwayat parkir" },
            { status: 500 }
        );
    }
}
