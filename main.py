import sys
import os
import argparse
import io
from forge_engine import ForgeEngine
from visual_exporter import VisualExporter
from neural_summary import NeuralSummary

# Force UTF-8 Encoding for Windows Compatibility
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def run_surgical_session(file_path, custom_query=None, regen=False, output_dir=None):
    if not os.path.exists(file_path):
        print(f"[!] Error: File {file_path} not found.")
        return

    engine = ForgeEngine()
    exporter = VisualExporter(output_dir=output_dir) if output_dir else VisualExporter()
    neural = NeuralSummary()
    engine.upload_data(file_path)

    print(f"[*] Running Surgical Insight Agent {'(Regenerating...)' if regen else ''}...")
    insights = engine.auto_analyze(regen=regen)

    print("[*] Generating Neural Summary...")
    insights['summary'] = neural.generate_summary(insights)

    # Handle Custom SQL Query
    if custom_query:
        print(f"[*] Executing Custom SQL: {custom_query}")
        try:
            insights['custom'] = engine.run_surgical_query(custom_query)
        except Exception as e:
            print(f"[!] SQL Error: {e}")

    print("[*] Forging Adaptive Multi-Tool Visual Dashboard...")
    project_name = os.path.splitext(os.path.basename(file_path))[0]
    dashboard_path = exporter.create_dashboard(insights, project_name=project_name)

    print("-" * 50)
    print("SUCCESS: MISSION COMPLETE")
    print(f"Insights forged: {len(insights['visuals'])} Visuals")
    print(f"Dashboard Ready: {dashboard_path}")
    print("-" * 50)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Surgical Analytics Forge")
    parser.add_argument("file", help="Path to your data file (CSV/Excel)")
    parser.add_argument("-q", "--query", help="Custom SQL query", default=None)
    parser.add_argument("-r", "--regen", help="Regenerate with different visuals", action="store_true")
    parser.add_argument("--web", help="Web mode activation", action="store_true")
    parser.add_argument("--output_dir", help="Custom output directory for dashboards", default=None)
    
    args = parser.parse_args()
    run_surgical_session(args.file, args.query, args.regen, args.output_dir)
