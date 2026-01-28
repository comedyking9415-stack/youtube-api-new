from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/search')
def search():
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "No query"}), 400

    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'force_generic_ext': True,
        'nocheckcertificate': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # सर्च कमांड
            info = ydl.extract_info(f"ytsearch5:{query}", download=False)
            results = []
            for entry in info.get('entries', []):
                results.append({
                    "id": entry.get('id'),
                    "title": entry.get('title'),
                    "thumbnail": f"https://img.youtube.com/vi/{entry.get('id')}/hqdefault.jpg"
                })
            return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel के लिए ज़रूरी
def handler(event, context):
    return app(event, context)

