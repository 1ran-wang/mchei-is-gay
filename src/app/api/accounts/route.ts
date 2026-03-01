import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usedBy = searchParams.get("usedBy");

  const where = usedBy ? { usedBy } : {};
  const accounts = await prisma.account.findMany({ where, orderBy: { id: "asc" } });
  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const data = await request.json();
  const account = await prisma.account.create({ data });
  return NextResponse.json(account, { status: 201 });
}
