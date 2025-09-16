import { 
  Admin as AdminType, InsertAdmin,
  Token as TokenType, InsertToken,
  Reseller as ResellerType, InsertReseller,
  Key as KeyType, InsertKey, 
  Device as DeviceType, InsertDevice,
  OnlineUpdate as OnlineUpdateType, InsertOnlineUpdate, UpdateOnlineUpdate
} from "@shared/schema";
import { nanoid } from "nanoid";
import { IStorage } from "./storage";

// Import MongoDB models
import { Admin, IAdmin } from "./models/Admin";
import { Reseller, IReseller } from "./models/Reseller";
import { Key, IKey } from "./models/Key";
import { Token, IToken } from "./models/Token";
import { Device, IDevice } from "./models/Device";
import { OnlineUpdate, IOnlineUpdate } from "./models/OnlineUpdate";
import { OTP, IOTP } from "./models/OTP";

export class MongoDBStorage implements IStorage {
  private adminIdCounter: number = 1;
  private tokenIdCounter: number = 1;
  private resellerIdCounter: number = 1;
  private keyIdCounter: number = 1;
  private deviceIdCounter: number = 1;
  private onlineUpdateIdCounter: number = 1;
  private otpIdCounter: number = 1;

  constructor() {
    this.initializeCounters();
  }

  private async initializeCounters(): Promise<void> {
    try {
      // Initialize ID counters based on existing data
      const [lastAdmin, lastToken, lastReseller, lastKey, lastDevice, lastUpdate, lastOTP] = await Promise.all([
        Admin.findOne().sort({ id: -1 }),
        Token.findOne().sort({ id: -1 }),
        Reseller.findOne().sort({ id: -1 }),
        Key.findOne().sort({ id: -1 }),
        Device.findOne().sort({ id: -1 }),
        OnlineUpdate.findOne().sort({ id: -1 }),
        OTP.findOne().sort({ id: -1 })
      ]);

      this.adminIdCounter = lastAdmin ? lastAdmin.id + 1 : 1;
      this.tokenIdCounter = lastToken ? lastToken.id + 1 : 1;
      this.resellerIdCounter = lastReseller ? lastReseller.id + 1 : 1;
      this.keyIdCounter = lastKey ? lastKey.id + 1 : 1;
      this.deviceIdCounter = lastDevice ? lastDevice.id + 1 : 1;
      this.onlineUpdateIdCounter = lastUpdate ? lastUpdate.id + 1 : 1;
      this.otpIdCounter = lastOTP ? lastOTP.id + 1 : 1;

      console.log('✅ MongoDB Storage counters initialized');
    } catch (error) {
      console.error('❌ Error initializing counters:', error);
    }
  }

  // Admin methods
  async getAdmin(id: number): Promise<AdminType | undefined> {
    try {
      const admin = await Admin.findOne({ id });
      return admin ? this.convertAdminDoc(admin) : undefined;
    } catch (error) {
      console.error('Error getting admin:', error);
      return undefined;
    }
  }

  async getAdminByUsername(username: string): Promise<AdminType | undefined> {
    try {
      const admin = await Admin.findOne({ username });
      return admin ? this.convertAdminDoc(admin) : undefined;
    } catch (error) {
      console.error('Error getting admin by username:', error);
      return undefined;
    }
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<AdminType> {
    try {
      const admin = new Admin({
        id: this.adminIdCounter++,
        username: insertAdmin.username,
        password: insertAdmin.password
      });
      
      await admin.save();
      return this.convertAdminDoc(admin);
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  // Token methods
  async createToken(credits: number = 0): Promise<TokenType> {
    try {
      const tokenString = `REF-${nanoid(10).toUpperCase()}`;
      const token = new Token({
        id: this.tokenIdCounter++,
        token: tokenString,
        createdAt: new Date(),
        usedBy: null,
        isUsed: false,
        credits
      });
      
      await token.save();
      return this.convertTokenDoc(token);
    } catch (error) {
      console.error('Error creating token:', error);
      throw error;
    }
  }

  async getAllTokens(): Promise<TokenType[]> {
    try {
      const tokens = await Token.find().sort({ createdAt: -1 });
      return tokens.map(this.convertTokenDoc);
    } catch (error) {
      console.error('Error getting all tokens:', error);
      return [];
    }
  }

  async getToken(tokenString: string): Promise<TokenType | undefined> {
    try {
      const token = await Token.findOne({ token: tokenString });
      return token ? this.convertTokenDoc(token) : undefined;
    } catch (error) {
      console.error('Error getting token:', error);
      return undefined;
    }
  }

  async useToken(tokenString: string, username: string): Promise<TokenType | undefined> {
    try {
      const token = await Token.findOneAndUpdate(
        { token: tokenString, isUsed: false },
        { isUsed: true, usedBy: username },
        { new: true }
      );
      return token ? this.convertTokenDoc(token) : undefined;
    } catch (error) {
      console.error('Error using token:', error);
      return undefined;
    }
  }

  // Reseller methods
  async getReseller(id: number): Promise<ResellerType | undefined> {
    try {
      const reseller = await Reseller.findOne({ id });
      return reseller ? this.convertResellerDoc(reseller) : undefined;
    } catch (error) {
      console.error('Error getting reseller:', error);
      return undefined;
    }
  }

  async getResellerByUsername(username: string): Promise<ResellerType | undefined> {
    try {
      const reseller = await Reseller.findOne({ username });
      return reseller ? this.convertResellerDoc(reseller) : undefined;
    } catch (error) {
      console.error('Error getting reseller by username:', error);
      return undefined;
    }
  }

  async createReseller(insertReseller: InsertReseller & { credits?: number }): Promise<ResellerType> {
    try {
      const reseller = new Reseller({
        id: this.resellerIdCounter++,
        username: insertReseller.username,
        password: insertReseller.password,
        credits: insertReseller.credits || 0,
        registrationDate: new Date(),
        isActive: true,
        referralToken: insertReseller.referralToken
      });
      
      await reseller.save();
      return this.convertResellerDoc(reseller);
    } catch (error) {
      console.error('Error creating reseller:', error);
      throw error;
    }
  }

  async getAllResellers(): Promise<ResellerType[]> {
    try {
      const resellers = await Reseller.find().sort({ registrationDate: -1 });
      return resellers.map(this.convertResellerDoc);
    } catch (error) {
      console.error('Error getting all resellers:', error);
      return [];
    }
  }

  async updateResellerCredits(id: number, amount: number): Promise<ResellerType | undefined> {
    try {
      const reseller = await Reseller.findOneAndUpdate(
        { id },
        { $inc: { credits: amount } },
        { new: true }
      );
      return reseller ? this.convertResellerDoc(reseller) : undefined;
    } catch (error) {
      console.error('Error updating reseller credits:', error);
      return undefined;
    }
  }

  async updateResellerStatus(id: number, isActive: boolean): Promise<ResellerType | undefined> {
    try {
      const reseller = await Reseller.findOneAndUpdate(
        { id },
        { isActive },
        { new: true }
      );
      return reseller ? this.convertResellerDoc(reseller) : undefined;
    } catch (error) {
      console.error('Error updating reseller status:', error);
      return undefined;
    }
  }

  // Key methods
  async createKey(insertKey: InsertKey): Promise<KeyType> {
    try {
      const key = new Key({
        id: this.keyIdCounter++,
        keyString: insertKey.keyString,
        game: insertKey.game,
        resellerId: insertKey.resellerId,
        createdAt: new Date(),
        expiryDate: insertKey.expiryDate,
        deviceLimit: insertKey.deviceLimit,
        isRevoked: false
      });
      
      await key.save();
      return this.convertKeyDoc(key);
    } catch (error) {
      console.error('Error creating key:', error);
      throw error;
    }
  }

  async getKey(keyString: string): Promise<KeyType | undefined> {
    try {
      const key = await Key.findOne({ keyString });
      return key ? this.convertKeyDoc(key) : undefined;
    } catch (error) {
      console.error('Error getting key:', error);
      return undefined;
    }
  }

  async getKeysByResellerId(resellerId: number): Promise<KeyType[]> {
    try {
      const keys = await Key.find({ resellerId }).sort({ createdAt: -1 });
      return keys.map(this.convertKeyDoc);
    } catch (error) {
      console.error('Error getting keys by reseller ID:', error);
      return [];
    }
  }

  async getAllKeys(): Promise<KeyType[]> {
    try {
      const keys = await Key.find().sort({ createdAt: -1 });
      return keys.map(this.convertKeyDoc);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async revokeKey(keyId: number): Promise<KeyType | undefined> {
    try {
      const key = await Key.findOneAndUpdate(
        { id: keyId },
        { isRevoked: true },
        { new: true }
      );
      return key ? this.convertKeyDoc(key) : undefined;
    } catch (error) {
      console.error('Error revoking key:', error);
      return undefined;
    }
  }

  // Device methods
  async addDevice(insertDevice: InsertDevice): Promise<DeviceType> {
    try {
      const device = new Device({
        id: this.deviceIdCounter++,
        keyId: insertDevice.keyId,
        deviceId: insertDevice.deviceId,
        firstConnected: new Date()
      });
      
      await device.save();
      return this.convertDeviceDoc(device);
    } catch (error) {
      console.error('Error adding device:', error);
      throw error;
    }
  }

  async getDevicesByKeyId(keyId: number): Promise<DeviceType[]> {
    try {
      const devices = await Device.find({ keyId }).sort({ firstConnected: -1 });
      return devices.map(this.convertDeviceDoc);
    } catch (error) {
      console.error('Error getting devices by key ID:', error);
      return [];
    }
  }

  async removeDevice(deviceId: string, keyId: number): Promise<boolean> {
    try {
      const result = await Device.deleteOne({ deviceId, keyId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error removing device:', error);
      return false;
    }
  }

  // Online update methods
  async createOnlineUpdate(insertUpdate: InsertOnlineUpdate): Promise<OnlineUpdateType> {
    try {
      const now = new Date();
      const update = new OnlineUpdate({
        id: this.onlineUpdateIdCounter++,
        title: insertUpdate.title,
        message: insertUpdate.message,
        buttonText: insertUpdate.buttonText || null,
        linkUrl: insertUpdate.linkUrl || null,
        isActive: insertUpdate.isActive ?? true,
        createdAt: now,
        updatedAt: now
      });
      
      await update.save();
      return this.convertOnlineUpdateDoc(update);
    } catch (error) {
      console.error('Error creating online update:', error);
      throw error;
    }
  }

  async getAllOnlineUpdates(): Promise<OnlineUpdateType[]> {
    try {
      const updates = await OnlineUpdate.find().sort({ createdAt: -1 });
      return updates.map(this.convertOnlineUpdateDoc);
    } catch (error) {
      console.error('Error getting all online updates:', error);
      return [];
    }
  }

  async getOnlineUpdate(id: number): Promise<OnlineUpdateType | undefined> {
    try {
      const update = await OnlineUpdate.findOne({ id });
      return update ? this.convertOnlineUpdateDoc(update) : undefined;
    } catch (error) {
      console.error('Error getting online update:', error);
      return undefined;
    }
  }

  async updateOnlineUpdate(id: number, updateData: Partial<UpdateOnlineUpdate>): Promise<OnlineUpdateType | undefined> {
    try {
      const update = await OnlineUpdate.findOneAndUpdate(
        { id },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
      return update ? this.convertOnlineUpdateDoc(update) : undefined;
    } catch (error) {
      console.error('Error updating online update:', error);
      return undefined;
    }
  }

  async deleteOnlineUpdate(id: number): Promise<boolean> {
    try {
      const result = await OnlineUpdate.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting online update:', error);
      return false;
    }
  }

  async getActiveOnlineUpdates(): Promise<OnlineUpdateType[]> {
    try {
      const updates = await OnlineUpdate.find({ isActive: true }).sort({ createdAt: -1 });
      return updates.map(this.convertOnlineUpdateDoc);
    } catch (error) {
      console.error('Error getting active online updates:', error);
      return [];
    }
  }

  // Stats methods
  async getStats(): Promise<{ totalResellers: number; activeKeys: number; availableTokens: number; }> {
    try {
      const now = new Date();
      const [totalResellers, activeKeys, availableTokens] = await Promise.all([
        Reseller.countDocuments(),
        Key.countDocuments({ isRevoked: false, expiryDate: { $gt: now } }),
        Token.countDocuments({ isUsed: false })
      ]);

      return {
        totalResellers,
        activeKeys,
        availableTokens
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { totalResellers: 0, activeKeys: 0, availableTokens: 0 };
    }
  }

  // Document conversion methods
  private convertAdminDoc(doc: IAdmin): AdminType {
    return {
      id: doc.id,
      username: doc.username,
      password: doc.password,
      email: doc.email
    };
  }

  private convertTokenDoc(doc: IToken): TokenType {
    return {
      id: doc.id,
      token: doc.token,
      createdAt: doc.createdAt,
      usedBy: doc.usedBy,
      isUsed: doc.isUsed,
      credits: doc.credits
    };
  }

  private convertResellerDoc(doc: IReseller): ResellerType {
    return {
      id: doc.id,
      username: doc.username,
      password: doc.password,
      credits: doc.credits,
      registrationDate: doc.registrationDate,
      isActive: doc.isActive,
      referralToken: doc.referralToken
    };
  }

  private convertKeyDoc(doc: IKey): KeyType {
    return {
      id: doc.id,
      keyString: doc.keyString,
      game: doc.game,
      resellerId: doc.resellerId,
      createdAt: doc.createdAt,
      expiryDate: doc.expiryDate,
      deviceLimit: doc.deviceLimit,
      isRevoked: doc.isRevoked
    };
  }

  private convertDeviceDoc(doc: IDevice): DeviceType {
    return {
      id: doc.id,
      keyId: doc.keyId,
      deviceId: doc.deviceId,
      firstConnected: doc.firstConnected
    };
  }

  private convertOnlineUpdateDoc(doc: IOnlineUpdate): OnlineUpdateType {
    return {
      id: doc.id,
      title: doc.title,
      message: doc.message,
      buttonText: doc.buttonText,
      linkUrl: doc.linkUrl,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  // Special method for password verification (since we can't expose hashed passwords)
  async verifyAdminPassword(username: string, password: string): Promise<boolean> {
    try {
      const admin = await Admin.findOne({ username });
      if (!admin) return false;
      return await admin.comparePassword(password);
    } catch (error) {
      console.error('Error verifying admin password:', error);
      return false;
    }
  }

  async verifyResellerPassword(username: string, password: string): Promise<boolean> {
    try {
      const reseller = await Reseller.findOne({ username });
      if (!reseller) return false;
      return await reseller.comparePassword(password);
    } catch (error) {
      console.error('Error verifying reseller password:', error);
      return false;
    }
  }

  // OTP methods
  async createOTP(adminId: number, otp: string): Promise<{ id: number; adminId: number; otp: string; expiresAt: Date; isUsed: boolean }> {
    try {
      const otpDoc = new OTP({
        id: this.otpIdCounter++,
        adminId,
        otp,
        isUsed: false,
        expiresAt: new Date(Date.now() + 60 * 1000) // 1 minute from now
      });
      
      await otpDoc.save();
      return {
        id: otpDoc.id,
        adminId: otpDoc.adminId,
        otp: otpDoc.otp,
        expiresAt: otpDoc.expiresAt,
        isUsed: otpDoc.isUsed
      };
    } catch (error) {
      console.error('Error creating OTP:', error);
      throw error;
    }
  }

  async getOTP(adminId: number, otp: string): Promise<{ id: number; adminId: number; otp: string; expiresAt: Date; isUsed: boolean } | undefined> {
    try {
      const otpDoc = await OTP.findOne({ adminId, otp });
      if (!otpDoc) return undefined;
      
      return {
        id: otpDoc.id,
        adminId: otpDoc.adminId,
        otp: otpDoc.otp,
        expiresAt: otpDoc.expiresAt,
        isUsed: otpDoc.isUsed
      };
    } catch (error) {
      console.error('Error getting OTP:', error);
      return undefined;
    }
  }

  async markOTPAsUsed(id: number): Promise<boolean> {
    try {
      const result = await OTP.findOneAndUpdate(
        { id },
        { isUsed: true },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Error marking OTP as used:', error);
      return false;
    }
  }

  async cleanupExpiredOTPs(): Promise<void> {
    try {
      await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
      console.log('✅ Expired OTPs cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up expired OTPs:', error);
    }
  }
}