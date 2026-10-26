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

    const { targetUserId } = await req.json(); // The sender of the request

    const currentUser = await User.findById(decoded.userId);
    const senderUser = await User.findById(targetUserId);

    if (!currentUser || !senderUser) {
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

    // Remove from request queues
    currentUser.friendRequests = (currentUser.friendRequests || []).filter(
      (id: { toString(): string }) => id.toString() !== targetUserId
    );

    senderUser.sentRequests = (senderUser.sentRequests || []).filter(
      (id: { toString(): string }) => id.toString() !== decoded.userId
    );

    await currentUser.save();
    await senderUser.save();

    return NextResponse.json({
      success: true,
      message: "Companion request declined.",
    });
  } catch (err) {
    console.error("Error declining companion request:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to decline companion request.",
      },
      {
        status: 500,
      }
    );
  }
}
