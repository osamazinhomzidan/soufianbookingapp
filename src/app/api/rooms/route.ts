import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/rooms - Get all rooms
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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const hotelId = searchParams.get('hotelId') || '';
    const boardType = searchParams.get('boardType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search and filters
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { roomType: { contains: search, mode: 'insensitive' as const } },
        { roomTypeDescription: { contains: search, mode: 'insensitive' as const } },
        { altDescription: { contains: search, mode: 'insensitive' as const } },
        { hotel: { name: { contains: search, mode: 'insensitive' as const } } },
      ];
    }
    
    if (hotelId) {
      whereClause.hotelId = hotelId;
    }
    
    if (boardType) {
      whereClause.boardType = boardType;
    }

    // Get rooms with pagination
    const [rooms, totalCount] = await Promise.all([
      prisma.room.findMany({
        where: whereClause,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.room.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get rooms API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room
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
      floor
    } = body;

    // Validate required fields
    if (!hotelId || !roomType || !roomTypeDescription || !basePrice || !quantity) {
      return NextResponse.json(
        { success: false, message: 'Hotel, room type, description, base price, and quantity are required' },
        { status: 400 }
      );
    }

    // Validate input types
    if (
      typeof hotelId !== 'string' ||
      typeof roomType !== 'string' ||
      typeof roomTypeDescription !== 'string' ||
      typeof basePrice !== 'number' ||
      typeof quantity !== 'number'
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid input format' },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (basePrice <= 0 || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: 'Base price and quantity must be positive numbers' },
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
    if (boardType && !validBoardTypes.includes(boardType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid board type' },
        { status: 400 }
      );
    }

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Create new room
    const room = await prisma.room.create({
      data: {
        hotelId: hotelId.trim(),
        roomType: roomType.trim(),
        roomTypeDescription: roomTypeDescription.trim(),
        altDescription: altDescription?.trim() || null,
        basePrice: parseFloat(basePrice.toString()),
        alternativePrice: alternativePrice ? parseFloat(alternativePrice.toString()) : null,
        quantity: parseInt(quantity.toString()),
        boardType: boardType || 'ROOM_ONLY',
        size: size?.trim() || null,
        capacity: capacity ? parseInt(capacity.toString()) : 2,
        floor: floor ? parseInt(floor.toString()) : null,
        createdById: user.id,
      },
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

    return NextResponse.json(
      {
        success: true,
        data: room,
        message: 'Room created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create room API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
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