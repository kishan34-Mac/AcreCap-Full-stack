import bcrypt from "bcryptjs";
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const submissionSchema = new Schema(
  {
    userId: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, required: true, trim: true },
    annualTurnover: { type: String, required: true, trim: true },
    yearsInBusiness: { type: String, required: true, trim: true },
    loanAmount: { type: String, required: true, trim: true },
    loanPurpose: { type: String, required: true, trim: true },
    tenure: { type: String, required: true, trim: true },
    panNumber: { type: String, default: null },
    gstNumber: { type: String, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const activityLogSchema = new Schema(
  {
    userId: { type: String, default: null },
    action: { type: String, required: true, trim: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

type UserDocument = InferSchemaType<typeof userSchema>;
type SubmissionDocument = InferSchemaType<typeof submissionSchema>;
type ActivityLogDocument = InferSchemaType<typeof activityLogSchema>;

const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
const SubmissionModel =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
const ActivityLogModel =
  mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);

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
  userId: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string;
  businessName: string;
  businessType: string;
  annualTurnover: string;
  yearsInBusiness: string;
  loanAmount: string;
  loanPurpose: string;
  tenure: string;
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
  userId?: string | null;
  name: string;
  mobile: string;
  email: string;
  city: string;
  businessName: string;
  businessType: string;
  annualTurnover: string;
  yearsInBusiness: string;
  loanAmount: string;
  loanPurpose: string;
  tenure: string;
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
  userId: submission.userId || null,
  name: submission.name,
  mobile: submission.mobile,
  email: submission.email,
  city: submission.city,
  businessName: submission.businessName,
  businessType: submission.businessType,
  annualTurnover: submission.annualTurnover,
  yearsInBusiness: submission.yearsInBusiness,
  loanAmount: submission.loanAmount,
  loanPurpose: submission.loanPurpose,
  tenure: submission.tenure,
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
  getSubmissions(): Promise<Submission[]>;
  getSubmissionsByUser(userId: string): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | null>;
  createSubmission(submission: CreateSubmissionInput): Promise<Submission>;
  updateSubmissionStatus(id: string, status: Submission["status"]): Promise<Submission | null>;
  createActivityLog(log: CreateActivityLogInput): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;
}

export class DatabaseStorage implements IStorage {
  async ensureAdminUser(): Promise<void> {
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
    const user = await UserModel.findById(id);
    return user ? serializeUser(user) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? serializeUser(user) : null;
  }

  async getUsers(): Promise<User[]> {
    const users = await UserModel.find().sort({ email: 1 });
    return users.map(serializeUser);
  }

  async createUser(user: CreateUserInput): Promise<User> {
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
    const updated = await UserModel.findByIdAndUpdate(
      id,
      {
        ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
        ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
        ...(updates.role !== undefined ? { role: updates.role } : {}),
      },
      { new: true }
    );
    return updated ? serializeUser(updated) : null;
  }

  async verifyUser(email: string, password: string): Promise<User | null> {
    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? serializeUser(user) : null;
  }

  async getSubmissions(): Promise<Submission[]> {
    const rows = await SubmissionModel.find().sort({ createdAt: -1 });
    return rows.map(serializeSubmission);
  }

  async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    const rows = await SubmissionModel.find({ userId }).sort({ createdAt: -1 });
    return rows.map(serializeSubmission);
  }

  async getSubmission(id: string): Promise<Submission | null> {
    const submission = await SubmissionModel.findById(id);
    return submission ? serializeSubmission(submission) : null;
  }

  async createSubmission(submission: CreateSubmissionInput): Promise<Submission> {
    const created = await SubmissionModel.create({
      ...submission,
      userId: submission.userId || null,
      panNumber: submission.panNumber || null,
      gstNumber: submission.gstNumber || null,
      status: submission.status || "pending",
    });
    return serializeSubmission(created);
  }

  async updateSubmissionStatus(id: string, status: Submission["status"]): Promise<Submission | null> {
    const updated = await SubmissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return updated ? serializeSubmission(updated) : null;
  }

  async createActivityLog(log: CreateActivityLogInput): Promise<ActivityLog> {
    const created = await ActivityLogModel.create({
      userId: log.userId || null,
      action: log.action,
      data: log.data || {},
    });
    return serializeActivityLog(created);
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    const rows = await ActivityLogModel.find().sort({ createdAt: -1 });
    return rows.map(serializeActivityLog);
  }
}

export const storage = new DatabaseStorage();
