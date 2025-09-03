import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// GET /api/hotels/[id]/agreements/[agreementId]/download - Download agreement file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; agreementId: string }> }
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

    const { id: hotelId, agreementId } = await params;

    // Find agreement in database
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

    // Check if file exists on disk
    const filePath = join(process.cwd(), 'public', agreement.filePath);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'File not found on disk' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', agreement.mimeType);
    headers.set('Content-Length', agreement.fileSize.toString());
    headers.set('Content-Disposition', `attachment; filename="${agreement.fileName}"`);
    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download agreement API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}