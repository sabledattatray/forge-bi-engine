class NeuralSummary:
    """
    Surgical Neural Summary Engine V3 - Ultra-Premium Edition
    Generates sophisticated, multi-formatted executive insights using professional language.
    """
    def generate_summary(self, insights):
        kpis = insights.get('kpis', {})
        total_records = kpis.get('TOTAL RECORDS', 0)
        
        # 1. Strategic Overview (Paragraph)
        summary = []
        summary.append("## 🧠 Neural Executive Strategy")
        
        overview = (
            f"The Neural Engine has completed a comprehensive audit of **{total_records:,}** surgical records. "
            "Our multi-dimensional analysis indicates a highly active data ecosystem with strong internal consistency. "
            "The following high-fidelity insights have been extracted to guide strategic decision-making."
        )
        summary.append(overview)

        # 2. Key Performance Pillars (Bullet Points)
        pillars = ["### 📊 Key Performance Pillars"]
        
        # Unique Entities
        for label, val in kpis.items():
            if 'UNIQUE' in label:
                pillars.append(f"- **Network Scale:** Detected **{val:,}** unique entities, establishing a robust operational foundation.")
            if 'AVG RATING' in label:
                pillars.append(f"- **Service Quality:** The current average rating of **{val}** signals a high level of customer satisfaction and brand loyalty.")
            if 'AVG DISCOUNT' in label:
                pillars.append(f"- **Incentive Strategy:** An average discount rate of **{val*100:.1f}%** is being applied across the volume, suggesting a strategic focus on market penetration.")

        # Temporal Trend
        if 'trend' in insights:
            df = insights['trend']
            if not df.empty:
                first_val = df.iloc[0, 1]
                last_val = df.iloc[-1, 1]
                growth = ((last_val - first_val) / first_val) * 100 if first_val != 0 else 0
                sentiment = "strengthening" if growth > 0 else "correcting"
                pillars.append(f"- **Growth Trajectory:** The system is currently in a **{sentiment}** phase, with a performance shift of **{abs(growth):.1f}%** over the reporting period.")

        summary.append("\n".join(pillars))

        # 3. Sector Dominance & Anomaly (Detailed Paragraph)
        sector_text = "### 🎯 Operational Intelligence"
        dominant_sector = "None"
        for viz in insights.get('visuals', []):
            if viz['type'] in ['bar', 'pie']:
                df = viz['data']
                if not df.empty:
                    dominant_sector = df.iloc[0, 0]
                    break
        
        intel = (
            f"From an operational perspective, the **{dominant_sector}** segment is demonstrating significant dominance, "
            "effectively acting as the primary performance node in the network. "
        )
        
        # Anomaly Detection
        anomalies_found = False
        for viz in insights.get('visuals', []):
            if viz['type'] == 'scatter':
                df = viz['data']
                if len(df) > 0:
                    mean = df.iloc[:, 1].mean()
                    std = df.iloc[:, 1].std()
                    outliers = df[df.iloc[:, 1] > (mean + 2*std)]
                    if len(outliers) > 0:
                        anomalies_found = True
                        intel += (
                            f"Furthermore, our surgical anomaly scan has identified **{len(outliers)}** statistical outliers. "
                            "These records deviate significantly from standard operational parameters and require immediate surgical investigation."
                        )
                    break
        
        if not anomalies_found:
            intel += "The statistical integrity of the dataset remains within standard deviations, with no immediate anomalies detected."

        summary.append(sector_text + "\n" + intel)

        # 4. Final Verdict
        summary.append("> **Surgical Verdict:** The data ecosystem is stable. Recommended focus on maintaining the momentum in the **" + str(dominant_sector) + "** sector while auditing outlier variances.")

        return "\n\n".join(summary)
