import mongoose from "mongoose";

// Read environment variables
const MONGODB_PASSWD = process.env.MONGODB_PASSWD as string;
const MONGODB_URI_TEMPLATE = process.env.MONGODB_URI as string;

if (!MONGODB_URI_TEMPLATE || !MONGODB_PASSWD) {
  throw new Error("❌ Please add your MongoDB URI and password to .env.local");
}

// Replace <password> placeholder with actual password
const MONGODB_URI = MONGODB_URI_TEMPLATE.replace("<password>", MONGODB_PASSWD);

// Global cache to persist connection across hot reloads in Next.js
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache || { conn: null, promise: null };

export async function connectDB() {
  // Return existing connection if it exists
  if (cached.conn) return cached.conn;

  // If connection is not yet established, create a promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "cloudsketch",
        // Optional settings for production
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  // Wait for connection and cache it
  cached.conn = await cached.promise;

  // Save the cached connection globally
  global.mongooseCache = cached;

  return cached.conn;
}
