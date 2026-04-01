#!/usr/bin/env node
/**
 * Initialize Admin User
 *
 * This script creates the admin account in MongoDB if it doesn't exist.
 * Usage: npx tsx scripts/initialize-admin.ts
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();
const adminName = process.env.ADMIN_NAME || "Admin";
const mongoUri = process.env.MONGODB_URI;
const mongoDb = process.env.MONGODB_DB || "acrecap";

if (!adminEmail || !adminPassword || !mongoUri) {
  console.error("❌ Missing required environment variables:");
  if (!adminEmail) console.error("   - ADMIN_EMAIL");
  if (!adminPassword) console.error("   - ADMIN_PASSWORD");
  if (!mongoUri) console.error("   - MONGODB_URI");
  process.exit(1);
}

// Validate password length
if (adminPassword.length < 6) {
  console.error(
    `❌ Admin password must be at least 6 characters (currently ${adminPassword.length})`,
  );
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
  },
  { timestamps: true, bufferCommands: false },
);

const UserModel = mongoose.model("User", userSchema);

async function initializeAdmin() {
  try {
    console.log(`🔄 Connecting to MongoDB: ${mongoUri.split("@")[1]}...`);

    await mongoose.connect(mongoUri, {
      dbName: mongoDb,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role === "admin") {
        console.log(`✅ Admin account already exists: ${adminEmail}`);

        // Check if we should update password
        const isPasswordMatch = await bcrypt.compare(
          adminPassword,
          existingAdmin.passwordHash,
        );

        if (!isPasswordMatch) {
          console.log("🔄 Updating admin password...");
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          existingAdmin.passwordHash = hashedPassword;
          existingAdmin.name = adminName;
          await existingAdmin.save();
          console.log("✅ Admin password updated successfully");
        }
      } else {
        console.log("🔄 Converting existing user to admin...");
        existingAdmin.role = "admin";
        existingAdmin.name = adminName;
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        existingAdmin.passwordHash = hashedPassword;
        await existingAdmin.save();
        console.log("✅ User converted to admin successfully");
      }
    } else {
      console.log("🔄 Creating new admin account...");

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const admin = new UserModel({
        name: adminName,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("✅ Admin account created successfully");
    }

    console.log(`\n📋 Admin Account Details:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: admin`);
    console.log(`\n🎉 Admin initialization complete!`);
    console.log(`\n👉 You can now login at: /admin-login`);

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error initializing admin:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

initializeAdmin();
