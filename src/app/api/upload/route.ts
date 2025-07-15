import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const id = formData.get('id') as string;

  if (!file || !id) {
    return NextResponse.json({ error: 'No file or id uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const tmpDir = path.join(process.cwd(), 'tmp');
  const fileExtension = path.extname(file.name);
  const fileName = `${id}${fileExtension}`;
  const filePath = path.join(tmpDir, fileName);

  try {
    await mkdir(tmpDir, { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
  }
} 