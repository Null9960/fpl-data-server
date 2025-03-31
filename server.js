const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// مفتاح RapidAPI الخاص بك
const RAPID_API_KEY = 'c4f0d48511mshf920e29086d13b8p1e15cbjsnebfb8ba3b318';
const RAPID_API_HOST = 'fantasy-premier-league-fpl-api.p.rapidapi.com';

app.get('/', (req, res) => {
  res.send('🎯 FPL Server is running!');
});

// جلب بيانات عامة من FPL API
app.get('/fetch-fpl-data', async (req, res) => {
  try {
    const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
    res.json({
      message: '✅ البيانات تم جلبها بنجاح',
      players: response.data.elements.length,
      teams: response.data.teams.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تحليل لاعب حسب الاسم
app.get('/analyze/player/:name', async (req, res) => {
  const playerName = req.params.name.toLowerCase();
  try {
    const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
    const players = response.data.elements;

    const foundPlayer = players.find(player => player.web_name.toLowerCase() === playerName);

    if (!foundPlayer) {
      return res.status(404).json({ message: '❌ اللاعب غير موجود' });
    }

    const recommendation = parseFloat(foundPlayer.form) >= 5 ? '✅ احتفظ به' : '🔄 فكر ببيعه';

    res.json({
      name: foundPlayer.web_name,
      points: foundPlayer.total_points,
      form: foundPlayer.form,
      price: foundPlayer.now_cost / 10,
      status: foundPlayer.status,
      recommendation: recommendation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جلب ترتيب دوري من RapidAPI
app.get('/rapidapi/league/:id', async (req, res) => {
  const leagueId = req.params.id;

  try {
    const response = await axios.get(
      `https://${RAPID_API_HOST}/api/leagues-classic/${leagueId}/standings/`,
      {
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      }
    );

    res.json({
      message: '✅ تم جلب ترتيب الدوري بنجاح',
      standings: response.data
    });

  } catch (err) {
    res.status(500).json({
      message: '❌ فشل في جلب الترتيب',
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
