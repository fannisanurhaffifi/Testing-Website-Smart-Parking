import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const nama = formData.get("nama")?.toString();
    const npm = formData.get("npm")?.toString();
    const email = formData.get("email")?.toString();
    const jurusan = formData.get("jurusan")?.toString();
    const prodi = formData.get("prodi")?.toString();
    const password = formData.get("password")?.toString();
    const plat_nomor = formData.get("plat_nomor")?.toString();
    const stnk = formData.get("stnk") as File | null;

    // ================= VALIDASI =================
    if (
      !nama ||
      !npm ||
      !email ||
      !jurusan ||
      !prodi ||
      !password ||
      !plat_nomor
    ) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // ================= FORWARD KE BACKEND =================
    const backendFormData = new FormData();

    backendFormData.append("nama", nama);
    backendFormData.append("npm", npm);
    backendFormData.append("email", email);
    backendFormData.append("jurusan", jurusan);
    backendFormData.append("prodi", prodi);
    backendFormData.append("password", password);
    backendFormData.append("plat_nomor", plat_nomor);

    if (stnk) {
      backendFormData.append("stnk", stnk);
    }

    const backendURL = `${process.env.NEXT_PUBLIC_API_URL}/api/pengguna/auth/register`;

    const response = await fetch(backendURL, {
      method: "POST",
      body: backendFormData,
    });

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });

  } catch (error) {
    console.error("REGISTER API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
      },
      { status: 500 }
    );
  }
}
