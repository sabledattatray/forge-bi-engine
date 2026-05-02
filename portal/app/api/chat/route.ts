import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, fileName } = await req.json();

    // Neural Conversational Logic
    let reply = "";
    let query = null;
    const msg = message.toLowerCase();

    // --- AUTONOMOUS INTENT DETECTION ---
    if (msg.includes('total sales') || msg.includes('sum amount')) {
      reply = "Calculating total volume... I have forged a custom query to aggregate the primary metrics for you.";
      query = "SELECT SUM(Sales) as Total_Sales FROM data"; // Assuming Sales column
    } else if (msg.includes('top') && (msg.includes('region') || msg.includes('category'))) {
      const dim = msg.includes('region') ? 'Region' : 'Category';
      reply = `Slicing data by ${dim}... I am generating a ranking of the top performers based on the current dataset.`;
      query = `SELECT ${dim}, SUM(Sales) as Total FROM data GROUP BY 1 ORDER BY 2 DESC LIMIT 10`;
    } else if (msg.includes('highest risk') || msg.includes('fraud')) {
      reply = "Scanning for high-risk anomalies... I am extracting the top records with suspicious risk scores for your investigation.";
      query = "SELECT * FROM data ORDER BY Risk_Score DESC LIMIT 15";
    } else if (msg.includes('growth') || msg.includes('trend')) {
      reply = "Analyzing temporal patterns... I recommend a **Line Chart** with fill-to-zero to visualize the growth trajectory clearly.";
    } else if (msg.includes('split') || msg.includes('distribution')) {
      reply = "For distributions, a **Donut Chart** with at least 4 segments is the most effective way to see the share of each category.";
    } else if (msg.includes('ranking') || msg.includes('top')) {
      reply = "To show rankings, I'll prioritize a **Horizontal Bar Chart** with color gradients to highlight the top performers.";
    } else if (msg.includes('anomaly') || msg.includes('correlation')) {
      reply = "Detecting statistical variances... A **Scatter Plot** with outlier detection will help pinpoint the records requiring surgical investigation.";
    } else {
      reply = "Neural node active. I can help you perform custom inquiries. Try asking: 'Show me top regions' or 'Find highest risk records'.";
    }

    return NextResponse.json({ reply, query });

  } catch (error) {
    return NextResponse.json({ reply: "Neural Link Interrupted." }, { status: 500 });
  }
}
