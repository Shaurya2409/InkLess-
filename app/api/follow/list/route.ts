import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Note from "@/models/Note";
import type { LeanUser } from "@/lib/types";

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
      .select("followers following")
      .lean<Pick<LeanUser, "followers" | "following">>();

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

    const followerIds: mongoose.Types.ObjectId[] = user.followers || [];
    const followingIds: mongoose.Types.ObjectId[] = user.following || [];

    const allIds = Array.from(
      new Set([
        ...followerIds.map((id) => id.toString()),
        ...followingIds.map((id) => id.toString()),
      ])
    ).map((id) => new mongoose.Types.ObjectId(id));

    // Aggregate total recipes/notes created by each user (activity level)
    const noteCounts = await Note.aggregate([
      { $match: { author: { $in: allIds } } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    noteCounts.forEach((nc: { _id: mongoose.Types.ObjectId; count: number }) => {
      countMap.set(nc._id.toString(), nc.count);
    });

    // Fetch user details for each staff member
    const userDocs = await User.find(
      { _id: { $in: allIds } },
      { username: 1, email: 1, createdAt: 1 }
    ).lean<Array<{ _id: mongoose.Types.ObjectId; username: string; email: string; createdAt: Date }>>();

    const userMap = new Map<
      string,
      { username: string; email: string; createdAt: Date }
    >();
    userDocs.forEach((u) => {
      userMap.set(u._id.toString(), {
        username: u.username,
        email: u.email,
        createdAt: u.createdAt,
      });
    });

    const followers = followerIds.map((id, index) => {
      const sId = id.toString();
      const u = userMap.get(sId);
      return {
        _id: sId,
        username: u?.username || "Unknown Chef",
        email: u?.email || "",
        createdAt: u?.createdAt || new Date(),
        recipeCount: countMap.get(sId) || 0,
        followIndex: index,
      };
    });

    const following = followingIds.map((id, index) => {
      const sId = id.toString();
      const u = userMap.get(sId);
      return {
        _id: sId,
        username: u?.username || "Unknown Chef",
        email: u?.email || "",
        createdAt: u?.createdAt || new Date(),
        recipeCount: countMap.get(sId) || 0,
        followIndex: index,
      };
    });

    return NextResponse.json({
      success: true,
      followers,
      following,
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
