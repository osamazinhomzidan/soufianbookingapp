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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { altName: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get hotels with pagination
    const [hotels, totalCount] = await Promise.all([
      prisma.hotel.findMany({
        where: whereClause,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.hotel.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: hotels,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
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