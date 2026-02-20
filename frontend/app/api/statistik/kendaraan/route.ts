import { NextResponse } from "next/server";

/**
 * GET /api/statistik/kendaraan?periode=harian|mingguan|bulanan
 * Proxy ke Backend Express (DATA ASLI DARI DATABASE)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode");

    // ✅ VALIDASI
    if (!periode || !["harian", "mingguan", "bulanan"].includes(periode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Periode tidak valid",
        },
        { status: 400 },
      );
    }

    // ✅ FETCH KE BACKEND EXPRESS (AMBIL DATA DB)
    const backendUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/statistik/kendaraan`);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const res = await fetch(
      backendUrl.toString(),
      {
        method: "GET",
        cache: "no-store", // WAJIB: biar data selalu update
      },
    );

    const data = await res.json();

    // ✅ TERUSKAN RESPONSE APA ADANYA
    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error("Statistik API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil statistik kendaraan",
      },
      { status: 500 },
    );
  }
}
