# BigQuery Release Notes Explorer & X (Twitter) Share Dashboard 🚀

A sleek, premium, responsive web application to explore, search, filter, and share Google Cloud BigQuery release notes. 

Built with **Python Flask** on the backend and **vanilla HTML, CSS, and JavaScript** on the frontend, this app adopts a high-quality obsidian-blue glassmorphism theme and features an intelligent X (Twitter) share composer.

---

## 💎 Features

- **Automated Feed Parsing**: Fetches the official [BigQuery Release Notes XML Feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml) and parses it into structured JSON.
- **Granular Updates**: Splits day-based release logs by categories (Features, Issues, Changes, Breaking changes, Announcements) so you can interact with individual items.
- **Sleek Dark Theme**: Implements a Google Cloud-inspired dark dashboard using glassmorphism styling, clean animations, and responsive grids.
- **Live Search & Filters**: Dynamically query updates by keyword or filter them by category (e.g. only show "Breaking" announcements) with instant page updates.
- **Smart Twitter/X Composer**:
  - Automatically truncates long descriptions to stay safely within the **280-character limit**.
  - Adds interactive tag pills (`#BigQuery`, `#GoogleCloud`, `#AI`, `#Gemini`) that update remaining characters in real-time.
  - Generates official documentation reference links (`Docs: URL`).
  - Single-click action to tweet via X web intent or copy the raw text to your clipboard.
- **Performance Caching**: Implements a 5-minute in-memory cache to prevent redundant external network requests and ensure lightning-fast page loading.

---

## 📁 Project Structure

```
event-talks-app/
├── app.py                  # Flask application (Backend API & caching)
├── templates/
│   └── index.html          # Dashboard page (HTML5 semantic structure)
├── static/
│   ├── css/
│   │   └── style.css       # Obsidian glassmorphism stylesheet
│   └── js/
│       └── main.js         # Frontend interactive logic (AJAX, stats, compose modal)
├── .gitignore              # Files excluded from git tracking
└── README.md               # Project documentation (this file)
```

---

## 🛠️ How to Setup and Run

### Prerequisites
- Python 3.8+
- pip (Python package installer)

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RT91-data/event-talks-app.git
   cd event-talks-app
   ```

2. **Install Dependencies**:
   Install the required libraries (`Flask` and `requests`):
   ```bash
   pip install Flask requests
   ```

3. **Run the Application**:
   Start the development server:
   ```bash
   python app.py
   ```

4. **Access the Dashboard**:
   Open your browser and navigate to:
   👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
