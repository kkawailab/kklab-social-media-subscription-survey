import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'survey.db'));

db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create surveys table
  db.run(`
    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      is_visible INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create survey_responses table
  db.run(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
    )
  `);

  // Create social_media_selections table
  db.run(`
    CREATE TABLE IF NOT EXISTS social_media_selections (
      id TEXT PRIMARY KEY,
      response_id TEXT NOT NULL,
      platform_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (response_id) REFERENCES survey_responses(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id
    ON survey_responses(survey_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_social_media_selections_response_id
    ON social_media_selections(response_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_social_media_selections_platform
    ON social_media_selections(platform_name)
  `, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('✅ Database initialized successfully!');
      console.log('📁 Database file: survey.db');
    }
    db.close();
  });
});
