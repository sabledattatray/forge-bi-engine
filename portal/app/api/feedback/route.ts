import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const { chartId, liked, metric } = await req.json();
    const prefPath = 'D:\\Datta Sable\\Git_Package\\preferences.json';

    let prefs = { likes: [], dislikes: [] };
    try {
      const data = await readFile(prefPath, 'utf-8');
      prefs = JSON.parse(data);
    } catch (e) {}

    const entry = { chartId, metric, timestamp: new Date().toISOString() };
    
    if (liked) {
      prefs.likes.push(entry);
    } else {
      prefs.dislikes.push(entry);
    }

    await writeFile(prefPath, JSON.stringify(prefs, null, 2));

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to record preference' }, { status: 500 });
  }
}
