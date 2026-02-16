import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/rfid/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("API RFID GENERATE ERROR:", error);
        return NextResponse.json({ status: "error", message: "Internal Server Error" }, { status: 500 });
    }
}
