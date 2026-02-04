import pandas as pd
import io

def parse_csv_urls(file_content: bytes) -> list[str]:
    """
    Reads the uploaded CSV and intelligently finds the URL column.
    """
    try:
        # Read bytes into a pandas DataFrame
        df = pd.read_csv(io.BytesIO(file_content))
        
        # Normalize column names to lowercase/stripped
        df.columns = [c.lower().strip() for c in df.columns]
        
        # Logic: Find 'source' or 'url' column
        target_col = None
        if 'source' in df.columns:
            target_col = 'source'
        elif 'url' in df.columns:
            target_col = 'url'
        elif len(df.columns) == 1:
            target_col = df.columns[0] # Fallback: use the first column
            
        if not target_col:
            return []

        # Return unique, non-empty URLs
        return df[target_col].dropna().unique().tolist()
        
    except Exception as e:
        print(f"CSV Parse Error: {e}")
        return []