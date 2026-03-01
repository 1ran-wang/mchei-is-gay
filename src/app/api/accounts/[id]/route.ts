import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  const account = await prisma.account.update({ where: { id: parseInt(id) }, data });
  return NextResponse.json(account);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.account.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
