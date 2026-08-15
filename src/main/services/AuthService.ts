import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

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
    return { success: true, user: safeUser };
  }
}
