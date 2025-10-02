/**
 * White‑label AI Backend Server (minimal)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const agentsRoutes = require('./routes/agents');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic logging
app.use((req, res, next) => { console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`); next(); });

// Health endpoints compatible avec le frontend
app.get('/api/v2/health', (req, res) => res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() }));

// Agents API
app.use('/api/agents', agentsRoutes);

// Root info
app.get('/', (req, res) => {
  res.json({
    name: 'AI Service (White‑label)',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/v2/health',
      agents: {
        transform: 'POST /api/agents/transform',
        execute: 'POST /api/agents/execute/:agentId',
        contentWorkflow: 'POST /api/agents/workflows/content-creation',
        providers: 'GET /api/agents/ai-providers'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => res.status(404).json({ success: false, error: 'Route not found', path: req.originalUrl }));

const server = app.listen(PORT, () => {
  console.log(`🚀 White‑label AI backend listening on http://localhost:${PORT}`);
});

module.exports = { app, server };


