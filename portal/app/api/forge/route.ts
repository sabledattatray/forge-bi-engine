import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    let fileName = '';
    let filePath = '';
    let query = '';
    let isQueryOnly = false;

    // Handle either FormData (Upload) or JSON (Query)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await req.json();
      fileName = body.fileName;
      query = body.query;
      isQueryOnly = true;
      filePath = join(process.cwd(), 'public', 'staging', fileName);
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) return NextResponse.json({ error: 'No file injected' }, { status: 400 });
      
      fileName = file.name;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = join(process.cwd(), 'public', 'staging');
      await mkdir(uploadDir, { recursive: true });
      filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
    }

    // Setup Export Area
    const exportDir = join(process.cwd(), 'public', 'exports');
    await mkdir(exportDir, { recursive: true });

    // Trigger Surgical Engine
    const pythonScript = join(process.cwd(), '..', 'main.py');
    let command = `python "${pythonScript}" "${filePath}" --web --output_dir "${exportDir}"`;
    if (query) {
      command += ` --query "${query.replace(/"/g, '\\"')}"`;
    }
    
    console.log('[LAB] Executing:', command);
    const { stdout, stderr } = await execPromise(command);
    
    const resultFileName = `${fileName.split('.')[0]}_dashboard.html`;
    const resultUrl = `/exports/${resultFileName}?t=${Date.now()}`; // Bust cache for live updates

    return NextResponse.json({ 
      success: true, 
      url: resultUrl,
      logs: stdout 
    });

  } catch (error: any) {
    console.error('[LAB] API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
