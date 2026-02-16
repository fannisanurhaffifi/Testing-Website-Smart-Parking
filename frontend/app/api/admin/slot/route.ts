import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/slot`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("API ADMIN SLOT ERROR:", error);
        return NextResponse.json({ status: "error", message: "Internal Server Error" }, { status: 500 });
    }
}
