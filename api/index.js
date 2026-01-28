const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());

app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query missing" });

    // FAST MODE: ytsearch5 ताकि जल्दी रिजल्ट आये
    const command = `yt-dlp "ytsearch5:${query}" --dump-json --flat-playlist --skip-download --nocheckcertificate`;

    exec(command, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: "Error: " + error.message });

        try {
            const results = stdout.trim().split('\n').map(line => {
                const data = JSON.parse(line);
                return {
                    id: data.id,
                    title: data.title,
                    thumbnail: `https://img.youtube.com/vi/${data.id}/hqdefault.jpg`,
                    is_live: data.live_status === 'is_live',
                    is_upcoming: data.live_status === 'is_upcoming',
                    waiting: data.concurrent_view_count || 0
                };
            });
            res.json(results);
        } catch (e) {
            res.status(500).json({ error: "Parsing Error" });
        }
    });
});

module.exports = app;

