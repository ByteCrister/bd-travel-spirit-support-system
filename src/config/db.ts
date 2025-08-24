// db.ts
import mongoose, { Connection } from "mongoose";

/**
 * =========================================
 * MongoDB Connection Utility (Production‑Grade, Type‑Safe)
 * =========================================
 *
 * This module ensures:
 *  - Single shared connection instance (avoids pool exhaustion in serverless)
 *  - Secure, performant connection options
 *  - Clear error handling and logging
 *  - Graceful shutdown support
 *  - Strong TypeScript types for global cache (matches types.d.ts)
 */

// Optional: Enable query logging in development only
// mongoose.set("debug", process.env.NODE_ENV !== "production");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("❌ MongoDB connection string (MONGODB_URI) is not defined in environment variables.");
}

// Retrieve the global cache if it exists, otherwise initialize it
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { Types: null, connection: null, promise: null };
}

/**
 * Connect to MongoDB (singleton pattern)
 */
const connectDB = async (): Promise<Connection> => {
    // Return existing connection if already established
    if (cached.connection) return cached.connection;

    // If no connection attempt is in progress, start one
    if (!cached.promise) {
        const opts: mongoose.ConnectOptions = {
            // Fail fast if DB is unreachable
            serverSelectionTimeoutMS: 5000,

            // Close idle sockets after 30s
            maxIdleTimeMS: 30000,

            // Avoid hanging sockets
            socketTimeoutMS: 45000,

            // Connection pool settings (tune for workload)
            maxPoolSize: 50, // Higher for admin-heavy workloads
            minPoolSize: 5,  // Keep warm connections ready

            // Disable buffering in production to fail fast
            bufferCommands: process.env.NODE_ENV !== "production",

            // Enable retryable writes for better resilience
            retryWrites: true,

            // Read/write concerns for data safety
            readConcern: { level: "majority" },
            writeConcern: { w: "majority", j: true },
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            console.log("✅ MongoDB connected:", mongooseInstance.connection.host);

            // Store mongoose.Types in the global cache for reuse
            cached.Types = mongooseInstance.Types;

            return mongooseInstance.connection;
        });
    }

    try {
        cached.connection = await cached.promise;
    } catch (err) {
        cached.promise = null; // Reset so future calls can retry
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }

    return cached.connection;
};

/**
 * Graceful shutdown handler
 * Ensures DB connection is closed when the process exits
 */
process.on("SIGINT", async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed due to app termination");
    }
    process.exit(0);
});

/**
 * Optional: Connection event listeners for monitoring
 */
mongoose.connection.on("error", (err) => {
    console.error("⚠️ MongoDB connection error:", err);
});
mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected");
});

export default connectDB;
