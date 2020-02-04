const db = require('../api-key/dbConfig')
const bcrypt = require('bcryptjs')

module.exports = async (req, res, next) => {
  const { key } = req.headers

  let validKey = null
  let userId = null
  let hashedKey
  const keyCandidates = await db('apiKeys')

  /*=== checks validity of key ===*/
  if (key) {
    try {
      for (candidate of keyCandidates) {
        const k = await bcrypt.compare(key, candidate.key)

        if (k) {
          //set hashedKey for user_id lookup
          hashedKey = candidate.key

          //assign hashedKey to request
          req.hashedKey = hashedKey;
          
          //db lookup the user_id and user_role based on the key
          userId = await db('apiKeys')
          .select('user_id', 'user_role')
          .where({key:hashedKey}) 
          validKey = key
            break
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  /*=== sends key on req object to apiLim middleware ===*/
  if (validKey) {
    req.key = validKey
    req.userId = userId[0].user_id
    req.role = userId[0].user_role
    next()
  } else {
    res.status(403).json({
      error: 'Valid key not provided. Access denied.'
    })
  }
}
