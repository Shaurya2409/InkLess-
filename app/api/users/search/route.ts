import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUserId } from "@/lib/auth";
import User from "@/models/User";
import Note from "@/models/Note";
import type { LeanUser } from "@/lib/types";
import { getErrorMessage } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const currentUser = await User.findById(currentUserId).select("following");

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Logged-in user not found",
        },
        { status: 404 }
      );
    }

    const followingIds = new Set(
      (currentUser.following || []).map((id: Types.ObjectId) => id.toString())
    );

    let users: Array<Pick<LeanUser, "_id" | "username" | "followers" | "following">> = [];

    if (!query) {
      // Empty query: surface recommended / active companions (excluding self)
      users = await User.find({
        _id: { $ne: currentUserId },
      })
        .select("_id username followers following")
        .limit(8)
        .lean<Array<Pick<LeanUser, "_id" | "username" | "followers" | "following">>>();
    } else {
      // Search matching usernames
      const matched = await User.find({
        username: {
          $regex: query,
          $options: "i",
        },
        _id: { $ne: currentUserId },
      })
        .select("_id username followers following")
        .limit(30)
        .lean<Array<Pick<LeanUser, "_id" | "username" | "followers" | "following">>>();

      const lowerQ = query.toLowerCase();

      // Intelligent Ranking:
      // 1. Exact match (case-insensitive)
      // 2. Starts with query
      // 3. Substring match
      // Tie-breaker: higher follower count first
      matched.sort((a, b) => {
        const uA = a.username.toLowerCase();
        const uB = b.username.toLowerCase();

        const aExact = uA === lowerQ;
        const bExact = uB === lowerQ;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = uA.startsWith(lowerQ);
        const bStarts = uB.startsWith(lowerQ);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aFollowers = a.followers?.length || 0;
        const bFollowers = b.followers?.length || 0;
        return bFollowers - aFollowers;
      });

      users = matched.slice(0, 15);
    }

    // Aggregate thoughts count for matched authors
    const userObjectIds = users.map((u) => u._id);
    const noteCounts = await Note.aggregate([
      { $match: { author: { $in: userObjectIds } } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    noteCounts.forEach((nc: { _id: Types.ObjectId; count: number }) => {
      countMap.set(nc._id.toString(), nc.count);
    });

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      isFollowing: followingIds.has(user._id.toString()),
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      thoughtsCount: countMap.get(user._id.toString()) || 0,
    }));

    return NextResponse.json(
      {
        success: true,
        users: formattedUsers,
        isRecommendation: !query,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("User search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
