const router = require('express').Router();
const { fetchUserSchema, assignUserRole } = require('./utils');
const cors = require('cors');

// * RETRIEVE THE FULL USER SCHEMA FROM AUTH0
router.post('/', cors(), async (req, res) => fetchUserSchema(req, res))

// * USER INFORMATION TO BE UPDATED FOR ROLE ASSIGNMENT.
router.put('/:id', cors(), async (req, res) => assignUserRole(req, res))

module.exports = router;