import mongoose from 'mongoose';
import dns from 'node:dns';

export const DB_NAME = 'InstagramDB';

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in backend/.env');
  const dnsServers = (process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map(server => server.trim()).filter(Boolean);
  dns.setServers(dnsServers);
  console.log(`MongoDB DNS servers configured: ${dnsServers.length}`);
  await mongoose.connect(process.env.MONGODB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  if (mongoose.connection.name !== DB_NAME) throw new Error(`Connected to unexpected database ${mongoose.connection.name}`);
  console.log(`MongoDB connected to ${DB_NAME}`);
}
