import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET /api/bookings/availability - Check room availability
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
    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');
    const numberOfRooms = parseInt(searchParams.get('numberOfRooms') || '1');
    const boardType = searchParams.get('boardType');
    const capacity = parseInt(searchParams.get('capacity') || '0');

    // Validate required parameters
    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { success: false, message: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { success: false, message: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Build where clause for room filtering
    const roomWhereClause: any = {
      isActive: true,
    };

    if (hotelId) {
      roomWhereClause.hotelId = hotelId;
    }

    if (roomId) {
      roomWhereClause.id = roomId;
    }

    if (boardType) {
      roomWhereClause.boardType = boardType.toUpperCase();
    }

    if (capacity > 0) {
      roomWhereClause.capacity = { gte: capacity };
    }

    // Get all rooms matching criteria
    const rooms = await prisma.room.findMany({
      where: roomWhereClause,
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            altName: true,
          },
        },
        roomAmenities: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        availabilitySlots: {
          where: {
            date: {
              gte: checkIn,
              lte: checkOut,
            },
          },
          select: {
            id: true,
            date: true,
            availableCount: true,
            blockedCount: true,
          },
        },
        bookings: {
          where: {
            OR: [
              {
                checkInDate: {
                  lte: checkOut,
                },
                checkOutDate: {
                  gte: checkIn,
                },
              },
            ],
            status: {
              in: ['CONFIRMED', 'CHECKED_IN'],
            },
          },
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true,
            numberOfRooms: true,
          },
        },
      },
    }) as any[];

    // Calculate availability for each room
    const availabilityResults = rooms.map((room) => {
      // Check if room is within its availability date range
      let isWithinAvailabilityPeriod = true;
      if (room.availableFrom || room.availableTo) {
        const roomAvailableFrom = room.availableFrom ? new Date(room.availableFrom) : null;
        const roomAvailableTo = room.availableTo ? new Date(room.availableTo) : null;
        
        if (roomAvailableFrom && checkIn < roomAvailableFrom) {
          isWithinAvailabilityPeriod = false;
        }
        if (roomAvailableTo && checkOut > roomAvailableTo) {
          isWithinAvailabilityPeriod = false;
        }
      }

      // Calculate total booked rooms for the date range (sum of numberOfRooms from all bookings)
      const bookedRooms = room.bookings.reduce((total, booking) => total + (booking.numberOfRooms || 1), 0);

      // Check availability slots if they exist
      let availableFromSlots = null;
      if (room.availabilitySlots.length > 0) {
        // Find minimum available rooms across all dates in range
        availableFromSlots = Math.min(
          ...room.availabilitySlots.map(slot => slot.availableCount)
        );
      }

      // Determine available rooms
      // If we have availability slots, use them; otherwise, use room quantity minus bookings
      const totalAvailable = availableFromSlots !== null 
        ? availableFromSlots 
        : Math.max(0, room.quantity - bookedRooms);

      const isAvailable = isWithinAvailabilityPeriod && totalAvailable >= numberOfRooms;

      return {
        room: {
          id: room.id,
          roomType: room.roomType,
          roomTypeDescription: room.roomTypeDescription,
          altDescription: room.altDescription,
          boardType: room.boardType,
          basePrice: room.basePrice,
          alternativePrice: room.alternativePrice,
          availableFrom: room.availableFrom,
          availableTo: room.availableTo,
          quantity: room.quantity,
          capacity: room.capacity,
          hotel: room.hotel,
          roomAmenities: room.roomAmenities,
        },
        availability: {
          isAvailable,
          totalAvailable,
          requestedRooms: numberOfRooms,
          bookedRooms,
          isWithinAvailabilityPeriod,
          availabilitySlots: room.availabilitySlots,
        },
        conflictingBookings: room.bookings,
      };
    });

    // Filter to only available rooms if requested
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const filteredResults = availableOnly 
      ? availabilityResults.filter(result => result.availability.isAvailable)
      : availabilityResults;

    return NextResponse.json({
      success: true,
      data: {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfRooms,
        results: filteredResults,
        summary: {
          totalRooms: availabilityResults.length,
          availableRooms: availabilityResults.filter(r => r.availability.isAvailable).length,
          unavailableRooms: availabilityResults.filter(r => !r.availability.isAvailable).length,
        },
      },
    });
  } catch (error) {
    console.error('Check availability API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings/availability - Bulk availability check for multiple date ranges
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

    const body = await request.json();
    const { dateRanges, hotelId, roomId, numberOfRooms = 1, boardType, capacity } = body;

    if (!dateRanges || !Array.isArray(dateRanges) || dateRanges.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Date ranges array is required' },
        { status: 400 }
      );
    }

    // Validate date ranges
    for (const range of dateRanges) {
      if (!range.checkInDate || !range.checkOutDate) {
        return NextResponse.json(
          { success: false, message: 'Each date range must have checkInDate and checkOutDate' },
          { status: 400 }
        );
      }

      const checkIn = new Date(range.checkInDate);
      const checkOut = new Date(range.checkOutDate);

      if (checkIn >= checkOut) {
        return NextResponse.json(
          { success: false, message: 'Check-out date must be after check-in date for all ranges' },
          { status: 400 }
        );
      }
    }

    // Build where clause for room filtering
    const roomWhereClause: any = {
      isActive: true,
    };

    if (hotelId) {
      roomWhereClause.hotelId = hotelId;
    }

    if (roomId) {
      roomWhereClause.id = roomId;
    }

    if (boardType) {
      roomWhereClause.boardType = boardType.toUpperCase();
    }

    if (capacity && capacity > 0) {
      roomWhereClause.capacity = { gte: capacity };
    }

    // Process each date range
    const results = await Promise.all(
      dateRanges.map(async (range) => {
        const checkIn = new Date(range.checkInDate);
        const checkOut = new Date(range.checkOutDate);

        // Get rooms with bookings for this date range
        const rooms = await prisma.room.findMany({
          where: roomWhereClause,
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
                altName: true,
              },
            },
            availabilitySlots: {
              where: {
                date: {
                  gte: checkIn,
                  lte: checkOut,
                },
              },
              select: {
                date: true,
                availableCount: true,
                blockedCount: true,
              },
            },
            bookings: {
              where: {
                OR: [
                  {
                    checkInDate: {
                      lte: checkOut,
                    },
                    checkOutDate: {
                      gte: checkIn,
                    },
                  },
                ],
                status: {
                  in: ['CONFIRMED', 'CHECKED_IN'],
                },
              },
              select: {
                id: true,
                checkInDate: true,
                checkOutDate: true,
                status: true,
              },
            },
          },
        }) as any[];

        // Calculate availability for each room in this date range
        const roomAvailability = rooms.map((room) => {
          const bookedRooms = room.bookings.length;

          let availableFromSlots = null;
          if (room.availabilitySlots.length > 0) {
            availableFromSlots = Math.min(
              ...room.availabilitySlots.map(slot => slot.availableCount)
            );
          }

          const totalAvailable = availableFromSlots !== null 
            ? availableFromSlots 
            : Math.max(0, room.capacity - bookedRooms);

          const isAvailable = totalAvailable >= numberOfRooms;

          return {
            roomId: room.id,
            roomType: room.roomType,
            boardType: room.boardType,
            basePrice: room.basePrice,
            capacity: room.capacity,
            hotel: room.hotel,
            isAvailable,
            totalAvailable,
            bookedRooms,
          };
        });

        return {
          dateRange: {
            checkInDate: checkIn,
            checkOutDate: checkOut,
          },
          rooms: roomAvailability,
          summary: {
            totalRooms: roomAvailability.length,
            availableRooms: roomAvailability.filter(r => r.isAvailable).length,
            unavailableRooms: roomAvailability.filter(r => !r.isAvailable).length,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        numberOfRooms,
        results,
        overallSummary: {
          totalDateRanges: results.length,
          fullyAvailableRanges: results.filter(r => r.summary.availableRooms > 0).length,
          unavailableRanges: results.filter(r => r.summary.availableRooms === 0).length,
        },
      },
    });
  } catch (error) {
    console.error('Bulk availability check API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}