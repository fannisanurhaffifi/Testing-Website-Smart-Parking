import { NextResponse } from "next/server";

/**
 * GET /api/statcard/parkir
 * Proxy ke Backend Express -> /api/statistik/parkir
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const npm = searchParams.get("npm");

    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/statcard/parkir`;
    if (npm) url += `?npm=${npm}`;

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store", // data real-time
    });


    // ❌ Backend error
    if (!res.ok) {
      let message = "Backend error";
      try {
        const errorData = await res.json();
        message = errorData.message || message;
      } catch { }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: res.status },
      );
    }

    // ✅ Sukses
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ StatCard API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data statcard",
      },
      { status: 500 },
    );
  }
}
