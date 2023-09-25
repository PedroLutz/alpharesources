// lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('A variável de ambiente MONGODB_URI não está definida.');
}

let cachedConnection = null;

export default async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const connection = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedConnection = connection;
  return connection;
}
