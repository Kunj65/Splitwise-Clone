import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") }); // ✅ explicit path

console.log("Connecting to:", process.env.MONGO_URI); // verify it loads

await mongoose.connect(process.env.MONGO_URI);

const result = await mongoose.connection.collection("expenses").updateMany(
  { currency: { $exists: false } },
  { $set: { currency: "INR" } }
);

console.log(`Updated ${result.modifiedCount} old expenses with default INR currency.`);
await mongoose.disconnect();
console.log("Done.");