import { Types } from "mongoose";

/** Lean result shape for User documents */
export interface LeanUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  friendRequests?: Types.ObjectId[];
  sentRequests?: Types.ObjectId[];
  hiddenNotes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/** Lean result shape for Note documents */
export interface LeanNote {
  _id: Types.ObjectId;
  author: Types.ObjectId | { _id: Types.ObjectId; username: string };
  text: string;
  x: number;
  y: number;
  reactions: Map<string, number>;
  edited: boolean;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
}

/** Helper to safely extract error messages from unknown catch values */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Server error";
}
