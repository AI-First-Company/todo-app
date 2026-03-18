import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "json";
  const category = searchParams.get("category");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (!["csv", "json", "pdf"].includes(format)) {
    return NextResponse.json({ error: "Invalid format. Use csv, json, or pdf." }, { status: 400 });
  }

  const where: Record<string, unknown> = { userId: session.user.id };
  if (category) {
    where.category = category;
  }
  if (dateFrom || dateTo) {
    where.dueDate = {};
    if (dateFrom) (where.dueDate as Record<string, string>).gte = dateFrom;
    if (dateTo) (where.dueDate as Record<string, string>).lte = dateTo;
  }

  const todos = await prisma.todo.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const rows = todos.map((t) => ({
    title: t.title,
    completed: t.completed ? "Yes" : "No",
    priority: t.priority,
    category: t.category ?? "",
    dueDate: t.dueDate ?? "",
    createdAt: t.createdAt.toISOString().split("T")[0],
  }));

  if (format === "json") {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="todos.json"',
      },
    });
  }

  if (format === "csv") {
    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="todos.csv"',
      },
    });
  }

  // PDF
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("My Todos", 14, 20);

  const filters: string[] = [];
  if (category) filters.push("Category: " + category);
  if (dateFrom) filters.push("From: " + dateFrom);
  if (dateTo) filters.push("To: " + dateTo);
  if (filters.length > 0) {
    doc.setFontSize(10);
    doc.text(filters.join("  |  "), 14, 28);
  }

  autoTable(doc, {
    startY: filters.length > 0 ? 34 : 28,
    head: [["Title", "Status", "Priority", "Category", "Due Date", "Created"]],
    body: rows.map((r) => [r.title, r.completed, r.priority, r.category, r.dueDate, r.createdAt]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="todos.pdf"',
    },
  });
}
