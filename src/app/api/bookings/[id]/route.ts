import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET /api/bookings/[id] - Get a specific booking by ID
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

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id },
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
            address: true,
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
            roomAmenities: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
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
            preferences: {
              select: {
                id: true,
                smokingPreference: true,
                specialRequests: true,
              },
            },
            emergencyContact: {
              select: {
                id: true,
                name: true,
                relationship: true,
                phone: true,
                email: true,
              },
            },
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
            createdAt: true,
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
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update a specific booking
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
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const {
      status,
      checkInDate,
      checkOutDate,
      numberOfRooms,
      roomRate,
      alternativeRate,
      useAlternativeRate,
      rateCode,
      assignedRoomNo,
      checkInTime,
      checkOutTime,
      specialRequests,
      notes,
      guestData,
      paymentData,
    } = body;

    // Validate dates if provided
    let checkIn = existingBooking.checkInDate;
    let checkOut = existingBooking.checkOutDate;
    let numberOfNights = existingBooking.numberOfNights;
    let totalAmount = existingBooking.totalAmount;

    if (checkInDate || checkOutDate) {
      checkIn = checkInDate ? new Date(checkInDate) : existingBooking.checkInDate;
      checkOut = checkOutDate ? new Date(checkOutDate) : existingBooking.checkOutDate;
      
      if (checkIn >= checkOut) {
        return NextResponse.json(
          { success: false, message: 'Check-out date must be after check-in date' },
          { status: 400 }
        );
      }

      // Recalculate nights and total amount
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Calculate rate based on alternative pricing selection
      let finalRoomRate;
      if (useAlternativeRate && (alternativeRate || existingBooking.room.alternativePrice)) {
        finalRoomRate = alternativeRate || existingBooking.room.alternativePrice;
      } else {
        finalRoomRate = roomRate || existingBooking.roomRate;
      }
      
      const finalNumberOfRooms = numberOfRooms || existingBooking.numberOfRooms;
      totalAmount = finalRoomRate.mul(numberOfNights).mul(finalNumberOfRooms);
    }

    // Start transaction for booking update
    const result = await prisma.$transaction(async (tx) => {
      // Update guest data if provided
      if (guestData && existingBooking.guestId) {
        await tx.guest.update({
          where: { id: existingBooking.guestId },
          data: {
            firstName: guestData.firstName,
            lastName: guestData.lastName,
            fullName: guestData.fullName,
            email: guestData.email,
            phone: guestData.telephone || guestData.phone,
            nationality: guestData.nationality,
            company: guestData.company,
            guestClassification: guestData.guestClassification,
            travelAgent: guestData.travelAgent,
            source: guestData.source,
            group: guestData.group,
            isVip: guestData.vip || guestData.isVip,
            updatedAt: new Date(),
          },
        });
      }

      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: status?.toUpperCase(),
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfNights,
          numberOfRooms,
          roomRate: roomRate || existingBooking.roomRate,
          alternativeRate: alternativeRate || existingBooking.alternativeRate,
          useAlternativeRate: useAlternativeRate !== undefined ? useAlternativeRate : existingBooking.useAlternativeRate,
          totalAmount,
          rateCode,
          assignedRoomNo,
          checkInTime: checkInTime ? new Date(checkInTime) : undefined,
          checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
          specialRequests,
          notes,
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

      // Update or create payment record if payment data provided
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
          // For cash: full payment on payment date
          paidAmount = paymentData.amount || totalAmount;
          remainingAmount = 0;
          remainingDueDate = null;
        } else if (paymentMethod === 'CREDIT') {
          // For credit: partial payment today, remaining amount on future date
          paidAmount = paymentData.paidAmount || 0;
          remainingAmount = totalAmount.sub(paidAmount);
          remainingDueDate = paymentData.remainingDueDate ? new Date(paymentData.remainingDueDate) : null;
        }

        const existingPayment = await tx.payment.findFirst({
          where: { bookingId: id },
          orderBy: { createdAt: 'desc' },
        });

        if (existingPayment) {
          await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              method: paymentMethod,
              totalAmount: totalAmount,
              paidAmount: paidAmount,
              remainingAmount: remainingAmount,
              paymentDate: paymentData.date ? new Date(paymentData.date) : undefined,
              remainingDueDate: remainingDueDate,
              status: remainingAmount > 0 ? 'PARTIALLY_PAID' : 'COMPLETED',
              updatedAt: new Date(),
            },
          });
        } else {
          await tx.payment.create({
            data: {
              bookingId: id,
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
      }

      return updatedBooking;
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

// DELETE /api/bookings/[id] - Delete/Cancel a specific booking
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

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'cancel'; // 'cancel' or 'delete'

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    let result;

    if (action === 'delete') {
      // Hard delete - remove booking and related records
      result = await prisma.$transaction(async (tx) => {
        // Delete payments first (due to foreign key constraints)
        await tx.payment.deleteMany({
          where: { bookingId: id },
        });

        // Delete booking
        const deletedBooking = await tx.booking.delete({
          where: { id },
        });

        return deletedBooking;
      });

      return NextResponse.json({
        success: true,
        message: 'Booking deleted successfully',
      });
    } else {
      // Soft delete - mark as cancelled
      result = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
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
            },
          },
          guest: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Booking cancelled successfully',
      });
    }
  } catch (error) {
    console.error('Delete booking API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}