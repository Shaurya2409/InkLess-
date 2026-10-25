import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import User from "@/models/User";
import { recordAuditEntry } from "@/models/NoteAuditLog";
import type { LeanUser, LeanNote } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
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

    const { noteId } = await req.json();

    const note = await Note.findById(noteId)
      .select("_id author text")
      .lean<Pick<LeanNote, "_id" | "author" | "text">>();

    if (!note) {
      return NextResponse.json(
        {
          success: false,
          message: "Note not found",
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
          message: "You can delete only your own notes.",
        },
        {
          status: 403,
        }
      );
    }

    // Record delete attribution log before deleting from primary database
    await recordAuditEntry({
      noteId: note._id.toString(),
      action: "DELETE",
      text: note.text,
      authorId: user._id.toString(),
      authorName: user.username,
      authorEmail: user.email,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    });

    await Note.findByIdAndDelete(noteId);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/notes/delete error:", error);

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
