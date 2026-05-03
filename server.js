// server.js — SBTC Zona 5 Backend API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.set('trust proxy', 1);

app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 200, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 20 }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => { if (!origin || allowedOrigins.includes(origin)) return cb(null, true); cb(new Error('CORS not allowed')); },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/contractors', require('./routes/contractors'));

const { personnelRouter, usersRouter, dashRouter, notifsRouter, assessorsRouter, jobReqRouter, auditRouter } = require('./routes/misc');
app.use('/api/personnel', personnelRouter);
app.use('/api/users', usersRouter);
app.use('/api/dashboard', dashRouter);
app.use('/api/notifications', notifsRouter);
app.use('/api/assessors', assessorsRouter);
app.use('/api/job-requirements', jobReqRouter);
app.use('/api/audit-logs', auditRouter);

app.get('/healthz', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((err, req, res, next) => res.status(err.status||500).json({ error: err.message||'Internal server error' }));

const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, () => console.log(`SBTC API port ${PORT}`));
module.exports = app;
