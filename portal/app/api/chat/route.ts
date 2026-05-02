import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, fileName } = await req.json();

    // Neural Conversational Logic
    let reply = "";
    const msg = message.toLowerCase();

    if (msg.includes('growth') || msg.includes('trend')) {
      reply = "Analyzing temporal patterns... I recommend a **Line Chart** with fill-to-zero to visualize the growth trajectory clearly.";
    } else if (msg.includes('split') || msg.includes('distribution')) {
      reply = "For distributions, a **Donut Chart** with at least 4 segments is the most effective way to see the share of each category.";
    } else if (msg.includes('ranking') || msg.includes('top')) {
      reply = "To show rankings, I'll prioritize a **Horizontal Bar Chart** with color gradients to highlight the top performers.";
    } else if (msg.includes('anomaly') || msg.includes('correlation')) {
      reply = "Detecting statistical variances... A **Scatter Plot** with outlier detection will help pinpoint the records requiring surgical investigation.";
    } else {
      reply = "Neural node active. I can help you reconfigure the visuals, detect anomalies, or explain the heuristic logic used for this dataset. What would you like to explore next?";
    }

    return NextResponse.json({ reply });

  } catch (error) {
    return NextResponse.json({ reply: "Neural Link Interrupted." }, { status: 500 });
  }
}
