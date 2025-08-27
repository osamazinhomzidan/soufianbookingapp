import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { generateToken, verifyToken, JWTPayload } from './jwt';

const prisma = new PrismaClient();

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'OWNER' | 'STAFF';
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { username, password } = credentials;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid username or password',
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid username or password',
      };
    }

    // Generate JWT token
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    // Return user data (without password)
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
    };

    return {
      success: true,
      user: authUser,
      token,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'An error occurred during authentication',
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Verify JWT token and get user data
 */
export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get fresh user data from database
    const user = await getUserById(payload.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Create a new staff user (only for owners)
 */
export async function createStaffUser(userData: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}): Promise<AuthResponse> {
  try {
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email },
        ],
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Username or email already exists',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: 'STAFF',
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
      },
    });

    return {
      success: true,
      user: newUser,
      message: 'Staff user created successfully',
    };
  } catch (error) {
    console.error('Error creating staff user:', error);
    return {
      success: false,
      message: 'An error occurred while creating the user',
    };
  }
}

/**
 * Update user active status
 */
export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
}

/**
 * Get all staff users (for owner management)
 */
export async function getAllStaffUsers(): Promise<AuthUser[]> {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'STAFF' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  } catch (error) {
    console.error('Error fetching staff users:', error);
    return [];
  }
}