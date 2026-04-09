import { getHistory, getSearchById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // If ?id= is provided, return full search details
  const id = searchParams.get("id");
  if (id) {
    const detail = getSearchById(parseInt(id, 10));
    if (!detail) {
      return Response.json({ error: "Search not found" }, { status: 404 });
    }
    return Response.json(detail);
  }

  // Otherwise return paginated history
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const { entries, total } = getHistory(page, limit);

  return Response.json({
    entries,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
