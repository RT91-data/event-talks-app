# BigQuery Release Notes Explorer & X (Twitter) Share Dashboard 🚀

A sleek, premium, responsive web application to explore, search, filter, and share Google Cloud BigQuery release notes. 

Built with **Python Flask** on the backend and **vanilla HTML, CSS, and JavaScript** on the frontend, this app adopts a high-quality obsidian-blue glassmorphism theme and features an intelligent X (Twitter) share composer.

---

## 💎 Features

- **Automated Feed Parsing**: Fetches the official [BigQuery Release Notes XML Feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml) and parses it into structured JSON.
- **Granular Updates**: Splits day-based release logs by categories (Features, Issues, Changes, Breaking changes, Announcements) so you can interact with individual items.
- **Theme Toggle Switch**: Seamlessly switch between the default obsidian-blue dark mode and a clean, high-contrast light mode with a single header action.
- **Live Search & Filters**: Dynamically query updates by keyword or filter them by category (e.g. only show "Breaking" announcements) with instant page updates.
- **Direct Copy to Clipboard**: Copy any individual update description text directly from the dashboard cards with a single click.
- **Export to CSV Utility**: Download the entire release notes database (Date, Type, Link, Description) locally as a formatted `.csv` file.
- **Smart Twitter/X Composer**:
  - **Preserves Manual Edits**: Dynamically extracts the custom message you type in the text box and preserves it when you toggle hashtags.
  - **Reference Link Toggle**: A custom sliding switch inside the modal lets you easily include or exclude the Google documentation URL to free up 77 characters.
  - **Auto-Formatting**: Truncates long descriptions automatically on initial load to fit the **280-character limit**.
  - **Quick-Tag Pills**: Tap to toggle hashtags (`#BigQuery`, `#GoogleCloud`, `#AI`, `#Gemini`) which dynamically append/remove from the tweet and recalculate limits in real-time.
  - **One-click Share**: Opens the X web intent URL (`https://twitter.com/intent/tweet?text=...`) in a tailored popup or copies the text to the clipboard.
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
│   │   └── style.css       # Obsidian glassmorphism stylesheet & light overrides
│   └── js/
│       └── main.js         # Frontend interactive logic (theme, export, clipboard, composer)
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
