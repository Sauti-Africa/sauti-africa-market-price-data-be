const express = require('express')
const router = express.Router()
const uuidAPIKey = require('uuid-apikey')
const bcrypt = require('bcryptjs')
const db = require('../api-key/dbConfig')
const jwtCheck = require('../middleware/token-middleware')

router.post('/private', jwtCheck, async (req, res) => {
  const key = uuidAPIKey.create()
  //generate new date to be written to table
  const date = new Date();
  //get the exact date in milliseconds
  const dateMilliseconds = date.getTime();

  let user = await db('apiKeys');

  if (user) {
    try{
      user = await db('apiKeys')
    .where({ user_id: req.body.id })
    .first()
    }
    catch(err) {
      console.log(err)
      res.send(err)
    }
  }

  

  bcrypt.hash(key.apiKey, 10, async (_err, hash) => {
    if (user) {
      try {
        await db('apiKeys')
          .where({ user_id: req.body.id })
          //update table with key hash. Don't reset reset_date.
          .update({ key: hash, user_role: req.body.role })
        res.header("Allow-Control-Allow-Origin", "http://localhost:3000")
        res.status(200).json({ 
          existed: true, 
          key: key.apiKey })
      } catch (err) {
        console.log(err)
        res.send(err)
      }
    } else {
      try {
        await db('apiKeys').insert({
          key: hash,
          user_id: req.body.id,
          reset_date: dateMilliseconds,
          user_role: req.body.role
        })
        res.header("Allow-Control-Allow-Origin", "http://localhost:3000")
        res.status(200).json({ existed: false, key: key.apiKey })
      } catch (err) {
        console.log(err)
        res.status(500).json({ Message: `There was an error when updating the API key`, Error: err })
      }
    }
  })
})

module.exports = router