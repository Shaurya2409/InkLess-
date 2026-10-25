import { Schema, Document, Model } from "mongoose";
import { connectAuditDB } from "@/lib/auditDb";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface INoteAuditLog extends Document {
  noteId: string;
  action: AuditAction;
  text: string;
  previousText?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  ipAddress?: string;
  createdAt: Date;
}

const NoteAuditLogSchema = new Schema<INoteAuditLog>(
  {
    noteId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      default: "CREATE",
      required: true,
      index: true,
    },
    text: { type: String, required: true },
    previousText: { type: String },
    authorId: { type: String, required: true, index: true },
    authorName: { type: String, required: true, index: true },
    authorEmail: { type: String, required: true, index: true },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export async function getNoteAuditModel(): Promise<Model<INoteAuditLog>> {
  const conn = await connectAuditDB();
  return (
    (conn.models.NoteAuditLog as Model<INoteAuditLog>) ||
    conn.model<INoteAuditLog>("NoteAuditLog", NoteAuditLogSchema)
  );
}

export async function recordAuditEntry(entry: {
  noteId: string;
  action?: AuditAction;
  text: string;
  previousText?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  ipAddress?: string;
}): Promise<void> {
  try {
    const Model = await getNoteAuditModel();
    await Model.create({
      noteId: entry.noteId,
      action: entry.action || "CREATE",
      text: entry.text,
      previousText: entry.previousText,
      authorId: entry.authorId,
      authorName: entry.authorName,
      authorEmail: entry.authorEmail,
      ipAddress: entry.ipAddress,
    });
  } catch (err) {
    // Non-blocking: log error to console so user operations don't fail if audit logging has an issue
    console.error("Non-blocking error: Failed to record note audit entry:", err);
  }
}
