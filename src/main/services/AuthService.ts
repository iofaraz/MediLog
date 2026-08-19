import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { AuditService } from './AuditService';

export class AuthService {
  // Uses scrypt to hash passwords (salt:hash format)
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derivedKey}`;
  }

  static verifyPassword(password: string, hash: string): boolean {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  static async setupDefaultAdmin() {
    const adminExists = await db.select().from(users).where(eq(users.username, 'admin'));
    if (adminExists.length === 0) {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        username: 'admin',
        passwordHash: this.hashPassword('admin123'),
        role: 'admin',
        name: 'Administrator',
        createdAt: new Date(),
      });
      console.log('Default admin user created.');
    }
  }

  static async login(username: string, password: string) {
    const user = await db.select().from(users).where(eq(users.username, username)).get();
    
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const isValid = this.verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Exclude password hash from returned user object
    const { passwordHash: _passwordHash, ...safeUser } = user;
    
    await AuditService.log({
      userId: safeUser.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: safeUser.id,
      details: 'User logged in'
    });

    return { success: true, user: safeUser };
  }

  static async getAllUsers() {
    try {
      const allUsers = await db.select().from(users);
      const safeUsers = allUsers.map(({ passwordHash: _pw, ...u }) => u);
      return { success: true, data: safeUsers };
    } catch (error) {
      console.error('Failed to get users:', error);
      return { success: false, error: 'Failed to retrieve users' };
    }
  }

  static async createUser(data: any, adminId: string) {
    try {
      const newId = crypto.randomUUID();
      await db.insert(users).values({
        id: newId,
        username: data.username,
        passwordHash: this.hashPassword(data.password),
        role: data.role,
        name: data.name,
        createdAt: new Date(),
      });

      await AuditService.log({
        userId: adminId,
        action: 'CREATE',
        entityType: 'USER',
        entityId: newId,
        details: `Created user ${data.username}`
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to create user:', error);
      // Basic unique constraint error handling
      if (error.message?.includes('UNIQUE')) {
        return { success: false, error: 'Username already exists' };
      }
      return { success: false, error: 'Failed to create user' };
    }
  }

  static async updateUser(id: string, data: any, adminId: string) {
    try {
      const updateData: any = {
        name: data.name,
        role: data.role,
      };

      if (data.password && data.password.trim() !== '') {
        updateData.passwordHash = this.hashPassword(data.password);
      }

      await db.update(users).set(updateData).where(eq(users.id, id));

      await AuditService.log({
        userId: adminId,
        action: 'UPDATE',
        entityType: 'USER',
        entityId: id,
        details: `Updated user profile/credentials`
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  static async deleteUser(id: string, adminId: string) {
    try {
      const targetUser = await db.select().from(users).where(eq(users.id, id)).get();
      if (!targetUser) {
        return { success: false, error: 'User not found' };
      }

      if (targetUser.username === 'admin') {
        return { success: false, error: 'Cannot delete the master admin account' };
      }

      await db.delete(users).where(eq(users.id, id));

      await AuditService.log({
        userId: adminId,
        action: 'DELETE',
        entityType: 'USER',
        entityId: id,
        details: `Deleted user ${targetUser.username}`
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }
}
