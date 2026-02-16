import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ===== ambil query dari FE =====
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";
    const search = searchParams.get("search") || "";
    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";

    // ===== bangun query ke BE =====
    const params = new URLSearchParams({
      limit,
      offset,
    });

    if (search) params.append("search", search);
    if (start) params.append("start", start);
    if (end) params.append("end", end);

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/parkir?${params.toString()}`;

    // ===== fetch ke backend =====
    const res = await fetch(backendUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        {
          status: "error",
          message: "Backend error saat mengambil data parkir",
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    // ===== langsung teruskan response backend =====
    return NextResponse.json(data);
  } catch (error) {
    console.error("API FE PARKIR ERROR:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal mengambil data parkir",
      },
      { status: 500 }
    );
  }
}
