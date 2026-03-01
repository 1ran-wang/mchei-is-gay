import { NextResponse } from "next/server";
import { getRecentMatches } from "@/lib/opendota";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const matches = await getRecentMatches(steamId);
    return NextResponse.json(matches);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
