import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const MONGODB_URL = (process.env.MONGODB_URL || process.env.MONGO_URL)!;

let cached = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
