import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
});

export const insertAdminSchema = createInsertSchema(admins).pick({
  username: true,
  password: true,
  email: true,
});

// Referral token table
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedBy: text("used_by"),
  isUsed: boolean("is_used").default(false).notNull(),
  credits: integer("credits").default(0).notNull(),
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  token: true,
  credits: true,
});

// Reseller table
export const resellers = pgTable("resellers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  credits: integer("credits").default(0).notNull(),
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  referralToken: text("referral_token").notNull(),
});

export const insertResellerSchema = createInsertSchema(resellers).pick({
  username: true,
  password: true,
  referralToken: true,
});

// Game enum
export const gameEnum = z.enum(["PUBG MOBILE", "LAST ISLAND OF SURVIVAL", "STANDOFF2"]);
export type Game = z.infer<typeof gameEnum>;

// Key table
export const keys = pgTable("keys", {
  id: serial("id").primaryKey(),
  keyString: text("key_string").notNull().unique(),
  game: text("game").notNull(),
  resellerId: integer("reseller_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  deviceLimit: integer("device_limit").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
});

// Add transformations for proper type conversion
export const insertKeySchema = createInsertSchema(keys)
  .pick({
    keyString: true,
    game: true,
    resellerId: true,
    expiryDate: true,
    deviceLimit: true,
  })
  .extend({
    // Add days as an optional parameter
    days: z.number().positive().optional(),
  })
  .transform((data) => {
    // Convert deviceLimit to number if it's a string
    const deviceLimit = typeof data.deviceLimit === 'string' 
      ? parseInt(data.deviceLimit) 
      : data.deviceLimit;
    
    // Make sure expiryDate is a Date object
    let expiryDate = data.expiryDate;
    
    // If days is provided and expiryDate is not, calculate expiry date based on days
    if (data.days && !data.expiryDate) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + data.days);
    } else if (data.expiryDate) {
      // Otherwise ensure expiryDate is a Date object
      expiryDate = data.expiryDate instanceof Date 
        ? data.expiryDate 
        : new Date(data.expiryDate);
    } else {
      // Default to 30 days if neither is provided
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
    }
    
    // Remove days from final object
    const { days, ...restData } = data;
    
    return {
      ...restData,
      deviceLimit,
      expiryDate,
    };
  });

// Device table
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  keyId: integer("key_id").notNull(),
  deviceId: text("device_id").notNull(),
  firstConnected: timestamp("first_connected").defaultNow().notNull(),
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  keyId: true,
  deviceId: true,
});

// Key status enum
export const keyStatusEnum = z.enum(["ACTIVE", "EXPIRED", "REVOKED"]);
export type KeyStatus = z.infer<typeof keyStatusEnum>;

// Export types
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;

export type Reseller = typeof resellers.$inferSelect;
export type InsertReseller = z.infer<typeof insertResellerSchema>;

export type Key = typeof keys.$inferSelect;
export type InsertKey = z.infer<typeof insertKeySchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

// Schema for API verification
export const keyVerificationSchema = z.object({
  key: z.string().min(1, "License key is required"),
  deviceId: z.string().min(1, "Device ID is required"),
  game: gameEnum,
});

export type KeyVerification = z.infer<typeof keyVerificationSchema>;

// Schema for adding credits
export const addCreditsSchema = z.object({
  resellerId: z.number().positive(),
  amount: z.number().positive(),
});

export type AddCredits = z.infer<typeof addCreditsSchema>;

// Online update table
export const onlineUpdates = pgTable("online_updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  buttonText: text("button_text"),
  linkUrl: text("link_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Base schema without refinement for partial operations
const baseOnlineUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  message: z.string().min(1, "Message is required").max(500, "Message must be less than 500 characters"),
  buttonText: z.string().max(50, "Button text must be less than 50 characters").optional(),
  linkUrl: z.string().url("Must be a valid URL").optional(),
  isActive: z.boolean().default(true),
});

export const insertOnlineUpdateSchema = baseOnlineUpdateSchema.refine(data => {
  // If buttonText is provided, linkUrl should also be provided
  if (data.buttonText && !data.linkUrl) {
    return false;
  }
  return true;
}, {
  message: "Link URL is required when button text is provided",
  path: ["linkUrl"]
});

export const updateOnlineUpdateSchema = baseOnlineUpdateSchema.partial().extend({
  id: z.number().positive(),
}).refine(data => {
  // If buttonText is provided, linkUrl should also be provided (only when both are present)
  if (data.buttonText && !data.linkUrl) {
    return false;
  }
  return true;
}, {
  message: "Link URL is required when button text is provided",
  path: ["linkUrl"]
});

export type OnlineUpdate = typeof onlineUpdates.$inferSelect;
export type InsertOnlineUpdate = z.infer<typeof insertOnlineUpdateSchema>;
export type UpdateOnlineUpdate = z.infer<typeof updateOnlineUpdateSchema>;
