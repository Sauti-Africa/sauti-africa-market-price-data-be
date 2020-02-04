const express = require('express')
const { parse } = require('json2csv')
const router = express.Router()
const {
  queryCurrency,
  queryProductMarket,
  playgroundDR
} = require('../../middleware/validate')
const tokenMiddleware =
  process.env.npm_lifecycle_event !== 'dev'
    ? require('../../middleware/token-middleware')
    : function(req, res, next) {
        next()
      }
const db = require('../../api-key/dbConfig')
const Client = require('../../Models/Grid-Data/client-model.js')

const convertCurrencies = require('../../currency')

router.get('/', tokenMiddleware, queryCurrency, (req, res) => {
  const message = req.message
  req.query.count = 30
  Client.getSautiData(req.query,30)
    .then(response => {
      convertCurrencies(response, req.currency) // Sauti wishes for all currency values to pass through conversion. See further notes in /currency
        .then(converted => {
          res.status(200).json({
            warning: converted.warning,
            message: message,
            records: converted.data,
            next: converted.next,
            prev: converted.prev,
            rowCount: converted.count,
            pageCount: converted.pageCount,
            ratesUpdated: converted.ratesUpdated
          })
        })
        .catch(error => {
          console.log(error)
        })
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(error.message)
    })
})

// route that serves up frontend grid inputs //
router.get('/superlist', (req, res) => {
  Client.mcpList()
    .then(records => {
      res.status(200).json(records)
    })
    .catch(err => {
      console.log(err.message)
      res.status(500).send(err.message)
    })
})

//! playground routes//


//product date range//
router.get('/playground/date', playgroundDR, (req, res) => {
  Client.getProductPriceRangePlay(req.query)
    .then(record => {
      if (record[0]) {
        res.status(200).json(record)
      } else {
        res.status(404).json({
          message:
            "The records for that product and date-range combination doesn't exist, please check spelling for product or specify new date range"
        })
      }
    })

    .catch(err => {
      console.log(err.message)
      res.status(500).send(err.message)
    })
})

//get latest price of product in market for playground//
router.get('/playground/latest', queryProductMarket, (req, res) => {
  Client.getPMPlay(req.query)
    .then(record => {
      if (record[0]) {
        res.status(200).json(record)
      } else {
        res.status(404).json({
          message:
            "That product and market combination doesn't exist, please check spelling and list of products and markets"
        })
      }
    })

    .catch(err => {
      console.log(err.message)
      res.status(500).send(err.message)
    })
})

//export all

router.get('/export', (req, res) => {
  Client.getSautiData(req.query, 10000000000)
    .then(records => {
      convertCurrencies(records, req.currency) // Sauti wishes for all currency values to pass through conversion. See further notes in /currency
        .then(converted => {
          const data = {
            warning: converted.warning,
            message: req.message,
            records: converted.data,
            next: converted.next,
            prev: converted.prev,
            count: converted.count,
            ratesUpdated: converted.ratesUpdated
          }
          var fields = [
            'id',
            'country',
            'market',
            'source',
            'product_cat',
            'product_agg',
            'product',
            'currency',
            'date',
            'udate'
          ]
          const opts = { fields }
          const csvData = parse(converted.data.records, opts)
          res.attachment('SautiAfricaPriceData.csv')
          res.status(200).send(csvData)
        })
        .catch(error => {
          console.log(error)
        })
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(error.message)
    })
})

module.exports = router
