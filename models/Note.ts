import { Schema, models, model } from "mongoose";

const NoteSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      maxlength: 70,
      trim: true,
    },

    x: {
      type: Number,
      required: true,
    },

    y: {
      type: Number,
      required: true,
    },

    reactions: {
      type: Map,
      of: Number,
      default: {},
    },

    edited: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
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

// TTL index: MongoDB automatically deletes documents when expiresAt passes.
// This replaces the Note.deleteMany() call that was blocking every GET request.
NoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Query index: notes/get sorts by createdAt desc, filters by expiresAt > now.
// notes/create checks for duplicates by author + expiresAt.
// profile/get counts documents by author + expiresAt.
NoteSchema.index({ author: 1, expiresAt: 1 });
NoteSchema.index({ expiresAt: 1, createdAt: -1 });

export default models.Note || model("Note", NoteSchema);