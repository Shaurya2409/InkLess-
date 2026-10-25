import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { getErrorMessage } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found",
        },
        { status: 404 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });

      return NextResponse.json(
        {
          success: false,
          message: "OTP expired",
        },
        { status: 400 }
      );
    }

   if (otpRecord.otp !== otp) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid OTP",
    },
    { status: 400 }
  );
}

otpRecord.verified = true;
await otpRecord.save();

return NextResponse.json({
  success: true,
  message: "OTP verified successfully",
});

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