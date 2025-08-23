import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/hotels/[id] - Get a single hotel by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    // Get hotel by ID
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        altName: true,
        code: true,
        description: true,
        altDescription: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            rooms: true,
            bookings: true,
            amenities: true,
          },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error('Get hotel API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/hotels/[id] - Update a hotel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, altName, code, description, altDescription, address } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: 'Hotel name and code are required' },
        { status: 400 }
      );
    }

    // Validate input types
    if (typeof name !== 'string' || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid input format' },
        { status: 400 }
      );
    }

    // Check if hotel exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!existingHotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Check if code is being changed and if new code already exists
    if (code.trim().toUpperCase() !== existingHotel.code) {
      const codeExists = await prisma.hotel.findUnique({
        where: { code: code.trim().toUpperCase() },
      });

      if (codeExists) {
        return NextResponse.json(
          { success: false, message: 'Hotel code already exists' },
          { status: 409 }
        );
      }
    }

    // Update hotel
    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: {
        name: name.trim(),
        altName: altName?.trim() || null,
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        altDescription: altDescription?.trim() || null,
        address: address?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        altName: true,
        code: true,
        description: true,
        altDescription: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedHotel,
      message: 'Hotel updated successfully',
    });
  } catch (error) {
    console.error('Update hotel API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotels/[id] - Delete a hotel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Only allow OWNER role to delete hotels
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    // Check if hotel exists and get related data counts
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            rooms: true,
            bookings: true,
            amenities: true,
          },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Check if hotel has related data that would prevent deletion
    if (hotel._count.bookings > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete hotel with existing bookings',
        },
        { status: 409 }
      );
    }

    // Delete hotel (this will cascade delete amenities due to foreign key constraints)
    await prisma.hotel.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('Delete hotel API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}