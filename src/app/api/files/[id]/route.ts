import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tmpDir = path.join(process.cwd(), 'tmp');
    
    // Look for files with this ID and any extension
    const possibleExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.xlsx', '.xls', '.csv', '.doc', '.docx', '.rtf', '.txt'];
    
    let filePath: string | null = null;
    let fileExtension: string | null = null;
    
    for (const ext of possibleExtensions) {
      const testPath = path.join(tmpDir, `${id}${ext}`);
      if (existsSync(testPath)) {
        filePath = testPath;
        fileExtension = ext;
        break;
      }
    }
    
    if (!filePath || !fileExtension) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const fileBuffer = await readFile(filePath);
    
    // Set appropriate content type based on extension
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.csv': 'text/csv',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.rtf': 'application/rtf',
      '.txt': 'text/plain'
    };
    
    const contentType = contentTypes[fileExtension] || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
    
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Error serving file' }, { status: 500 });
  }
} 