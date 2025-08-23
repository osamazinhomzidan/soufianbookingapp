import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/rooms/[id] - Get a specific room
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

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    // Get room by ID
    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        hotelId: true,
        roomType: true,
        roomTypeDescription: true,
        altDescription: true,
        basePrice: true,
        alternativePrice: true,
        quantity: true,
        boardType: true,
        size: true,
        capacity: true,
        floor: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        hotel: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            altDescription: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        roomAmenities: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        seasonalPrices: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            priceMultiplier: true,
            fixedPrice: true,
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Get room API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/rooms/[id] - Update a specific room
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

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      hotelId,
      roomType,
      roomTypeDescription,
      altDescription,
      basePrice,
      alternativePrice,
      quantity,
      boardType,
      size,
      capacity,
      floor,
      isActive
    } = body;

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    if (roomType !== undefined && (!roomType || typeof roomType !== 'string')) {
      return NextResponse.json(
        { success: false, message: 'Room type must be a non-empty string' },
        { status: 400 }
      );
    }

    if (roomTypeDescription !== undefined && (!roomTypeDescription || typeof roomTypeDescription !== 'string')) {
      return NextResponse.json(
        { success: false, message: 'Room type description must be a non-empty string' },
        { status: 400 }
      );
    }

    if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice <= 0)) {
      return NextResponse.json(
        { success: false, message: 'Base price must be a positive number' },
        { status: 400 }
      );
    }

    if (quantity !== undefined && (typeof quantity !== 'number' || quantity <= 0)) {
      return NextResponse.json(
        { success: false, message: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    if (alternativePrice !== undefined && alternativePrice !== null && alternativePrice <= 0) {
      return NextResponse.json(
        { success: false, message: 'Alternative price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate board type
    const validBoardTypes = ['ROOM_ONLY', 'BED_BREAKFAST', 'HALF_BOARD', 'FULL_BOARD'];
    if (boardType !== undefined && !validBoardTypes.includes(boardType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid board type' },
        { status: 400 }
      );
    }

    // Check if hotel exists if hotelId is being updated
    if (hotelId && hotelId !== existingRoom.hotelId) {
      const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
      });

      if (!hotel) {
        return NextResponse.json(
          { success: false, message: 'Hotel not found' },
          { status: 404 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (hotelId !== undefined) updateData.hotelId = hotelId.trim();
    if (roomType !== undefined) updateData.roomType = roomType.trim();
    if (roomTypeDescription !== undefined) updateData.roomTypeDescription = roomTypeDescription.trim();
    if (altDescription !== undefined) updateData.altDescription = altDescription?.trim() || null;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice.toString());
    if (alternativePrice !== undefined) updateData.alternativePrice = alternativePrice ? parseFloat(alternativePrice.toString()) : null;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity.toString());
    if (boardType !== undefined) updateData.boardType = boardType;
    if (size !== undefined) updateData.size = size?.trim() || null;
    if (capacity !== undefined) updateData.capacity = capacity ? parseInt(capacity.toString()) : null;
    if (floor !== undefined) updateData.floor = floor ? parseInt(floor.toString()) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Update room
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        hotelId: true,
        roomType: true,
        roomTypeDescription: true,
        altDescription: true,
        basePrice: true,
        alternativePrice: true,
        quantity: true,
        boardType: true,
        size: true,
        capacity: true,
        floor: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        hotel: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
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
      data: updatedRoom,
      message: 'Room updated successfully',
    });
  } catch (error) {
    console.error('Update room API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id] - Delete a specific room
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

    // Check if user has permission to delete (only OWNER can delete)
    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room has any active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        roomId: id,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN'],
        },
      },
    });

    if (activeBookings) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete room with active bookings' },
        { status: 400 }
      );
    }

    // Delete room (this will cascade delete related records)
    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Delete room API error:', error);
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