import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// POST /api/hotels/[id]/agreements - Upload agreement files
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: hotelId } = await params;

    // Verify hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const uploadedAgreements = [];
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'hotels');

    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: `File type ${file.type} is not supported` },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} is too large. Maximum size is 10MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = join(uploadDir, uniqueFileName);
      const relativePath = `/uploads/hotels/${uniqueFileName}`;

      // Save file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Save file info to database
      const agreement = await prisma.hotelAgreement.create({
        data: {
          hotelId,
          fileName: file.name,
          filePath: relativePath,
          fileSize: file.size,
          mimeType: file.type,
        },
      });

      uploadedAgreements.push(agreement);
    }

    return NextResponse.json(
      {
        success: true,
        data: uploadedAgreements,
        message: `${uploadedAgreements.length} file(s) uploaded successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload agreements API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/hotels/[id]/agreements - Get hotel agreement files
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: hotelId } = await params;

    // Get hotel agreements
    const agreements = await prisma.hotelAgreement.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: agreements,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get agreements API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotels/[id]/agreements - Delete agreement file
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: hotelId } = await params;
    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get('agreementId');

    if (!agreementId) {
      return NextResponse.json(
        { success: false, message: 'Agreement ID is required' },
        { status: 400 }
      );
    }

    // Find and delete agreement
    const agreement = await prisma.hotelAgreement.findFirst({
      where: {
        id: agreementId,
        hotelId,
      },
    });

    if (!agreement) {
      return NextResponse.json(
        { success: false, message: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.hotelAgreement.delete({
      where: { id: agreementId },
    });

    // Try to delete file from disk (don't fail if file doesn't exist)
    try {
      const fs = require('fs').promises;
      const filePath = join(process.cwd(), 'public', agreement.filePath);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete file from disk:', fileError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Agreement deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete agreement API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}