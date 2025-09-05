import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/users/[id] - Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user by ID
    const targetUser = await prisma.user.findUnique({
      where: { id },
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
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: targetUser,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, email, password, role, firstName, lastName, phone, isActive } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Validate input types if provided
    if (username !== undefined && typeof username !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid username format' },
        { status: 400 }
      );
    }

    if (email !== undefined && typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password !== undefined && typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid password format' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate role if provided
    if (role !== undefined && role !== 'OWNER' && role !== 'STAFF') {
      return NextResponse.json(
        { success: false, message: 'Invalid role. Must be OWNER or STAFF' },
        { status: 400 }
      );
    }

    // Validate password strength if provided
    if (password !== undefined && password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check for username/email conflicts if they're being changed
    if (username !== undefined || email !== undefined) {
      const conflictConditions = [];
      
      if (username !== undefined && username !== existingUser.username) {
        conflictConditions.push({ username });
      }
      
      if (email !== undefined && email !== existingUser.email) {
        conflictConditions.push({ email });
      }

      if (conflictConditions.length > 0) {
        const conflictingUser = await prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              { OR: conflictConditions },
            ],
          },
        });

        if (conflictingUser) {
          const field = conflictingUser.username === username ? 'Username' : 'Email';
          return NextResponse.json(
            { success: false, message: `${field} already exists` },
            { status: 409 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash password if provided
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Prevent self-role-change to non-OWNER if current user is the target
    if (id === user.id && role !== undefined && role !== 'OWNER') {
      return NextResponse.json(
        { success: false, message: 'Cannot change your own role from OWNER' },
        { status: 400 }
      );
    }

    // Prevent self-deactivation
    if (id === user.id && isActive === false) {
      return NextResponse.json(
        { success: false, message: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists and get dependencies
    const targetUser = await prisma.user.findUnique({
      where: { id },
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

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check for dependencies
    const hasDependencies = 
      targetUser._count.createdBookings > 0 ||
      targetUser._count.createdHotels > 0 ||
      targetUser._count.createdRooms > 0;

    if (hasDependencies) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot delete user '${targetUser.username}' because they have associated records. Please transfer or delete their bookings, hotels, and rooms first.`,
          dependencies: {
            bookings: targetUser._count.createdBookings,
            hotels: targetUser._count.createdHotels,
            rooms: targetUser._count.createdRooms,
          }
        },
        { status: 409 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `User '${targetUser.username}' deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}