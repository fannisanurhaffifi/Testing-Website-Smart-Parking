import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const npm = searchParams.get("npm");

        if (!npm) {
            return NextResponse.json(
                { success: false, message: "NPM wajib dikirim" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BASE_URL}/api/pengguna/users/profile/${npm}`);
        const result = await response.json();

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Gagal mengambil profil" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const incomingFormData = await req.formData();
        const outgoingFormData = new FormData();

        // Salalin semua field dari incoming ke outgoing
        incomingFormData.forEach((value, key) => {
            outgoingFormData.append(key, value);
        });

        const response = await fetch(`${BASE_URL}/api/pengguna/users/profile`, {
            method: "PUT",
            body: outgoingFormData,
        });

        const result = await response.json();

        return NextResponse.json(result, { status: response.status });
    } catch (error) {
        console.error("PUT PROFILE PROXY ERROR:", error);
        return NextResponse.json(
            { success: false, message: "Gagal update profil" },
            { status: 500 }
        );
    }
}

