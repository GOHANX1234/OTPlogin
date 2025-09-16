import { 
  Admin, InsertAdmin, admins,
  Token, InsertToken, tokens,
  Reseller, InsertReseller, resellers,
  Key, InsertKey, keys, 
  Device, InsertDevice, devices,
  Game, keyStatusEnum, KeyStatus,
  OnlineUpdate, InsertOnlineUpdate, UpdateOnlineUpdate
} from "@shared/schema";
import { nanoid } from "nanoid";
import * as fs from 'fs';
import * as path from 'path';

export interface IStorage {
  // Admin methods
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // OTP methods
  createOTP(adminId: number, otp: string): Promise<{ id: number; adminId: number; otp: string; expiresAt: Date; isUsed: boolean }>;
  getOTP(adminId: number, otp: string): Promise<{ id: number; adminId: number; otp: string; expiresAt: Date; isUsed: boolean } | undefined>;
  markOTPAsUsed(id: number): Promise<boolean>;
  cleanupExpiredOTPs(): Promise<void>;
  
  // Token methods
  createToken(credits?: number): Promise<Token>;
  getAllTokens(): Promise<Token[]>;
  getToken(token: string): Promise<Token | undefined>;
  useToken(token: string, username: string): Promise<Token | undefined>;
  
  // Reseller methods
  getReseller(id: number): Promise<Reseller | undefined>;
  getResellerByUsername(username: string): Promise<Reseller | undefined>;
  createReseller(reseller: InsertReseller & { credits?: number }): Promise<Reseller>;
  getAllResellers(): Promise<Reseller[]>;
  updateResellerCredits(id: number, amount: number): Promise<Reseller | undefined>;
  updateResellerStatus(id: number, isActive: boolean): Promise<Reseller | undefined>;
  
  // Key methods
  createKey(key: InsertKey): Promise<Key>;
  getKey(keyString: string): Promise<Key | undefined>;
  getKeysByResellerId(resellerId: number): Promise<Key[]>;
  getAllKeys(): Promise<Key[]>;
  revokeKey(keyId: number): Promise<Key | undefined>;
  
  // Device methods
  addDevice(device: InsertDevice): Promise<Device>;
  getDevicesByKeyId(keyId: number): Promise<Device[]>;
  removeDevice(deviceId: string, keyId: number): Promise<boolean>;
  
  // Online update methods
  createOnlineUpdate(update: InsertOnlineUpdate): Promise<OnlineUpdate>;
  getAllOnlineUpdates(): Promise<OnlineUpdate[]>;
  getOnlineUpdate(id: number): Promise<OnlineUpdate | undefined>;
  updateOnlineUpdate(id: number, update: Partial<UpdateOnlineUpdate>): Promise<OnlineUpdate | undefined>;
  deleteOnlineUpdate(id: number): Promise<boolean>;
  getActiveOnlineUpdates(): Promise<OnlineUpdate[]>;
  
  // Stats
  getStats(): Promise<{
    totalResellers: number;
    activeKeys: number;
    availableTokens: number;
  }>;
}

export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private tokens: Map<number, Token>;
  private resellers: Map<number, Reseller>;
  private keys: Map<number, Key>;
  private devices: Map<number, Device>;
  private onlineUpdates: Map<number, OnlineUpdate>;
  
  private adminId: number = 1;
  private tokenId: number = 1;
  private resellerId: number = 1;
  private keyId: number = 1;
  private deviceId: number = 1;
  private onlineUpdateId: number = 1;

  constructor() {
    this.admins = new Map();
    this.tokens = new Map();
    this.resellers = new Map();
    this.keys = new Map();
    this.devices = new Map();
    this.onlineUpdates = new Map();
    
    // Create default admin
    this.createAdmin({
      username: "admin",
      password: "admin123"
    });
    
    // Load online updates from file if it exists
    this.loadOnlineUpdatesFromFile();
  }

  // Load online updates from JSON file on startup
  private loadOnlineUpdatesFromFile(): void {
    try {
      const filePath = path.join('.', 'data', 'online_updates.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const updates = JSON.parse(fileContent);
        
        if (Array.isArray(updates)) {
          updates.forEach((update: any) => {
            // Convert date strings back to Date objects
            const onlineUpdate: OnlineUpdate = {
              ...update,
              createdAt: new Date(update.createdAt),
              updatedAt: new Date(update.updatedAt)
            };
            
            this.onlineUpdates.set(onlineUpdate.id, onlineUpdate);
            
            // Update the ID counter to prevent conflicts
            if (onlineUpdate.id >= this.onlineUpdateId) {
              this.onlineUpdateId = onlineUpdate.id + 1;
            }
          });
          
          console.log(`Loaded ${updates.length} online updates from file`);
        }
      } else {
        console.log('No online updates file found, starting with empty updates');
      }
    } catch (error: any) {
      console.error(`Error loading online updates from file: ${error.message}`);
      // Continue with empty updates if loading fails
    }
  }

  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.adminId++;
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }

  // Token methods
  async createToken(credits: number = 0): Promise<Token> {
    const id = this.tokenId++;
    const tokenString = `REF-${nanoid(10).toUpperCase()}`;
    const token: Token = {
      id,
      token: tokenString,
      createdAt: new Date(),
      usedBy: null,
      isUsed: false,
      credits
    };
    this.tokens.set(id, token);
    return token;
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async getToken(tokenString: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(
      (token) => token.token === tokenString
    );
  }

  async useToken(tokenString: string, username: string): Promise<Token | undefined> {
    const token = await this.getToken(tokenString);
    if (token && !token.isUsed) {
      const updatedToken: Token = {
        ...token,
        isUsed: true,
        usedBy: username
      };
      this.tokens.set(token.id, updatedToken);
      return updatedToken;
    }
    return undefined;
  }

  // Reseller methods
  async getReseller(id: number): Promise<Reseller | undefined> {
    return this.resellers.get(id);
  }

  async getResellerByUsername(username: string): Promise<Reseller | undefined> {
    return Array.from(this.resellers.values()).find(
      (reseller) => reseller.username === username
    );
  }

  async createReseller(insertReseller: InsertReseller & { credits?: number }): Promise<Reseller> {
    const id = this.resellerId++;
    const reseller: Reseller = {
      ...insertReseller,
      id,
      credits: insertReseller.credits || 0,
      registrationDate: new Date(),
      isActive: true
    };
    this.resellers.set(id, reseller);
    
    // Create a personal JSON file for the reseller's keys
    try {
      // Check if a directory for storing reseller files exists, if not create it
      const resellerDirPath = path.join('.', 'data');
      if (!fs.existsSync(resellerDirPath)) {
        fs.mkdirSync(resellerDirPath, { recursive: true });
      }
      
      // Create a personal JSON file for the reseller with their username
      const filePath = path.join(resellerDirPath, `${reseller.username}.json`);
      const initialData = {
        resellerId: reseller.id,
        username: reseller.username,
        keys: []
      };
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      console.log(`Created key file for reseller: ${reseller.username}`);
    } catch (error: any) {
      console.error(`Error creating reseller file: ${error.message}`);
    }
    
    return reseller;
  }

  async getAllResellers(): Promise<Reseller[]> {
    return Array.from(this.resellers.values());
  }

  async updateResellerCredits(id: number, amount: number): Promise<Reseller | undefined> {
    const reseller = await this.getReseller(id);
    if (reseller) {
      const updatedReseller: Reseller = {
        ...reseller,
        credits: reseller.credits + amount
      };
      this.resellers.set(id, updatedReseller);
      return updatedReseller;
    }
    return undefined;
  }

  async updateResellerStatus(id: number, isActive: boolean): Promise<Reseller | undefined> {
    const reseller = await this.getReseller(id);
    if (reseller) {
      const updatedReseller: Reseller = {
        ...reseller,
        isActive
      };
      this.resellers.set(id, updatedReseller);
      return updatedReseller;
    }
    return undefined;
  }

  // Key methods
  async createKey(insertKey: InsertKey): Promise<Key> {
    const id = this.keyId++;
    const key: Key = {
      ...insertKey,
      id,
      createdAt: new Date(),
      isRevoked: false
    };
    this.keys.set(id, key);
    
    // Also save the key to the reseller's JSON file
    try {
      // Get the reseller to find their username
      const reseller = await this.getReseller(insertKey.resellerId);
      if (reseller) {
        const resellerDirPath = path.join('.', 'data');
        const filePath = path.join(resellerDirPath, `${reseller.username}.json`);
        
        // Read the current data
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Add the new key to the keys array
          data.keys.push({
            ...key,
            createdAt: key.createdAt.toISOString(),
            expiryDate: key.expiryDate.toISOString()
          });
          
          // Write the updated data back to the file
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log(`Added key to ${reseller.username}'s file: ${key.keyString}`);
        }
      }
    } catch (error: any) {
      console.error(`Error adding key to reseller file: ${error.message}`);
    }
    
    return key;
  }

  async getKey(keyString: string): Promise<Key | undefined> {
    return Array.from(this.keys.values()).find(
      (key) => key.keyString === keyString
    );
  }

  async getKeysByResellerId(resellerId: number): Promise<Key[]> {
    return Array.from(this.keys.values()).filter(
      (key) => key.resellerId === resellerId
    );
  }

  async getAllKeys(): Promise<Key[]> {
    return Array.from(this.keys.values());
  }

  async revokeKey(keyId: number): Promise<Key | undefined> {
    const key = this.keys.get(keyId);
    if (key) {
      const updatedKey: Key = {
        ...key,
        isRevoked: true
      };
      this.keys.set(keyId, updatedKey);
      return updatedKey;
    }
    return undefined;
  }

  // Device methods
  async addDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.deviceId++;
    const device: Device = {
      ...insertDevice,
      id,
      firstConnected: new Date()
    };
    this.devices.set(id, device);
    return device;
  }

  async getDevicesByKeyId(keyId: number): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(
      (device) => device.keyId === keyId
    );
  }

  async removeDevice(deviceId: string, keyId: number): Promise<boolean> {
    const device = Array.from(this.devices.values()).find(
      (d) => d.deviceId === deviceId && d.keyId === keyId
    );
    
    if (device) {
      this.devices.delete(device.id);
      return true;
    }
    
    return false;
  }

  // Online Update methods
  async createOnlineUpdate(insertUpdate: InsertOnlineUpdate): Promise<OnlineUpdate> {
    const id = this.onlineUpdateId++;
    const now = new Date();
    const update: OnlineUpdate = {
      ...insertUpdate,
      id,
      createdAt: now,
      updatedAt: now,
      buttonText: insertUpdate.buttonText ?? null,
      linkUrl: insertUpdate.linkUrl ?? null
    };
    this.onlineUpdates.set(id, update);
    
    // Save to JSON file for persistence
    await this.saveOnlineUpdatesToFile();
    
    return update;
  }

  async getAllOnlineUpdates(): Promise<OnlineUpdate[]> {
    return Array.from(this.onlineUpdates.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOnlineUpdate(id: number): Promise<OnlineUpdate | undefined> {
    return this.onlineUpdates.get(id);
  }

  async updateOnlineUpdate(id: number, updateData: Partial<UpdateOnlineUpdate>): Promise<OnlineUpdate | undefined> {
    const existingUpdate = this.onlineUpdates.get(id);
    if (existingUpdate) {
      const updatedUpdate: OnlineUpdate = {
        ...existingUpdate,
        ...updateData,
        id: existingUpdate.id, // Ensure id doesn't change
        createdAt: existingUpdate.createdAt, // Preserve creation date
        updatedAt: new Date()
      };
      this.onlineUpdates.set(id, updatedUpdate);
      
      // Save to JSON file for persistence
      await this.saveOnlineUpdatesToFile();
      
      return updatedUpdate;
    }
    return undefined;
  }

  async deleteOnlineUpdate(id: number): Promise<boolean> {
    const deleted = this.onlineUpdates.delete(id);
    if (deleted) {
      // Save to JSON file for persistence
      await this.saveOnlineUpdatesToFile();
    }
    return deleted;
  }

  async getActiveOnlineUpdates(): Promise<OnlineUpdate[]> {
    return Array.from(this.onlineUpdates.values())
      .filter(update => update.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private async saveOnlineUpdatesToFile(): Promise<void> {
    try {
      const dataDir = path.join('.', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const filePath = path.join(dataDir, 'online_updates.json');
      const updates = Array.from(this.onlineUpdates.values()).map(update => ({
        ...update,
        createdAt: update.createdAt.toISOString(),
        updatedAt: update.updatedAt.toISOString()
      }));
      
      fs.writeFileSync(filePath, JSON.stringify(updates, null, 2));
      console.log('Saved online updates to file');
    } catch (error: any) {
      console.error(`Error saving online updates to file: ${error.message}`);
    }
  }

  // Stats methods
  async getStats(): Promise<{ totalResellers: number; activeKeys: number; availableTokens: number; }> {
    const totalResellers = this.resellers.size;
    
    const now = new Date();
    const activeKeys = Array.from(this.keys.values()).filter(
      (key) => !key.isRevoked && new Date(key.expiryDate) > now
    ).length;
    
    const availableTokens = Array.from(this.tokens.values()).filter(
      (token) => !token.isUsed
    ).length;
    
    return {
      totalResellers,
      activeKeys,
      availableTokens
    };
  }

  // OTP methods (placeholder implementations - not used in MemStorage)
  async createOTP(adminId: number, otp: string): Promise<{ id: number; adminId: number; otp: string; expiresAt: Date; isUsed: boolean }> {
    throw new Error('OTP functionality not implemented in MemStorage');
  }

  async getOTP(adminId: number, otp: string): Promise<{ id: number; adminId: number; otp: string; expiresAt: Date; isUsed: boolean } | undefined> {
    throw new Error('OTP functionality not implemented in MemStorage');
  }

  async markOTPAsUsed(id: number): Promise<boolean> {
    throw new Error('OTP functionality not implemented in MemStorage');
  }

  async cleanupExpiredOTPs(): Promise<void> {
    throw new Error('OTP functionality not implemented in MemStorage');
  }
}

export const storage = new MemStorage();
