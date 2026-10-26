import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    friendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    sentRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    hiddenNotes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default models.User || model("User", UserSchema);
