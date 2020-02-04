const express = require('express')
const router = express.Router()
const uuidAPIKey = require('uuid-apikey')
const bcrypt = require('bcryptjs')
const db = require('../api-key/dbConfig')
const { fetchUserSchema } = require('../routes/users/utils')
const axios = require('axios')
const jwtCheck = require('../middleware/token-middleware')
const rules = require('../middleware/rules/rules-middleware');

router.post('/private', jwtCheck, rules, async (req, res) => {
  const key = uuidAPIKey.create()
  const { id } = req.body;
  let role;

  req.body.sub = id;

  //generate new date to be written to table
  const date = new Date();
  //get the exact date in milliseconds
  const dateMilliseconds = date.getTime();

  const user = await db('apiKeys')
    .where({ user_id: id })
    .first()

  //constructs object for auth0 update endpoint
  let idObject = {
    "sub": `${req.body.sub}`
  }

  //retrieves the expanded user object from auth0 which contains app_metadata.role

  axios.post('https://sauti-marketprice-data.herokuapp.com/api/users', idObject)
  .then(response => {
   const role = response.data.app_metadata.role;
    return role
  })
  .then(role => {
    bcrypt.hash(key.apiKey, 10, async (_err, hash) => {
      if (user) {
        try {
          await db('apiKeys')
            .where({ user_id: id })
            //update table with key hash. Don't reset reset_date.
            .update({ key: hash, user_role: role})
          res.status(200).json({ existed: true, key: key.apiKey })
        } catch (err) {
          console.log(err)
        }
      } else {
        try {
          await db('apiKeys').insert({ 
            key: hash, 
            user_id: id, 
            reset_date:dateMilliseconds,
            user_role: role
          })
          res.status(200).json({ existed: false, key: key.apiKey })
        } catch (err) {
          res.status(500).json({Message: `There was an error when updating the API key`, Error: err})
        }
      }
    })
  })
  .catch(err => {
    console.log(err)
  });
})

module.exports = router