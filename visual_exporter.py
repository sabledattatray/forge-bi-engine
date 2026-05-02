import plotly.express as px
import plotly.graph_objects as go
import os
import re

class VisualExporter:
    """
    Surgical Visual Exporter V14 - The Flagship Edition
    Uses HTML-native KPI cards for maximum stability and centering.
    Features robust markdown parsing and pixel-perfect responsive architecture.
    """
    def __init__(self, output_dir=None):
        self.output_dir = output_dir if output_dir else "exports"
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def _get_theme(self, height=420):
        return go.Layout(
            template="plotly_dark",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Outfit, sans-serif", color="#e0e0e0", size=11),
            margin=dict(t=80, b=50, l=70, r=40),
            height=height,
            autosize=True,
            title=dict(x=0.5, xanchor='center', font=dict(size=18, color='#00f2ff', family='Outfit', weight=600))
        )

    def format_value(self, label, value):
        """Smart formatting for KPI values."""
        if 'DISCOUNT' in label.upper() or 'RATE' in label.upper():
            return f"{value*100:.1f}%" if value < 1 else f"{value:.1f}%"
        if isinstance(value, (int, float)):
            if value >= 1000000000: return f"{value/1000000000:.1f}B"
            if value >= 1000000: return f"{value/1000000:.1f}M"
            if value >= 1000: return f"{value/1000:.1f}K"
            return f"{value:.2f}" if isinstance(value, float) else str(value)
        return str(value)

    def render_visual(self, viz):
        v_type = viz['type']
        df = viz['data']
        title = f"<b>{viz['title'].upper()}</b>"

        if v_type == 'line':
            fig = px.line(df, x=df.columns[0], y=df.columns[1], title=title)
            fig.update_traces(line_color='#00f2ff', fill='tozeroy', line_width=3)
        elif v_type == 'bar':
            df_temp = df.copy()
            df_temp.iloc[:, 0] = df_temp.iloc[:, 0].apply(lambda x: str(x)[:12] + '..' if len(str(x)) > 14 else str(x))
            fig = px.bar(df_temp, x=df_temp.columns[0], y=df_temp.columns[1], title=title, color=df_temp.columns[1], color_continuous_scale='Blues')
        elif v_type == 'pie':
            fig = px.pie(df, values=df.columns[1], names=df.columns[0], title=title, hole=.6)
            fig.update_traces(textinfo='percent', marker=dict(colors=['#00f2ff', '#7000ff', '#0070ff', '#333']))
        elif v_type == 'funnel':
            df_temp = df.copy()
            df_temp.iloc[:, 0] = df_temp.iloc[:, 0].apply(lambda x: str(x)[:10] + '..' if len(str(x)) > 12 else str(x))
            fig = px.funnel(df_temp, x=df_temp.columns[1], y=df_temp.columns[0], title=title, color_discrete_sequence=['#7000ff'])
        elif v_type == 'scatter':
            fig = px.scatter(df, x=df.columns[0], y=df.columns[1], title=title, color_continuous_scale='Viridis')
        else:
            return None

        fig.update_layout(self._get_theme())
        return fig

    def create_dashboard(self, insights, project_name="Surgical_Insight"):
        visual_figs = [self.render_visual(v) for v in insights['visuals'] if self.render_visual(v) is not None]
        
        # Build Native HTML KPI Cards for Stability
        kpi_html = ""
        for label, val in insights['kpis'].items():
            fmt_val = self.format_value(label, val)
            kpi_html += f"""
            <div class="kpi-card">
                <div class="kpi-label">{label.replace('_', ' ')}</div>
                <div class="kpi-value">{fmt_val}</div>
            </div>
            """

        # Format Summary
        summary = insights.get('summary', '')
        summary = re.sub(r'## (.*)', r'<h2>🚀 \1</h2>', summary)
        summary = re.sub(r'### (.*)', r'<h4>⚡ \1</h4>', summary)
        summary = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', summary)
        summary = re.sub(r'- (.*)', r'<li>\1</li>', summary)
        summary = summary.replace('\n\n', '</p><p>').replace('\n', '<br>')
        summary = f"<p>{summary}</p>".replace('<li>', '<ul><li>').replace('</li>', '</li></ul>').replace('</ul><ul>', '')

        output_path = os.path.join(self.output_dir, f"{project_name}_dashboard.html")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>{project_name} | Surgical Forge</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
                <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
                <style>
                    :root {{ --accent: #00f2ff; --bg: #060606; --card: rgba(20,20,20,0.6); }}
                    body {{ 
                        background: radial-gradient(circle at top right, #0d0d0d 0%, var(--bg) 100%); 
                        color: white; font-family: 'Outfit', sans-serif; margin: 0; padding: 60px; 
                    }}
                    .container {{ max-width: 1500px; margin: 0 auto; }}
                    
                    .header {{ 
                        display: flex; justify-content: space-between; align-items: flex-end; 
                        margin-bottom: 60px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px;
                    }}
                    .logo h1 {{ 
                        font-size: 2.8rem; letter-spacing: -2px; margin: 0; text-transform: uppercase; font-weight: 800;
                        background: linear-gradient(to right, #fff, var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    }}
                    
                    .kpi-grid {{ 
                        display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 60px; justify-content: center;
                    }}
                    .kpi-card {{ 
                        flex: 1 1 220px; max-width: 280px; background: var(--card); backdrop-filter: blur(15px);
                        border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 35px 20px;
                        text-align: center; transition: all 0.4s ease;
                    }}
                    .kpi-card:hover {{ transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 15px 40px rgba(0,242,255,0.1); }}
                    .kpi-label {{ font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }}
                    .kpi-value {{ font-family: 'JetBrains Mono'; font-size: 2.2rem; color: var(--accent); font-weight: 700; }}

                    .chart-grid {{ 
                        display: grid; grid-template-columns: repeat(2, 1fr); gap: 35px; 
                    }}
                    .chart-card {{ 
                        background: var(--card); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.08); 
                        border-radius: 24px; padding: 20px; min-height: 480px;
                    }}
                    
                    .summary-box {{ 
                        background: linear-gradient(135deg, #0a0a0a 0%, #111 100%); 
                        border-top: 4px solid #7000ff; border-radius: 24px; padding: 60px; margin-top: 80px; 
                        line-height: 2; color: rgba(255,255,255,0.7); font-size: 1.05rem;
                    }}
                    .summary-box h2 {{ color: var(--accent); font-size: 2rem; margin-bottom: 40px; text-transform: uppercase; font-weight: 800; }}
                    .summary-box h4 {{ color: #fff; font-size: 1.3rem; margin: 40px 0 15px 0; }}
                    .summary-box blockquote {{ 
                        border-left: 4px solid var(--accent); padding: 25px 40px; color: var(--accent); 
                        font-style: italic; background: rgba(0,242,255,0.03); margin: 50px 0; border-radius: 8px;
                    }}
                    ul {{ padding-left: 20px; }}
                    li {{ margin-bottom: 10px; }}

                    @media (max-width: 1100px) {{ .chart-grid {{ grid-template-columns: 1fr; }} body {{ padding: 30px; }} }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            <h1>{project_name.replace('_', ' ')}</h1>
                            <div style="font-family: 'JetBrains Mono'; font-size: 0.7rem; color: var(--accent); margin-top: 8px;">
                                [ VERSION 14.0 FLAGSHIP ] • [ STATUS: SYSTEM ONLINE ]
                            </div>
                        </div>
                    </div>
                    
                    <div class="kpi-grid">
                        {kpi_html}
                    </div>

                    <div class="chart-grid">
                        {"".join([f'<div class="chart-card">{fig.to_html(full_html=False, include_plotlyjs=False, config={"responsive": True, "displayModeBar": False})}</div>' for fig in visual_figs])}
                    </div>

                    {f'''
                    <div class="summary-box" style="margin-top: 40px; border-top-color: #00f2ff;">
                        <h2>🎯 SURGICAL INSIGHT</h2>
                        <div style="overflow-x: auto; font-family: 'JetBrains Mono'; font-size: 0.9rem;">
                            <table style="width: 100%; border-collapse: collapse; color: #fff;">
                                <thead>
                                    <tr style="background: rgba(0,242,255,0.1); border-bottom: 2px solid #00f2ff;">
                                        {"".join([f'<th style="padding: 15px; text-align: left;">{col.upper()}</th>' for col in insights["custom"].columns])}
                                    </tr>
                                </thead>
                                <tbody>
                                    {"".join([f'<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">{"".join([f"<td style='padding: 15px;'>{row[col]}</td>" for col in insights["custom"].columns])}</tr>' for _, row in insights["custom"].iloc[:15].iterrows()])}
                                </tbody>
                            </table>
                            {f'<div style="margin-top: 15px; font-size: 0.7rem; color: #555;">* Showing first 15 records of your custom inquiry.</div>' if len(insights["custom"]) > 15 else ''}
                        </div>
                    </div>
                    ''' if 'custom' in insights and not insights['custom'].empty else ''}

                    <div class="summary-box">
                        {summary}
                    </div>
                </div>
            </body>
            </html>
            """)
            
        return output_path
