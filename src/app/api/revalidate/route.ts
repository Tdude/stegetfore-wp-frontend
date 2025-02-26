// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, token } = body;

    // Verify the webhook secret token
    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Revalidate the path
    revalidatePath(path);

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error("Error revalidating:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { message: "Error revalidating: " + errorMessage },
      { status: 500 }
    );
  }
}
