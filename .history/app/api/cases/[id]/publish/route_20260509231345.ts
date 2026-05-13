import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/session";
import { getCaseById, publishCase } from "@/lib/queries/cases";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/cases/[id]/publish
// Body: { published: boolean }
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requireAnyRole(["admin", "reviewer"]);
  const { id } = await params;

  const qcase = await getCaseById(id);
  if (!qcase) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  // Reviewers can only publish their own assigned cases
  if (user.role === "reviewer" && qcase.reviewer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { published } = (await request.json()) as { published: boolean };
  const updated = await publishCase(id, published);

  return NextResponse.json(updated);
}