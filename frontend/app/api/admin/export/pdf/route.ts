import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const periode = searchParams.get("periode") || "harian";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/parkir/export/pdf?periode=${periode}`;

    if (from && to) {
        url += `&from=${from}&to=${to}`;
    }

    const res = await fetch(url, { cache: "no-store" });
    const blob = await res.blob();

    return new NextResponse(blob, {
        headers: {
            "Content-Type": "application/pdf",
        },
    });
}
