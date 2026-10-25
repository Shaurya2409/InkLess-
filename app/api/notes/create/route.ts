import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { findFreePosition } from "@/lib/findFreePosition";

import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import User from "@/models/User";
import { recordAuditEntry } from "@/models/NoteAuditLog";
import type { LeanUser, LeanNote } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
    };

    // Find current user with username, email, and following for audit recording and position scoping
    const user = await User.findById(decoded.userId)
      .select("_id username email following")
      .lean<Pick<LeanUser, "_id" | "username" | "email" | "following">>();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    let { text, x, y } = body;

    // Validation
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, message: "Note text is required." },
        { status: 400 }
      );
    }

    text = text.trim();

    if (text.length === 0) {
      return NextResponse.json(
        { success: false, message: "Note cannot be empty." },
        { status: 400 }
      );
    }

    if (text.length > 70) {
      return NextResponse.json(
        { success: false, message: "Maximum 70 characters allowed." },
        { status: 400 }
      );
    }

    // Prevent duplicate note
    const duplicate = await Note.findOne({
      author: user._id,
      text,
      expiresAt: { $gt: new Date() },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have this note on your wall.",
        },
        { status: 409 }
      );
    }

    // Find a free position if x/y are not provided (scoped to user's visible notebook)
    if (typeof x !== "number" || typeof y !== "number") {
      const allowedAuthorIds = [user._id, ...(user.following || [])];
      const existingNotes = await Note.find(
        {
          author: {
            $in: allowedAuthorIds,
          },
          expiresAt: {
            $gt: new Date(),
          },
        },
        {
          x: 1,
          y: 1,
        }
      ).lean<Array<Pick<LeanNote, "x" | "y">>>();

      const position = findFreePosition(existingNotes);

      x = position.x;
      y = position.y;
    }

    // 24-hour expiry (survives overnight across all devices)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const note = await Note.create({
      author: user._id,
      text,
      x,
      y,
      expiresAt,
    });

    // Record author attribution in isolated developer audit database
    await recordAuditEntry({
      noteId: note._id.toString(),
      action: "CREATE",
      text: note.text,
      authorId: user._id.toString(),
      authorName: user.username,
      authorEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully.",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/notes/create error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
