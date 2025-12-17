import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  profiles,
  submissions,
  activityLogs,
  backups,
  type Profile,
  type InsertProfile,
  type Submission,
  type InsertSubmission,
  type ActivityLog,
  type InsertActivityLog,
  type Backup,
  type InsertBackup,
} from "@shared/schema";

export interface IStorage {
  getProfile(id: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | null>;
  upsertProfile(profile: InsertProfile & { id: string }): Promise<Profile>;

  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | null>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionStatus(id: string, status: string): Promise<Submission | null>;

  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(): Promise<ActivityLog[]>;

  createBackup(backup: InsertBackup): Promise<Backup>;
  getBackups(): Promise<Backup[]>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(id: string): Promise<Profile | null> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return profile || null;
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return profile || null;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [created] = await db.insert(profiles).values(profile).returning();
    return created;
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | null> {
    const [updated] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return updated || null;
  }

  async upsertProfile(profile: InsertProfile & { id: string }): Promise<Profile> {
    const existing = await this.getProfile(profile.id);
    if (existing) {
      const updated = await this.updateProfile(profile.id, profile);
      return updated!;
    }
    const [created] = await db.insert(profiles).values(profile).returning();
    return created;
  }

  async getSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }

  async getSubmission(id: string): Promise<Submission | null> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    return submission || null;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [created] = await db.insert(submissions).values(submission).returning();
    return created;
  }

  async updateSubmissionStatus(id: string, status: string): Promise<Submission | null> {
    const [updated] = await db
      .update(submissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return updated || null;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLogs).values(log).returning();
    return created;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
  }

  async createBackup(backup: InsertBackup): Promise<Backup> {
    const [created] = await db.insert(backups).values(backup).returning();
    return created;
  }

  async getBackups(): Promise<Backup[]> {
    return db.select().from(backups).orderBy(desc(backups.createdAt));
  }
}

export const storage = new DatabaseStorage();
