// Vercel Serverless Function - Main API Entry Point
const express = require('express');
const app = express();

// Import server configuration
require('../server/server.js');

module.exports = app;

