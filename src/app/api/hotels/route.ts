import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/hotels - Get all hotels
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const hasRooms = searchParams.get('hasRooms');
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit');
    const limit = limitParam === 'all' || limitParam === null ? undefined : parseInt(limitParam || '10');
    const offset = limit ? (page - 1) * limit : 0;

    // Build where clause for search and filters
    const whereClause: any = {};
    
    // General search across multiple fields
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { altName: { contains: search, mode: 'insensitive' as const } },
        { code: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { altDescription: { contains: search, mode: 'insensitive' as const } },
        { address: { contains: search, mode: 'insensitive' as const } },
        { location: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    
    // Location filter
    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' as const };
    }
    
    // Filter for hotels that have rooms
    if (hasRooms === 'true') {
      whereClause.rooms = {
        some: {}
      };
    } else if (hasRooms === 'false') {
      whereClause.rooms = {
        none: {}
      };
    }

    // Get hotels with optional pagination and room count
    const queryOptions: any = {
      where: whereClause,
      select: {
        id: true,
        name: true,
        altName: true,
        code: true,
        description: true,
        altDescription: true,
        address: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            rooms: true,
            agreements: true
          }
        },
        agreements: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
          orderBy: { createdAt: 'desc' },
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
    };

    // Add pagination only if limit is specified
    if (limit) {
      queryOptions.skip = offset;
      queryOptions.take = limit;
    }

    const [hotels, totalCount] = await Promise.all([
      prisma.hotel.findMany(queryOptions),
      prisma.hotel.count({ where: whereClause }),
    ]);

    // Transform data to include room count in a more accessible format
    const transformedHotels = hotels.map(hotel => ({
      ...hotel,
      roomCount: hotel._count.rooms,
      agreementCount: hotel._count.agreements,
      _count: undefined // Remove the _count object from response
    }));

    return NextResponse.json({
      success: true,
      data: transformedHotels,
      pagination: limit ? {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      } : {
        page: 1,
        limit: totalCount,
        total: totalCount,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Get hotels API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/hotels - Create a new hotel
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
    const { name, altName, code, description, altDescription, address, location } = body;

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

    // Validate location if provided
    if (location && typeof location !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Location must be a string' },
        { status: 400 }
      );
    }

    // Check if hotel code already exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { code },
    });

    if (existingHotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel code already exists' },
        { status: 409 }
      );
    }

    // Create new hotel
    const hotel = await prisma.hotel.create({
      data: {
        name: name.trim(),
        altName: altName?.trim() || null,
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        altDescription: altDescription?.trim() || null,
        address: address?.trim() || null,
        location: location?.trim() || null,
        createdById: user.id,
      },
      select: {
        id: true,
        name: true,
        altName: true,
        code: true,
        description: true,
        altDescription: true,
        address: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            rooms: true,
            agreements: true
          }
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
        data: hotel,
        message: 'Hotel created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create hotel API error:', error);
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