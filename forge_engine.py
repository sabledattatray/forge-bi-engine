import duckdb
import pandas as pd
import os
import random

class ForgeEngine:
    """
    Surgical Data Forge V7 - The Adaptive Intelligence
    Features randomization for "Regenerate" capabilities to explore different data dimensions.
    """
    def __init__(self):
        self.con = duckdb.connect(database=':memory:')
        self.prefs = self._load_prefs()

    def _load_prefs(self):
        pref_path = os.path.join(os.path.dirname(__file__), 'preferences.json')
        if os.path.exists(pref_path):
            import json
            with open(pref_path, 'r') as f:
                return json.load(f)
        return {'likes': [], 'dislikes': []}

    def upload_data(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.csv':
            self.con.execute(f"CREATE TABLE data AS SELECT * FROM read_csv_auto('{file_path}', ignore_errors=true)")
        elif ext in ['.xlsx', '.xls']:
            df = pd.read_excel(file_path)
            self.con.register('df_temp', df)
            self.con.execute("CREATE TABLE data AS SELECT * FROM df_temp")
        return self.con.execute("DESCRIBE data").fetchdf()

    def run_surgical_query(self, sql_query):
        return self.con.execute(sql_query).fetchdf()

    def auto_analyze(self, regen=False):
        cols = self.con.execute("DESCRIBE data").fetchdf()
        numeric = cols[cols['column_type'].str.contains('INT|FLOAT|DOUBLE|DECIMAL', case=False, na=False)]['column_name'].tolist()
        dates = cols[cols['column_type'].str.contains('DATE|TIMESTAMP', case=False, na=False)]['column_name'].tolist()
        strings = cols[cols['column_type'].str.contains('VARCHAR', case=False, na=False)]['column_name'].tolist()

        if regen:
            random.shuffle(strings)
            random.shuffle(numeric)

        insights = {'kpis': {}, 'visuals': []}
        
        # KPIs (Surgical Selection)
        for n in numeric:
            n_up = n.upper()
            if any(x in n_up for x in ['LAT', 'LON', 'COORD']): continue
            if 'ID' in n_up:
                insights['kpis'][f'UNIQUE {n_up}'] = self.con.execute(f"SELECT COUNT(DISTINCT {n}) FROM data").fetchone()[0]
            elif any(x in n_up for x in ['RATING', 'SCORE', 'PRICE', 'DISCOUNT', 'AVG']):
                val = self.con.execute(f"SELECT AVG({n}) FROM data").fetchone()[0]
                insights['kpis'][f'AVG {n_up}'] = round(val, 2) if val else 0
            else:
                val = self.con.execute(f"SELECT SUM({n}) FROM data").fetchone()[0]
                insights['kpis'][f'TOTAL {n_up}'] = val
            if len(insights['kpis']) >= 6: break
        
        insights['kpis']['TOTAL RECORDS'] = self.con.execute(f"SELECT COUNT(*) FROM data").fetchone()[0]

        # Dynamic Visuals
        target_metric = 'Sales' if 'Sales' in numeric else 'Amount' if 'Amount' in numeric else numeric[0] if numeric else None

        if dates and target_metric:
            insights['visuals'].append({'type': 'line', 'title': f'Trend: {target_metric}', 
                                      'data': self.run_surgical_query(f"SELECT {dates[0]}, SUM({target_metric}) FROM data GROUP BY 1 ORDER BY 1")})

        # Process Strings for Charts
        for s in strings[:4]: # Analyze more strings for "More Visuals"
            cardinality = self.con.execute(f"SELECT COUNT(DISTINCT {s}) FROM data").fetchone()[0]
            if target_metric:
                if 2 <= cardinality <= 6:
                    insights['visuals'].append({'type': 'pie', 'title': f'Split: {s}', 
                                              'data': self.run_surgical_query(f"SELECT {s}, SUM({target_metric}) FROM data GROUP BY 1 ORDER BY 2 DESC")})
                elif cardinality <= 25:
                    insights['visuals'].append({'type': 'bar', 'title': f'Ranking: {s}', 
                                              'data': self.run_surgical_query(f"SELECT {s}, SUM({target_metric}) FROM data GROUP BY 1 ORDER BY 2 DESC LIMIT 15")})
                elif cardinality > 25:
                    insights['visuals'].append({'type': 'funnel', 'title': f'Flow: {s}', 
                                              'data': self.run_surgical_query(f"SELECT {s}, SUM({target_metric}) FROM data GROUP BY 1 ORDER BY 2 DESC LIMIT 10")})

        if len(numeric) >= 2:
            insights['visuals'].append({'type': 'scatter', 'title': 'Correlation Scan', 
                                      'data': self.run_surgical_query(f"SELECT {numeric[0]}, {numeric[1]} FROM data LIMIT 1000")})

        return insights
