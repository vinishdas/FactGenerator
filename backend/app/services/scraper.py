import trafilatura

def scrape_url(url: str) -> str:
    """
    Fetches a URL and strips away navigation, ads, and footers.
    Returns: Clean plain text string or None.
    """
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            # extract() returns the main body text
            return trafilatura.extract(downloaded)
        return None
    except Exception as e:
        print(f"Scrape Error for {url}: {e}")
        return None