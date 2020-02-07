const request = require('request')

// * SETTINGS FOR REQUEST PACKAGE BELOW
const json = JSON.stringify({
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
  audience: 'https://sauti-africa-market-prices.auth0.com/api/v2/',
  grant_type: 'client_credentials'
})

const options = {
  method: 'POST',
  url: 'https://sauti-africa-market-prices.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: json
}

// * RETRIEVE TOKEN FOR API MANAGEMENT &
// * DYNAMIC USER GET REQUEST FOR USERS REQUESTING API KEY
module.exports = async (req, res, next) => {
  let apiToken

  // * SET TOKEN FOR AUTHORIZED API USAGE
  request(options, async (error, response, body) => {
    apiToken = JSON.parse(body).access_token


    // * ONCE TOKEN FOR API IS RECEIVED, USE API CALLS
    if (!!apiToken === true) {
      const managementAPI = {
        method: 'GET',
        url: `https://sauti-africa-market-prices.auth0.com/api/v2/users/${req.body.id}`,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiToken}`
        }
      }

      request(managementAPI, async (error, response, body) => {
        const user = await JSON.parse(body);

        
        
        if (user) {
           const addRolesToUser = (user) => {
            console.log(user)
            if (user.email.includes('@sautiafrica.org')) {
              user.role = "admin";
            } else {
              console.log(`User does not exist`, user)
              user.role = "freeUser";
            }
          }
          if (error) throw new Error(error)
          addRolesToUser(user);
        }

        
      })
    }
  })
  next();
}
