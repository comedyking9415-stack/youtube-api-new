const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec');
const app = express();

app.use(cors());

// टेस्ट करने के लिए होम पेज
app.get('/', (req, res) => {
    res.send('ALZ Proxy is LIVE! Use /api/search?q=your_query');
});

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query missing" });

    try {
        // ytdlp-exec का इस्तेमाल करके स्मार्ट सर्च
        const output = await ytdlp(`ytsearch5:${query}`, {
            dumpJson: true,
            flatPlaylist: true,
            skipDownload: true,
            noCheckCertificates: true,
        });

        // अगर सर्च में मल्टीपल रिजल्ट्स हैं तो उन्हें फॉर्मेट करना
        const results = output.entries.map(entry => ({
            id: entry.id,
            title: entry.title,
            thumbnail: `https://img.youtube.com/vi/${entry.id}/hqdefault.jpg`,
            is_live: entry.live_status === 'is_live',
            is_upcoming: entry.live_status === 'is_upcoming',
            waiting: entry.concurrent_view_count || 0,
            channel: entry.uploader
        }));

        res.json(results);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ 
            error: "Failed to fetch data", 
            details: error.message 
        });
    }
});

module.exports = app;

