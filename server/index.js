import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new sqlite3.Database(join(__dirname, 'survey.db'));
db.run('PRAGMA foreign_keys = ON');

// Helper to promisify database methods
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Middleware
app.use(cors());
app.use(express.json());

// ============ Survey Endpoints ============

// Get all visible surveys
app.get('/api/surveys', async (req, res) => {
  try {
    const surveys = await dbAll(`
      SELECT * FROM surveys
      WHERE is_visible = 1
      ORDER BY created_at DESC
    `);
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all surveys (for admin)
app.get('/api/surveys/all', async (req, res) => {
  try {
    const surveys = await dbAll(`
      SELECT * FROM surveys
      ORDER BY created_at DESC
    `);
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single survey
app.get('/api/surveys/:id', async (req, res) => {
  try {
    const survey = await dbGet('SELECT * FROM surveys WHERE id = ?', [req.params.id]);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create survey
app.post('/api/surveys', async (req, res) => {
  try {
    const { title, description, is_active = true, is_visible = true } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    await dbRun(`
      INSERT INTO surveys (id, title, description, is_active, is_visible, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, title, description, is_active ? 1 : 0, is_visible ? 1 : 0, now, now]);

    const survey = await dbGet('SELECT * FROM surveys WHERE id = ?', [id]);
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update survey
app.put('/api/surveys/:id', async (req, res) => {
  try {
    const { title, description, is_active, is_visible } = req.body;
    const now = new Date().toISOString();

    const result = await dbRun(`
      UPDATE surveys
      SET title = ?, description = ?, is_active = ?, is_visible = ?, updated_at = ?
      WHERE id = ?
    `, [title, description, is_active ? 1 : 0, is_visible ? 1 : 0, now, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const survey = await dbGet('SELECT * FROM surveys WHERE id = ?', [req.params.id]);
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete survey
app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM surveys WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Response Endpoints ============

// Submit survey response
app.post('/api/responses', async (req, res) => {
  try {
    const { survey_id, platforms } = req.body;

    if (!survey_id || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const responseId = uuidv4();
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    // Insert response
    await dbRun(`
      INSERT INTO survey_responses (id, survey_id, session_id, created_at)
      VALUES (?, ?, ?, ?)
    `, [responseId, survey_id, sessionId, now]);

    // Insert selections
    for (const platform of platforms) {
      await dbRun(`
        INSERT INTO social_media_selections (id, response_id, platform_name, created_at)
        VALUES (?, ?, ?, ?)
      `, [uuidv4(), responseId, platform, now]);
    }

    res.status(201).json({ id: responseId, message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get survey results
app.get('/api/surveys/:id/results', async (req, res) => {
  try {
    const surveyId = req.params.id;

    // Get total responses
    const totalResult = await dbGet(`
      SELECT COUNT(*) as count
      FROM survey_responses
      WHERE survey_id = ?
    `, [surveyId]);

    const totalResponses = totalResult.count;

    // Get platform counts
    const platformCounts = await dbAll(`
      SELECT
        sms.platform_name,
        COUNT(*) as count
      FROM social_media_selections sms
      JOIN survey_responses sr ON sms.response_id = sr.id
      WHERE sr.survey_id = ?
      GROUP BY sms.platform_name
      ORDER BY count DESC
    `, [surveyId]);

    res.json({
      total_responses: totalResponses,
      platform_counts: platformCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get survey statistics (for admin)
app.get('/api/surveys/:id/stats', async (req, res) => {
  try {
    const surveyId = req.params.id;

    // Get total responses
    const totalResult = await dbGet(`
      SELECT COUNT(*) as count
      FROM survey_responses
      WHERE survey_id = ?
    `, [surveyId]);

    const totalResponses = totalResult.count;

    // Get platform counts
    const platformCounts = await dbAll(`
      SELECT
        sms.platform_name,
        COUNT(*) as count
      FROM social_media_selections sms
      JOIN survey_responses sr ON sms.response_id = sr.id
      WHERE sr.survey_id = ?
      GROUP BY sms.platform_name
      ORDER BY count DESC
    `, [surveyId]);

    // Get recent responses
    const recentResponses = await dbAll(`
      SELECT
        sr.id,
        sr.created_at,
        GROUP_CONCAT(sms.platform_name, ', ') as platforms
      FROM survey_responses sr
      LEFT JOIN social_media_selections sms ON sr.id = sms.response_id
      WHERE sr.survey_id = ?
      GROUP BY sr.id
      ORDER BY sr.created_at DESC
      LIMIT 10
    `, [surveyId]);

    res.json({
      total_responses: totalResponses,
      platform_counts: platformCounts,
      recent_responses: recentResponses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all responses for a survey
app.delete('/api/surveys/:id/responses', async (req, res) => {
  try {
    const surveyId = req.params.id;

    const result = await dbRun('DELETE FROM survey_responses WHERE survey_id = ?', [surveyId]);

    res.json({
      message: 'All responses deleted successfully',
      deleted_count: result.changes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('\n👋 Database connection closed');
    }
    process.exit(0);
  });
});
