import mongoose from "mongoose";

// mongoose.set("debug", true);

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
    throw new Error("MongoDB URL is not defined!");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { Types: null, connection: null, promise: null };
}

const ConnectDB = async () => {
    if (cached.connection) {
        return cached.connection;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => mongoose.connection);
    }

    try {
        cached.connection = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.connection;
};

export default ConnectDB;