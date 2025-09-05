import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/users - Get all users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyAuthToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is OWNER
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Owner privileges required.' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search and filters
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    
    if (role && (role === 'OWNER' || role === 'STAFF')) {
      whereClause.role = role;
    }
    
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      whereClause.isActive = isActive === 'true';
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              createdBookings: true,
              createdHotels: true,
              createdRooms: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyAuthToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is OWNER
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Owner privileges required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, email, password, role, firstName, lastName, phone, isActive } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate input types
    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid input format' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      if (typeof email !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate role
    if (role && role !== 'OWNER' && role !== 'STAFF') {
      return NextResponse.json(
        { success: false, message: 'Invalid role. Must be OWNER or STAFF' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists (only if email is provided)
    if (email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmailUser) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'STAFF',
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        isActive: isActive !== undefined ? isActive : true,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Bulk delete users
export async function DELETE(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const user = await verifyAuthToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is OWNER
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Owner privileges required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User IDs array is required' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userIds.includes(user.id)) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if users exist and get their details
    const usersToDelete = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        username: true,
        role: true,
        _count: {
          select: {
            createdBookings: true,
            createdHotels: true,
            createdRooms: true,
          },
        },
      },
    });

    if (usersToDelete.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid users found to delete' },
        { status: 404 }
      );
    }

    // Check for users with dependencies
    const usersWithDependencies = usersToDelete.filter(
      u => u._count.createdBookings > 0 || u._count.createdHotels > 0 || u._count.createdRooms > 0
    );

    if (usersWithDependencies.length > 0) {
      const usernames = usersWithDependencies.map(u => u.username).join(', ');
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete users with existing data: ${usernames}. Please transfer or delete their associated records first.` 
        },
        { status: 409 }
      );
    }

    // Delete users
    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} user(s)`,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error('Error deleting users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}