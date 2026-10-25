import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import User from "@/models/User";
import type { LeanUser, LeanNote } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
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
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
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
      .select("_id username hiddenNotes following")
      .lean<Pick<LeanUser, "_id" | "username" | "hiddenNotes" | "following">>();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // Following-only filter: only notes from self or authors this user actively follows
    const userHiddenNotes = Array.isArray(user.hiddenNotes) ? user.hiddenNotes : [];
    const allowedAuthorIds = [user._id, ...(user.following || [])];

    const notes = await Note.find({
      author: {
        $in: allowedAuthorIds,
      },
      expiresAt: {
        $gt: new Date(),
      },
      _id: {
        $nin: userHiddenNotes,
      },
    })
      .populate("author", "username")
      .sort({
        createdAt: -1,
      })
      .lean<LeanNote[]>();

    const userId = user._id.toString();

    // Anonymity filter: Owner sees their real pen name; all other authors are scrubbed to "anonymous"
    const formattedNotes = notes.map((note) => {
      const isOwner =
        typeof note.author === "object" && note.author !== null && "_id" in note.author
          ? note.author._id.toString() === userId
          : false;

      return {
        _id: note._id,
        text: note.text,
        x: note.x,
        y: note.y,
        author: {
          username: isOwner
            ? typeof note.author === "object" && note.author !== null && "username" in note.author
              ? note.author.username
              : user.username
            : "anonymous",
        },
        createdAt: note.createdAt,
        expiresAt: note.expiresAt,
        isOwner,
      };
    });

    return NextResponse.json(
      {
        success: true,
        notes: formattedNotes,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/notes/get error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load notes.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
