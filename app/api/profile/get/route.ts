import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note";
import type { LeanUser } from "@/lib/types";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

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
      .select("username email followers following hiddenNotes")
      .lean<Pick<LeanUser, "_id" | "username" | "email" | "followers" | "following" | "hiddenNotes">>();

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

    const sixHoursAgo = new Date(Date.now() - SIX_HOURS_MS);

    const totalNotes = await Note.countDocuments({
      author: user._id,
      createdAt: {
        $gt: sixHoursAgo,
      },
      expiresAt: {
        $gt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        username: user.username,
        email: user.email,
        followers: user.followers.length,
        following: user.following.length,
        hiddenNotes: user.hiddenNotes.length,
        totalNotes,
      },
    });

  } catch (err) {
    console.error(err);

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
