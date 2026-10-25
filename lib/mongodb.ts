import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Cache the connection on the global object to survive Fast Refresh in development.
// Without this, Next.js re-evaluates modules during HMR and opens new connections.
const globalForMongoose = globalThis as unknown as {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cached;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "inkless",
        // Limit connection pool for development — prevents resource exhaustion
        maxPoolSize: process.env.NODE_ENV === "production" ? 10 : 3,
      })
      .then((m) => {
        return m;
      })
      .catch((err: Error) => {
        // Reset the cached promise so a retry is possible
        cached.promise = null;
        console.error("MongoDB connection error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}