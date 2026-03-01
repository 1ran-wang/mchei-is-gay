import { NextResponse } from "next/server";
import { getPlayerProfile, getWinLoss } from "@/lib/opendota";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ steamId: string }> }
) {
  try {
    const { steamId } = await params;
    const [profile, wl] = await Promise.all([
      getPlayerProfile(steamId),
      getWinLoss(steamId),
    ]);
    return NextResponse.json({ profile, wl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
