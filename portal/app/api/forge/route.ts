import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file injected' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Setup Lab Staging Area
    const uploadDir = join(process.cwd(), 'public', 'staging');
    const exportDir = join(process.cwd(), 'public', 'exports');
    
    await mkdir(uploadDir, { recursive: true });
    await mkdir(exportDir, { recursive: true });

    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    // Trigger Surgical Engine (Relative to Package Root)
    const pythonScript = join(process.cwd(), '..', 'main.py');
    const command = `python "${pythonScript}" "${filePath}" --web --output_dir "${exportDir}"`;
    
    console.log('[LAB] Executing:', command);
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('UserWarning')) {
      console.error('[LAB] Engine Error:', stderr);
    }

    const resultFileName = `${file.name.split('.')[0]}_dashboard.html`;
    const resultUrl = `/exports/${resultFileName}`;

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
