import { Schema, models, model } from "mongoose";

const OtpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: MongoDB automatically deletes expired OTP documents.
// OTPs expire after 5 minutes (set in send-otp route), this cleans them up.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Query index: verify-otp and signup both query by email.
OtpSchema.index({ email: 1 });

const Otp = models.Otp || model("Otp", OtpSchema);

export default Otp;