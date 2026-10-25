import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import User from "@/models/User";
import { recordAuditEntry } from "@/models/NoteAuditLog";
import type { LeanUser } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId)
      .select("_id username email")
      .lean<Pick<LeanUser, "_id" | "username" | "email">>();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const { noteId, text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Note cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (text.length > 70) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum 70 characters allowed.",
        },
        {
          status: 400,
        }
      );
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (note.author.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Not allowed.",
        },
        {
          status: 403,
        }
      );
    }

    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - new Date(note.createdAt).getTime() > tenMinutes) {
      return NextResponse.json(
        {
          success: false,
          message: "Notes can only be edited within 10 minutes of posting.",
        },
        { status: 403 }
      );
    }

    const previousText = note.text;
    note.text = text.trim();
    note.edited = true;

    await note.save();

    // Record edit attribution log in isolated developer audit database
    await recordAuditEntry({
      noteId: note._id.toString(),
      action: "UPDATE",
      text: note.text,
      previousText,
      authorId: user._id.toString(),
      authorName: user.username,
      authorEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Note updated.",
      note,
    });
  } catch (error) {
    console.error("PATCH /api/notes/update error:", error);

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
