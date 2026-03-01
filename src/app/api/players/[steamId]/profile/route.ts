import { NextResponse } from "next/server";
import { getPlayerProfile } from "@/lib/opendota";

export async function GET(request: Request, { params }: { params: Promise<{ steamId: string }> }) {
  try {
    const { steamId } = await params;
    const data = await getPlayerProfile(steamId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
