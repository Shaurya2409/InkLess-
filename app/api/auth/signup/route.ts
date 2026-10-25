import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { getErrorMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }
    const otpRecord = await Otp.findOne({
  email,
  verified: true,
});

if (!otpRecord) {
  return NextResponse.json(
    {
      success: false,
      message: "Please verify your email first",
    },
    { status: 400 }
  );
}

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    await Otp.deleteMany({ email });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}