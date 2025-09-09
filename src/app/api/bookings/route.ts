import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { verifyAuthToken } from '../../../lib/auth';

const prisma = new PrismaClient();

// GET /api/bookings - Get all bookings with filtering
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
    const status = searchParams.get('status') || '';
    const hotelId = searchParams.get('hotelId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for search and filters
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { resId: { contains: search, mode: 'insensitive' as const } },
        { guest: { fullName: { contains: search, mode: 'insensitive' as const } } },
        { guest: { email: { contains: search, mode: 'insensitive' as const } } },
        { guest: { phone: { contains: search, mode: 'insensitive' as const } } },
        { hotel: { name: { contains: search, mode: 'insensitive' as const } } },
        { room: { roomType: { contains: search, mode: 'insensitive' as const } } },
      ];
    }
    
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    
    if (hotelId) {
      whereClause.hotelId = hotelId;
    }
    
    if (startDate || endDate) {
      whereClause.AND = [];
      if (startDate) {
        whereClause.AND.push({
          checkInDate: { gte: new Date(startDate) }
        });
      }
      if (endDate) {
        whereClause.AND.push({
          checkOutDate: { lte: new Date(endDate) }
        });
      }
    }

    // Get bookings with pagination and related data
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        select: {
          id: true,
          resId: true,
          hotelId: true,
          roomId: true,
          guestId: true,
          numberOfRooms: true,
          checkInDate: true,
          checkOutDate: true,
          numberOfNights: true,
          roomRate: true,
          alternativeRate: true,
          useAlternativeRate: true,
          totalAmount: true,
          rateCode: true,
          status: true,
          checkInTime: true,
          checkOutTime: true,
          assignedRoomNo: true,
          specialRequests: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          hotel: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          room: {
            select: {
              id: true,
              roomType: true,
              roomTypeDescription: true,
              boardType: true,
              basePrice: true,
              capacity: true,
            },
          },
          guest: {
            select: {
              id: true,
              profileId: true,
              firstName: true,
              lastName: true,
              fullName: true,
              email: true,
              phone: true,
              telephone: true,
              nationality: true,
              passportNumber: true,
              dateOfBirth: true,
              gender: true,
              address: true,
              city: true,
              country: true,
              guestClassification: true,
              travelAgent: true,
              company: true,
              source: true,
              group: true,
              isVip: true,
              vip: true,
              notes: true,
            },
          },
          payments: {
            select: {
              id: true,
              method: true,
              totalAmount: true,
              paidAmount: true,
              remainingAmount: true,
              paymentDate: true,
              remainingDueDate: true,
              status: true,
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
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
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
    const {
      hotelId,
      roomId,
      guestData,
      numberOfRooms,
      checkInDate,
      checkOutDate,
      roomRate,
      alternativeRate,
      useAlternativeRate,
      rateCode,
      specialRequests,
      notes,
      paymentData,
    } = body;

    // Validate required fields
    if (!hotelId || !roomId || !guestData || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn >= checkOut) {
      return NextResponse.json(
        { success: false, message: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Calculate number of nights
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Check room availability
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.isActive) {
      return NextResponse.json(
        { success: false, message: 'Room is not available' },
        { status: 400 }
      );
    }

    // Generate unique reservation ID
    const resId = `RES-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Calculate total amount based on rate selection
    let finalRoomRate;
    if (useAlternativeRate && (alternativeRate || room.alternativePrice)) {
      finalRoomRate = alternativeRate || room.alternativePrice;
    } else {
      finalRoomRate = roomRate || room.basePrice;
    }
    
    // Convert to Decimal for calculation
    const finalRoomRateDecimal = new Decimal(finalRoomRate.toString());
    const totalAmount = finalRoomRateDecimal.mul(numberOfNights).mul(numberOfRooms);

    // Start transaction for booking creation
    const result = await prisma.$transaction(async (tx) => {
      // Create or find guest
      let guest;
      if (guestData.id) {
        // Update existing guest
        guest = await tx.guest.update({
          where: { id: guestData.id },
          data: {
            firstName: guestData.firstName || guestData.fullName?.split(' ')[0] || '',
            lastName: guestData.lastName || guestData.fullName?.split(' ').slice(1).join(' ') || '',
            fullName: guestData.fullName,
            email: guestData.email,
            phone: guestData.phone,
            telephone: guestData.telephone,
            nationality: guestData.nationality,
            passportNumber: guestData.passportNumber,
            dateOfBirth: guestData.dateOfBirth ? new Date(guestData.dateOfBirth) : null,
            gender: guestData.gender?.toUpperCase(),
            address: guestData.address,
            city: guestData.city,
            country: guestData.country,
            company: guestData.company,
            guestClassification: guestData.guestClassification,
            travelAgent: guestData.travelAgent,
            source: guestData.source,
            group: guestData.group,
            isVip: guestData.vip || guestData.isVip || false,
            vip: guestData.vip || guestData.isVip || false,
            notes: guestData.notes,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new guest
        const nameParts = guestData.fullName?.split(' ') || ['', ''];
        // Generate unique profileId
        let profileId = guestData.profileId;
        if (!profileId) {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000);
          profileId = `PROF-${timestamp}-${random}`;
        }
        
        // Check if profileId already exists, if so generate a new one
        const existingGuest = await tx.guest.findUnique({
          where: { profileId }
        });
        
        if (existingGuest) {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 10000);
          profileId = `PROF-${timestamp}-${random}`;
        }
        
        guest = await tx.guest.create({
          data: {
            profileId,
            firstName: guestData.firstName || nameParts[0] || '',
            lastName: guestData.lastName || nameParts.slice(1).join(' ') || '',
            fullName: guestData.fullName || '',
            email: guestData.email,
            phone: guestData.phone,
            telephone: guestData.telephone,
            nationality: guestData.nationality,
            passportNumber: guestData.passportNumber,
            dateOfBirth: guestData.dateOfBirth ? new Date(guestData.dateOfBirth) : null,
            gender: guestData.gender?.toUpperCase(),
            address: guestData.address,
            city: guestData.city,
            country: guestData.country,
            company: guestData.company,
            guestClassification: guestData.guestClassification,
            travelAgent: guestData.travelAgent,
            source: guestData.source,
            group: guestData.group,
            isVip: guestData.vip || guestData.isVip || false,
            vip: guestData.vip || guestData.isVip || false,
            notes: guestData.notes,
          },
        });
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          resId,
          hotelId,
          roomId,
          guestId: guest.id,
          numberOfRooms: numberOfRooms || 1,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfNights,
          roomRate: roomRate || room.basePrice,
          alternativeRate: alternativeRate || room.alternativePrice,
          useAlternativeRate: useAlternativeRate || false,
          totalAmount,
          rateCode: rateCode || 'STANDARD',
          status: 'PENDING',
          assignedRoomNo: guestData.roomNo,
          specialRequests: specialRequests || [],
          notes,
          createdById: user.id,
        },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          room: {
            select: {
              id: true,
              roomType: true,
              roomTypeDescription: true,
              boardType: true,
              basePrice: true,
              capacity: true,
            },
          },
          guest: {
            select: {
              id: true,
              profileId: true,
              firstName: true,
              lastName: true,
              fullName: true,
              email: true,
              phone: true,
              nationality: true,
              guestClassification: true,
              travelAgent: true,
              company: true,
              source: true,
              group: true,
              isVip: true,
            },
          },
        },
      });

      // Create payment record if payment data provided
        if (paymentData) {
          // Validate payment method
          const validPaymentMethods = ['CASH', 'CREDIT'];
          const paymentMethod = paymentData.method?.toUpperCase() || 'CASH';
          
          if (!validPaymentMethods.includes(paymentMethod)) {
            throw new Error(`Invalid payment method: ${paymentData.method}. Valid methods are: ${validPaymentMethods.join(', ')}`);
          }

          // Calculate payment amounts based on method
          let paidAmount, remainingAmount, remainingDueDate;
          
          if (paymentMethod === 'CASH') {
            // For cash: full payment on payment date (not editable)
            paidAmount = totalAmount; // Always full amount for cash
            remainingAmount = 0;
            remainingDueDate = null;
          } else if (paymentMethod === 'CREDIT') {
            // For credit: pay now amount + pay later amount with due date
            paidAmount = paymentData.paidAmount || 0;
            remainingAmount = totalAmount - paidAmount;
            remainingDueDate = paymentData.remainingDueDate ? new Date(paymentData.remainingDueDate) : null;
            
            // Validate credit payment requirements
            if (!remainingDueDate && remainingAmount > 0) {
              throw new Error('Due date is required for credit payments with remaining amount');
            }
          }

          await tx.payment.create({
            data: {
              bookingId: booking.id,
              method: paymentMethod,
              totalAmount: totalAmount,
              paidAmount: paidAmount,
              remainingAmount: remainingAmount,
              paymentDate: paymentData.date ? new Date(paymentData.date) : new Date(),
              remainingDueDate: remainingDueDate,
              status: remainingAmount > 0 ? 'PARTIALLY_PAID' : 'COMPLETED',
            },
          });
        }

      return booking;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Create booking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings - Update an existing booking
export async function PUT(request: NextRequest) {
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
    const {
      id,
      hotelId,
      roomId,
      guestData,
      numberOfRooms,
      checkInDate,
      checkOutDate,
      roomRate,
      alternativeRate,
      useAlternativeRate,
      rateCode,
      status,
      assignedRoomNo,
      specialRequests,
      notes,
      paymentData,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        guest: true,
        payments: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate dates if provided
    let checkIn, checkOut, numberOfNights;
    if (checkInDate && checkOutDate) {
      checkIn = new Date(checkInDate);
      checkOut = new Date(checkOutDate);
      
      if (checkIn >= checkOut) {
        return NextResponse.json(
          { success: false, message: 'Check-out date must be after check-in date' },
          { status: 400 }
        );
      }

      // Calculate number of nights
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    // Check room availability if room is being changed
    let room = existingBooking.room;
    if (roomId && roomId !== existingBooking.roomId) {
      room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { hotel: true },
      });

      if (!room) {
        return NextResponse.json(
          { success: false, message: 'Room not found' },
          { status: 404 }
        );
      }

      if (!room.isActive) {
        return NextResponse.json(
          { success: false, message: 'Room is not available' },
          { status: 400 }
        );
      }
    }

    // Calculate total amount if rates or dates changed
    let totalAmount = existingBooking.totalAmount;
    if (roomRate || alternativeRate || useAlternativeRate !== undefined || numberOfNights || numberOfRooms) {
      let finalRoomRate;
      const useAltRate = useAlternativeRate !== undefined ? useAlternativeRate : existingBooking.useAlternativeRate;
      
      if (useAltRate && (alternativeRate || room.alternativePrice)) {
        finalRoomRate = alternativeRate || room.alternativePrice;
      } else {
        finalRoomRate = roomRate || room.basePrice;
      }
      
      // Convert to Decimal for calculation
      const finalRoomRateDecimal = new Decimal(finalRoomRate.toString());
      const nights = numberOfNights || existingBooking.numberOfNights;
      const rooms = numberOfRooms || existingBooking.numberOfRooms;
      totalAmount = finalRoomRateDecimal.mul(nights).mul(rooms);
    }

    // Start transaction for booking update
    const result = await prisma.$transaction(async (tx) => {
      // Update guest if guest data provided
      let guest = existingBooking.guest;
      if (guestData && guestData.id) {
        guest = await tx.guest.update({
          where: { id: guestData.id },
          data: {
            firstName: guestData.firstName || guestData.fullName?.split(' ')[0] || guest.firstName,
            lastName: guestData.lastName || guestData.fullName?.split(' ').slice(1).join(' ') || guest.lastName,
            fullName: guestData.fullName || guest.fullName,
            email: guestData.email || guest.email,
            phone: guestData.phone || guest.phone,
            telephone: guestData.telephone || guest.telephone,
            nationality: guestData.nationality || guest.nationality,
            passportNumber: guestData.passportNumber || guest.passportNumber,
            dateOfBirth: guestData.dateOfBirth ? new Date(guestData.dateOfBirth) : guest.dateOfBirth,
            gender: guestData.gender?.toUpperCase() || guest.gender,
            address: guestData.address || guest.address,
            city: guestData.city || guest.city,
            country: guestData.country || guest.country,
            company: guestData.company || guest.company,
            guestClassification: guestData.guestClassification || guest.guestClassification,
            travelAgent: guestData.travelAgent || guest.travelAgent,
            source: guestData.source || guest.source,
            group: guestData.group || guest.group,
            isVip: guestData.vip !== undefined ? guestData.vip : (guestData.isVip !== undefined ? guestData.isVip : guest.isVip),
            vip: guestData.vip !== undefined ? guestData.vip : (guestData.isVip !== undefined ? guestData.isVip : guest.vip),
            notes: guestData.notes || guest.notes,
            updatedAt: new Date(),
          },
        });
      }

      // Update booking
      const booking = await tx.booking.update({
        where: { id },
        data: {
          hotelId: hotelId || existingBooking.hotelId,
          roomId: roomId || existingBooking.roomId,
          numberOfRooms: numberOfRooms || existingBooking.numberOfRooms,
          checkInDate: checkIn || existingBooking.checkInDate,
          checkOutDate: checkOut || existingBooking.checkOutDate,
          numberOfNights: numberOfNights || existingBooking.numberOfNights,
          roomRate: roomRate || existingBooking.roomRate,
          alternativeRate: alternativeRate || existingBooking.alternativeRate,
          useAlternativeRate: useAlternativeRate !== undefined ? useAlternativeRate : existingBooking.useAlternativeRate,
          totalAmount,
          rateCode: rateCode || existingBooking.rateCode,
          status: status || existingBooking.status,
          assignedRoomNo: assignedRoomNo || existingBooking.assignedRoomNo,
          specialRequests: specialRequests || existingBooking.specialRequests,
          notes: notes !== undefined ? notes : existingBooking.notes,
          updatedAt: new Date(),
        },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          room: {
            select: {
              id: true,
              roomType: true,
              roomTypeDescription: true,
              boardType: true,
              basePrice: true,
              capacity: true,
            },
          },
          guest: {
            select: {
              id: true,
              profileId: true,
              firstName: true,
              lastName: true,
              fullName: true,
              email: true,
              phone: true,
              nationality: true,
              guestClassification: true,
              travelAgent: true,
              company: true,
              source: true,
              group: true,
              isVip: true,
            },
          },
          payments: {
            select: {
              id: true,
              method: true,
              totalAmount: true,
              paidAmount: true,
              remainingAmount: true,
              paymentDate: true,
              remainingDueDate: true,
              status: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Update payment record if payment data provided
      if (paymentData && existingBooking.payments.length > 0) {
        const existingPayment = existingBooking.payments[0];
        
        // Validate payment method
        const validPaymentMethods = ['CASH', 'CREDIT'];
        const paymentMethod = paymentData.method?.toUpperCase() || existingPayment.method;
        
        if (!validPaymentMethods.includes(paymentMethod)) {
          throw new Error(`Invalid payment method: ${paymentData.method}. Valid methods are: ${validPaymentMethods.join(', ')}`);
        }

        // Calculate payment amounts based on method
        let paidAmount, remainingAmount, remainingDueDate;
        
        if (paymentMethod === 'CASH') {
          // For cash: full payment on payment date (not editable)
          paidAmount = totalAmount; // Always full amount for cash
          remainingAmount = 0;
          remainingDueDate = null;
        } else if (paymentMethod === 'CREDIT') {
          // For credit: pay now amount + pay later amount with due date
          paidAmount = paymentData.paidAmount !== undefined ? paymentData.paidAmount : existingPayment.paidAmount;
          remainingAmount = totalAmount - paidAmount;
          remainingDueDate = paymentData.remainingDueDate ? new Date(paymentData.remainingDueDate) : existingPayment.remainingDueDate;
          
          // Validate credit payment requirements
          if (!remainingDueDate && remainingAmount > 0) {
            throw new Error('Due date is required for credit payments with remaining amount');
          }
        }

        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            method: paymentMethod,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            remainingAmount: remainingAmount,
            paymentDate: paymentData.date ? new Date(paymentData.date) : existingPayment.paymentDate,
            remainingDueDate: remainingDueDate,
            status: remainingAmount > 0 ? 'PARTIALLY_PAID' : 'COMPLETED',
            updatedAt: new Date(),
          },
        });
      }

      return booking;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Booking updated successfully',
    });
  } catch (error) {
    console.error('Update booking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings - Delete a booking
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

    // Get booking ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking can be deleted (e.g., not checked in)
    if (existingBooking.status === 'CHECKED_IN') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete a checked-in booking' },
        { status: 400 }
      );
    }

    // Start transaction for booking deletion
    await prisma.$transaction(async (tx) => {
      // Delete associated payments first
      if (existingBooking.payments.length > 0) {
        await tx.payment.deleteMany({
          where: { bookingId: id },
        });
      }

      // Delete the booking
      await tx.booking.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Delete booking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}