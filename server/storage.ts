import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { connectMongo } from "./mongo";

const userSchema = new Schema(
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

const submissionSchema = new Schema(
  {
    applicationType: {
      type: String,
      enum: ["loan", "insurance"],
      default: "loan",
      required: true,
      trim: true,
    },
    userId: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    businessName: { type: String, default: null, trim: true },
    businessType: { type: String, default: null, trim: true },
    annualTurnover: { type: String, default: null, trim: true },
    yearsInBusiness: { type: String, default: null, trim: true },
    loanAmount: { type: String, default: null, trim: true },
    loanPurpose: { type: String, default: null, trim: true },
    tenure: { type: String, default: null, trim: true },
    insuranceCategory: { type: String, default: null, trim: true },
    insurancePlan: { type: String, default: null, trim: true },
    coverageAmount: { type: String, default: null, trim: true },
    policyTerm: { type: String, default: null, trim: true },
    insurancePurpose: { type: String, default: null, trim: true },
    existingPolicyProvider: { type: String, default: null, trim: true },
    notes: { type: String, default: null, trim: true },
    panNumber: { type: String, default: null },
    gstNumber: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true, bufferCommands: false },
);

const activityLogSchema = new Schema(
  {
    userId: { type: String, default: null },
    action: { type: String, required: true, trim: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, bufferCommands: false },
);

type UserDocument = InferSchemaType<typeof userSchema>;
type SubmissionDocument = InferSchemaType<typeof submissionSchema>;
type ActivityLogDocument = InferSchemaType<typeof activityLogSchema>;

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
const SubmissionModel =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
const ActivityLogModel =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", activityLogSchema);

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  applicationType: "loan" | "insurance";
  userId: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string;
  businessName: string | null;
  businessType: string | null;
  annualTurnover: string | null;
  yearsInBusiness: string | null;
  loanAmount: string | null;
  loanPurpose: string | null;
  tenure: string | null;
  insuranceCategory: string | null;
  insurancePlan: string | null;
  coverageAmount: string | null;
  policyTerm: string | null;
  insurancePurpose: string | null;
  existingPolicyProvider: string | null;
  notes: string | null;
  panNumber: string | null;
  gstNumber: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "user" | "admin";
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  role?: "user" | "admin";
}

export interface CreateSubmissionInput {
  applicationType: "loan" | "insurance";
  userId?: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string;
  businessName?: string | null;
  businessType?: string | null;
  annualTurnover?: string | null;
  yearsInBusiness?: string | null;
  loanAmount?: string | null;
  loanPurpose?: string | null;
  tenure?: string | null;
  insuranceCategory?: string | null;
  insurancePlan?: string | null;
  coverageAmount?: string | null;
  policyTerm?: string | null;
  insurancePurpose?: string | null;
  existingPolicyProvider?: string | null;
  notes?: string | null;
  panNumber?: string | null;
  gstNumber?: string | null;
  status?: "pending" | "approved" | "rejected";
}

export interface CreateActivityLogInput {
  userId?: string | null;
  action: string;
  data?: Record<string, unknown>;
}

const serializeUser = (user: any): User => ({
  id: user._id.toString(),
  name: user.name || "",
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const serializeSubmission = (submission: any): Submission => ({
  id: submission._id.toString(),
  applicationType: submission.applicationType || "loan",
  userId: submission.userId || null,
  name: submission.name,
  mobile: submission.mobile,
  email: submission.email,
  city: submission.city,
  businessName: submission.businessName || null,
  businessType: submission.businessType || null,
  annualTurnover: submission.annualTurnover || null,
  yearsInBusiness: submission.yearsInBusiness || null,
  loanAmount: submission.loanAmount || null,
  loanPurpose: submission.loanPurpose || null,
  tenure: submission.tenure || null,
  insuranceCategory: submission.insuranceCategory || null,
  insurancePlan: submission.insurancePlan || null,
  coverageAmount: submission.coverageAmount || null,
  policyTerm: submission.policyTerm || null,
  insurancePurpose: submission.insurancePurpose || null,
  existingPolicyProvider: submission.existingPolicyProvider || null,
  notes: submission.notes || null,
  panNumber: submission.panNumber || null,
  gstNumber: submission.gstNumber || null,
  status: submission.status,
  createdAt: submission.createdAt.toISOString(),
  updatedAt: submission.updatedAt.toISOString(),
});

const serializeActivityLog = (log: any): ActivityLog => ({
  id: log._id.toString(),
  userId: log.userId || null,
  action: log.action,
  data: log.data || {},
  createdAt: log.createdAt.toISOString(),
  updatedAt: log.updatedAt.toISOString(),
});

export interface IStorage {
  ensureAdminUser(): Promise<void>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  createUser(user: CreateUserInput): Promise<User>;
  updateUser(id: string, updates: UpdateUserInput): Promise<User | null>;
  verifyUser(email: string, password: string): Promise<User | null>;
  createPasswordResetToken(
    email: string,
  ): Promise<{ user: User; token: string } | null>;
  resetPasswordWithToken(token: string, password: string): Promise<User | null>;
  getSubmissions(): Promise<Submission[]>;
  getSubmissionsByUser(userId: string): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | null>;
  createSubmission(submission: CreateSubmissionInput): Promise<Submission>;
  updateSubmissionStatus(
    id: string,
    status: Submission["status"],
  ): Promise<Submission | null>;
  createActivityLog(log: CreateActivityLogInput): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  private async ensureReady(): Promise<void> {
    await connectMongo();
  }

  private hashResetToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async ensureAdminUser(): Promise<void> {
    await this.ensureReady();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existing = await UserModel.findOne({ email: adminEmail });
    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
      }
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await UserModel.create({
      name: process.env.ADMIN_NAME?.trim() || "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
  }

  async getUser(id: string): Promise<User | null> {
    await this.ensureReady();
    const user = await UserModel.findById(id).lean();
    return user ? serializeUser(user) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureReady();
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    return user ? serializeUser(user) : null;
  }

  async getUsers(): Promise<User[]> {
    await this.ensureReady();
    const users = await UserModel.find().sort({ email: 1 }).lean();
    return users.map(serializeUser);
  }

  async createUser(user: CreateUserInput): Promise<User> {
    await this.ensureReady();
    const passwordHash = await bcrypt.hash(user.password, 10);
    const created = await UserModel.create({
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      phone: user.phone?.trim() || "",
      passwordHash,
      role: user.role || "user",
    });
    return serializeUser(created);
  }

  async updateUser(id: string, updates: UpdateUserInput): Promise<User | null> {
    await this.ensureReady();
    const updated = await UserModel.findByIdAndUpdate(
      id,
      {
        ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
        ...(updates.role !== undefined ? { role: updates.role } : {}),
      },
      { new: true },
    );
    return updated ? serializeUser(updated) : null;
  }

  async verifyUser(email: string, password: string): Promise<User | null> {
    await this.ensureReady();
    const user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
    }).lean();
    if (!user) {
      console.log(`[STORAGE] ❌ User not found: ${email}`);
      return null;
    }

    console.log(`[STORAGE] 🔍 User found: ${user.email}, Role: ${user.role}`);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      console.log(`[STORAGE] ❌ Password mismatch for ${user.email}`);
      return null;
    }

    console.log(`[STORAGE] ✅ Password verified for ${user.email}`);
    return serializeUser(user);
  }

  async createPasswordResetToken(
    email: string,
  ): Promise<{ user: User; token: string } | null> {
    await this.ensureReady();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return null;
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = this.hashResetToken(token);
    user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    return { user: serializeUser(user), token };
  }

  async resetPasswordWithToken(
    token: string,
    password: string,
  ): Promise<User | null> {
    await this.ensureReady();
    const tokenHash = this.hashResetToken(token);
    const user = await UserModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return null;
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return serializeUser(user);
  }

  async getSubmissions(): Promise<Submission[]> {
    await this.ensureReady();
    const rows = await SubmissionModel.find().sort({ createdAt: -1 });
    return rows.map(serializeSubmission);
  }

  async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    await this.ensureReady();
    const rows = await SubmissionModel.find({ userId }).sort({ createdAt: -1 });
    return rows.map(serializeSubmission);
  }

  async getSubmission(id: string): Promise<Submission | null> {
    await this.ensureReady();
    const submission = await SubmissionModel.findById(id);
    return submission ? serializeSubmission(submission) : null;
  }

  async createSubmission(
    submission: CreateSubmissionInput,
  ): Promise<Submission> {
    await this.ensureReady();
    const created = await SubmissionModel.create({
      ...submission,
      userId: submission.userId || null,
      businessName: submission.businessName || null,
      businessType: submission.businessType || null,
      annualTurnover: submission.annualTurnover || null,
      yearsInBusiness: submission.yearsInBusiness || null,
      loanAmount: submission.loanAmount || null,
      loanPurpose: submission.loanPurpose || null,
      tenure: submission.tenure || null,
      insuranceCategory: submission.insuranceCategory || null,
      insurancePlan: submission.insurancePlan || null,
      coverageAmount: submission.coverageAmount || null,
      policyTerm: submission.policyTerm || null,
      insurancePurpose: submission.insurancePurpose || null,
      existingPolicyProvider: submission.existingPolicyProvider || null,
      notes: submission.notes || null,
      panNumber: submission.panNumber || null,
      gstNumber: submission.gstNumber || null,
      status: submission.status || "pending",
    });
    return serializeSubmission(created);
  }

  async updateSubmissionStatus(
    id: string,
    status: Submission["status"],
  ): Promise<Submission | null> {
    await this.ensureReady();
    const updated = await SubmissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    return updated ? serializeSubmission(updated) : null;
  }

  async createActivityLog(log: CreateActivityLogInput): Promise<ActivityLog> {
    await this.ensureReady();
    const created = await ActivityLogModel.create({
      userId: log.userId || null,
      action: log.action,
      data: log.data || {},
    });
    return serializeActivityLog(created);
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    await this.ensureReady();
    const rows = await ActivityLogModel.find().sort({ createdAt: -1 });
    return rows.map(serializeActivityLog);
  }
}

export const storage = new DatabaseStorage();
