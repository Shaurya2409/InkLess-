import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
    };

    const { targetUserId } = await req.json();

    if (decoded.userId === targetUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot follow yourself.",
        },
        {
          status: 400,
        }
      );
    }

    const currentUser = await User.findById(decoded.userId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Already following check
    const isAlreadyFollowing = (currentUser.following || []).some(
      (id: { toString(): string }) => id.toString() === targetUserId
    );
    if (isAlreadyFollowing) {
      return NextResponse.json({
        success: true,
        status: "following",
        message: "Already subscribed to this author.",
      });
    }

    // Already requested check
    const isAlreadyRequested = (currentUser.sentRequests || []).some(
      (id: { toString(): string }) => id.toString() === targetUserId
    );
    if (isAlreadyRequested) {
      return NextResponse.json({
        success: true,
        status: "requested",
        message: "Companion request already pending.",
      });
    }

    // Initialize arrays if missing
    if (!currentUser.sentRequests) currentUser.sentRequests = [];
    if (!targetUser.friendRequests) targetUser.friendRequests = [];

    // Add to pending requests
    currentUser.sentRequests.push(targetUser._id);
    targetUser.friendRequests.push(currentUser._id);

    await currentUser.save();
    await targetUser.save();

    return NextResponse.json({
      success: true,
      status: "requested",
      message: "Companion request sent successfully.",
    });
  } catch (err) {
    console.error("Error in follow/request:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send companion request.",
      },
      {
        status: 500,
      }
    );
  }
}
