const express = require('express');
const router = express.Router();
const Log = require('../models/logModel');


// Endpoint to create a new log entry
router.post('/', async (req, res) => {
    try {
      const logEntry = new Log(req.body);
      await logEntry.save();
      res.status(201).send(logEntry);
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
  
  // Endpoint to fetch log entries
  // Add query parameters as needed to filter logs (e.g., by date, user, entity type)
  router.get('/', async (req, res) => {
    try {
      const logs = await Log.find({}); // Add query logic here as needed
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  module.exports = router;