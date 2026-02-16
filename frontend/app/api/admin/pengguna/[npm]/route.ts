import { NextResponse } from "next/server";

const BE_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/pengguna`;

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ npm: string }> }
) {
    const { npm } = await params;
    try {
        const res = await fetch(`${BE_BASE}/${npm}`, {
            method: "DELETE",
        });

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("FE API DELETE pengguna error:", error);
        return NextResponse.json(
            { status: "error", message: "Gagal menghapus pengguna" },
            { status: 500 }
        );
    }
}
