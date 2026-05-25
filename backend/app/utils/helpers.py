from datetime import datetime
import re

def format_timestamp(dt: datetime) -> str:
    """Formats a datetime object to a standardized medical record timestamp string."""
    if not dt:
        return "N/A"
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")

def clean_whitespace(text: str) -> str:
    """Cleans up redundant whitespaces, newlines, and trailing characters in patient records."""
    if not text:
        return ""
    # Replace multiple spaces/newlines with a single space
    cleaned = re.sub(r"\s+", " ", text)
    return cleaned.strip()
