import mongoose, { Connection } from "mongoose";

const AUDIT_MONGODB_URI = process.env.AUDIT_MONGODB_URI || process.env.MONGODB_URI;
const AUDIT_DB_NAME = process.env.AUDIT_DB_NAME || "inkless_audit";

interface AuditMongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

const globalForAudit = globalThis as unknown as {
  auditMongoose?: AuditMongooseCache;
};

const cachedAudit: AuditMongooseCache = globalForAudit.auditMongoose ?? {
  conn: null,
  promise: null,
};

if (!globalForAudit.auditMongoose) {
  globalForAudit.auditMongoose = cachedAudit;
}

export async function connectAuditDB(): Promise<Connection> {
  if (!AUDIT_MONGODB_URI) {
    throw new Error("Please define MONGODB_URI or AUDIT_MONGODB_URI");
  }

  if (cachedAudit.conn && cachedAudit.conn.readyState === 1) {
    return cachedAudit.conn;
  }

  if (!cachedAudit.promise) {
    cachedAudit.promise = (async () => {
      const conn = mongoose.createConnection(AUDIT_MONGODB_URI, {
        dbName: AUDIT_DB_NAME,
        maxPoolSize: process.env.NODE_ENV === "production" ? 10 : 3,
      });

      await conn.asPromise();
      return conn;
    })().catch((err: Error) => {
      cachedAudit.promise = null;
      console.error("Audit MongoDB connection error:", err.message);
      throw err;
    });
  }

  cachedAudit.conn = await cachedAudit.promise;
  return cachedAudit.conn;
}
