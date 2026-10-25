import { NextRequest, NextResponse } from "next/server";
import { getNoteAuditModel } from "@/models/NoteAuditLog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const devAdminKey = process.env.DEV_ADMIN_KEY;

    if (!devAdminKey) {
      return NextResponse.json(
        {
          success: false,
          message: "DEV_ADMIN_KEY is not configured on the server.",
        },
        { status: 500 }
      );
    }

    // Verify key via HTTP header or URL query parameter
    const keyFromHeader = req.headers.get("x-admin-key");
    const keyFromQuery = req.nextUrl.searchParams.get("key");
    const providedKey = keyFromHeader || keyFromQuery;

    if (!providedKey || providedKey !== devAdminKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Invalid or missing developer key.",
        },
        { status: 403 }
      );
    }

    // Connect to developer audit database
    const AuditModel = await getNoteAuditModel();

    // Query parameters
    const limit = Math.min(100, parseInt(req.nextUrl.searchParams.get("limit") || "50", 10));
    const author = req.nextUrl.searchParams.get("author");
    const search = req.nextUrl.searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (author) {
      query.$or = [
        { authorName: { $regex: author, $options: "i" } },
        { authorEmail: { $regex: author, $options: "i" } },
      ];
    }

    if (search) {
      query.text = { $regex: search, $options: "i" };
    }

    const [totalRecords, logs] = await Promise.all([
      AuditModel.countDocuments(query),
      AuditModel.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        database: process.env.AUDIT_DB_NAME || "inkless_audit",
        totalRecords,
        displayedRecords: logs.length,
        logs,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/admin/audit-logs error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve developer audit logs.",
      },
      { status: 500 }
    );
  }
}
