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

  const user = await db('apiKeys')
    .where({ user_id: req.body.id })
    .first()

  bcrypt.hash(key.apiKey, 10, async (_err, hash) => {
    if (user) {
      try {
        await db('apiKeys')
          .where({ user_id: req.body.id })
          //update table with key hash. Don't reset reset_date.
          .update({ key: hash, user_role: `freeUser` })
        res.status(200).json({ existed: true, key: key.apiKey })
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
          user_role: `freeUser`
        })
        res.status(200).json({ existed: false, key: key.apiKey })
      } catch (err) {
        console.log(err)
        res.status(500).json({ Message: `There was an error when updating the API key`, Error: err })
      }
    }
  })
})

module.exports = router





// bcrypt.hash(key.apiKey, 10, async (_err, hash) => {
//   if (user) {
//     try {
//       await db('apiKeys')
//         .where({ user_id: req.body.id })
//         //update table with key hash. Don't reset reset_date.
//         .update({ key: hash, user_role: role })
//       res.status(200).json({ existed: true, key: key.apiKey })
//     } catch (err) {
//       // console.log(err)
//     }
//   } else {
//     try {
//       await db('apiKeys').insert({
//         key: hash,
//         user_id: req.body.id,
//         reset_date: dateMilliseconds,
//         user_role: role
//       })
//       res.header("Access-Control-Allow-Origin", "https://jolly-panini-1f3c1c.netlify.com/profile");
//       res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//       res.status(200).json({ existed: false, key: key.apiKey })
//     } catch (err) {
//       res.status(500).json({ Message: `There was an error when updating the API key`, Error: err })
//     }
//   }
// })