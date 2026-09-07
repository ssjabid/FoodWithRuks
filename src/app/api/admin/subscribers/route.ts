import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase/authCheck";
import { listSubscribers } from "@/lib/firebase/subscribers";

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET(request: Request) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const subscribers = await listSubscribers();
    const { searchParams } = new URL(request.url);

    if (searchParams.get("format") === "csv") {
      const rows = [
        ["email", "status", "source", "createdAt"].join(","),
        ...subscribers.map((s) =>
          [csvCell(s.email), s.status, s.source, s.createdAt.toISOString()].join(",")
        ),
      ];
      const stamp = new Date().toISOString().slice(0, 10);
      return new NextResponse(rows.join("\r\n") + "\r\n", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="subscribers-${stamp}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Subscribers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
