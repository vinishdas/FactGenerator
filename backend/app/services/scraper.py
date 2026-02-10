import sys
import asyncio
import logging
import trafilatura
import platform
import requests 
import nest_asyncio
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

nest_asyncio.apply()
if platform.system() == 'Windows':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

logger = logging.getLogger(__name__)

# --- HEADERS ---
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
}

def clean_html_soup(soup):
    if not soup: return None
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "iframe", "svg", "button", "input"]):
        tag.decompose()
    return soup

# --- 1. TRAFILATURA (Super Fast) ---
def _scrape_trafilatura(url: str) -> str:
    try:
        # Fast mode, no fallback
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            text = trafilatura.extract(downloaded, include_tables=False, deduplicate=True)
            if text and len(text) > 200: return text
    except: pass
    return None

# --- 2. BASIC REQUESTS (Fast Fallback) ---
def _scrape_basic_bs4(url: str) -> str:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=5) # Short timeout
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.content, 'html.parser')
            clean_html_soup(soup)
            text = soup.get_text(separator="\n")
            if len(text) > 200: return text
    except: pass
    return None

# --- 3. JINA READER (API Fallback) ---
def _scrape_jina_reader(url: str) -> str:
    try:
        resp = requests.get(f"https://r.jina.ai/{url}", timeout=10)
        if resp.status_code == 200 and len(resp.text) > 200:
            return resp.text
    except: pass
    return None

# --- 4. PLAYWRIGHT (Last Resort - Slow) ---
async def _scrape_playwright_async(url: str) -> str:
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(user_agent=HEADERS['User-Agent'])
            try:
                # Aggressive timeout (15s instead of 30s)
                await page.goto(url, timeout=15000, wait_until="domcontentloaded")
                content = await page.content()
                soup = BeautifulSoup(content, 'html.parser')
                clean_html_soup(soup)
                return soup.get_text(separator="\n")
            finally:
                await browser.close()
    except Exception as e:
        logger.warning(f"PW failed: {e}")
    return None

def _run_sync(coroutine):
    try:
        loop = asyncio.get_running_loop()
        import nest_asyncio
        nest_asyncio.apply(loop)
        return loop.run_until_complete(coroutine)
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(coroutine)
        loop.close()
        return result

# --- MAIN ENTRY ---
def scrape_url(url: str) -> str:
    # 1. Try Trafilatura (Fastest)
    text = _scrape_trafilatura(url)
    if text: return text

    # 2. Try Basic Requests (Fast)
    text = _scrape_basic_bs4(url)
    if text: return text

    # 3. Try Jina (Reliable External)
    text = _scrape_jina_reader(url)
    if text: return text

    # 4. Only then try Playwright (Slow)
    try:
        text = _run_sync(_scrape_playwright_async(url))
        if text: return text
    except: pass

    return None