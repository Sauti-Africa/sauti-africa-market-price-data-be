const router = require('express').Router();
const { fetchUserSchema, assignUserRole } = require('./utils');
const cors = require('cors');

// * RETRIEVE THE FULL USER SCHEMA FROM AUTH0
router.post('/', async (req, res) => {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    fetchUserSchema(req, res)
})

// * USER INFORMATION TO BE UPDATED FOR ROLE ASSIGNMENT.
router.put('/:id', async (req, res) => {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    assignUserRole(req, res)
})

module.exports = router;

// const corsHeaders = (req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   };