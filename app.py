import xml.etree.ElementTree as ET
import html
import requests
from flask import Flask, jsonify, render_template, request
import time
import re

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

# In-memory cache for feed data to avoid frequent requests
feed_cache = {
    "data": None,
    "last_fetched": 0
}
CACHE_DURATION = 300 # 5 minutes

def parse_xml_feed(xml_content):
    # Atom namespace
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    
    try:
        root = ET.fromstring(xml_content)
    except Exception as e:
        print(f"XML Parsing Error: {e}")
        return []
        
    entries = []
    
    # Root element in Atom is <feed>
    for entry in root.findall('atom:entry', ns):
        # Date of the entry (from title, e.g. "June 15, 2026")
        title_el = entry.find('atom:title', ns)
        date_str = title_el.text if title_el is not None else "Unknown Date"
        
        # Link
        link_el = entry.find("atom:link[@rel='alternate']", ns)
        if link_el is None:
            link_el = entry.find("atom:link", ns)
        link = link_el.attrib.get('href', '') if link_el is not None else ''
        
        # Updated timestamp
        updated_el = entry.find('atom:updated', ns)
        updated_str = updated_el.text if updated_el is not None else ""
        
        # Content HTML
        content_el = entry.find('atom:content', ns)
        content_html = content_el.text if content_el is not None else ""
        
        # We want to split the HTML by <h3> to get individual updates
        individual_updates = []
        if content_html:
            # Split by <h3>
            parts = content_html.split('<h3>')
            for part in parts:
                if not part.strip():
                    continue
                if '</h3>' in part:
                    type_part, desc_part = part.split('</h3>', 1)
                    update_type = type_part.strip()
                    update_desc = desc_part.strip()
                    
                    # For Tweet text, we need a clean plain-text version of the description.
                    clean_text = re.sub('<[^<]+?>', '', update_desc)
                    clean_text = html.unescape(clean_text)
                    clean_text = ' '.join(clean_text.split()) # normalize whitespace
                    
                    individual_updates.append({
                        "type": update_type,
                        "description_html": update_desc,
                        "description_text": clean_text
                    })
        
        # If there are no individual updates (perhaps the structure is different), add the whole content as one item
        if not individual_updates and content_html:
            clean_text = re.sub('<[^<]+?>', '', content_html)
            clean_text = html.unescape(clean_text)
            clean_text = ' '.join(clean_text.split())
            individual_updates.append({
                "type": "General",
                "description_html": content_html,
                "description_text": clean_text
            })
            
        entries.append({
            "date": date_str,
            "updated": updated_str,
            "link": link,
            "updates": individual_updates
        })
        
    return entries

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    current_time = time.time()
    
    if force_refresh or not feed_cache["data"] or (current_time - feed_cache["last_fetched"] > CACHE_DURATION):
        try:
            response = requests.get(FEED_URL, timeout=10)
            if response.status_code == 200:
                entries = parse_xml_feed(response.content)
                feed_cache["data"] = entries
                feed_cache["last_fetched"] = current_time
            else:
                if feed_cache["data"]:
                    return jsonify({
                        "status": "warning",
                        "message": f"Failed to fetch new data (Status: {response.status_code}). Using cached data.",
                        "data": feed_cache["data"]
                    })
                return jsonify({"status": "error", "message": f"Failed to fetch feed. Status: {response.status_code}"}), response.status_code
        except Exception as e:
            if feed_cache["data"]:
                return jsonify({
                    "status": "warning",
                    "message": f"Failed to fetch new data (Error: {str(e)}). Using cached data.",
                    "data": feed_cache["data"]
                })
            return jsonify({"status": "error", "message": f"Error fetching feed: {str(e)}"}), 500
            
    return jsonify({
        "status": "success",
        "data": feed_cache["data"],
        "cached_at": feed_cache["last_fetched"]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
