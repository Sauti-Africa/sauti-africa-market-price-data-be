// * PACKAGES & IMPORTS
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression') // Compression in Node.js and Express decreases the downloadable amount of data that’s served to users. Through the use of this compression, we can improve the performance of our Node.js applications as our payload size is reduced drastically.
const server = express()
const Client = require('../Models/Grid-Data/client-model')
const apiAuthenticator = require('../middleware/apikey-middleware')
const apiLimiter = require('../middleware/api-limiter-middleware')
const rateLimit = require("express-rate-limit") //throttling package
const timePeriod = require('../middleware/time-period-middleware')

// * ROUTES
const apikeyRoute = require('../routes/apikeyRoute')
const clientRouter = require('../routes/Grid-Data//client-router.js')
const developerRouter = require('../routes/Grid-Data/developer-router.js')
const userRoleRouter = require('../routes/users/userRoles')

//Initialize the rate limit 
const apiThrottler = rateLimit({
  windowsMs: 0.1 * 60 * 1000,
  max: 250
});

//Initialize Moesif and set up the middleware
const moesifExpress = require('moesif-express')
const moesifMiddleware = moesifExpress({
  applicationId: process.env.MOESIF_ID || undefined,
  logBody: true
})

// * Server uses middleware to add functionality
server.use(moesifMiddleware)
server.use(apiThrottler)
server.use(compression())
server.use(helmet())
server.use(cors())
server.use(express.json())

// * ROUTES BELOW
server.use('/api/apikeyRoute', apikeyRoute)
server.use('/sauti/developer', apiAuthenticator, apiLimiter, timePeriod, developerRouter)
server.use('/sauti/client', clientRouter)
server.use('/api/users', userRoleRouter)

// * LANDING PAGE FOR BE
server.get('/', (req, res) => {
  res.send(
    "<h1>Welcome to Sauti Africa Market Price API</h1><a href='https://price-api.sautiafrica.org/docs'>Check out the API Docs on how to use this API</a>"
  )
})

// playground route for faux filter //
server.get('/sauti', (req, res) => {
  Client.getPlay(req.query)
    .then(response => {
      res.status(200).json(response)
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(error.message)
    })
})

// TODO: CLEAN UP TEMP CODE AFTER FINISHED WRITING MIDDLEWARE FOR API
const roles = require('../middleware/rules/rules-middleware')
// roles();

module.exports = server
