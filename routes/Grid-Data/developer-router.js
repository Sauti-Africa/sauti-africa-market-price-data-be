const express = require('express')
const validate = require('../../middleware/validate.js')
const Developer = require('../../Models/Grid-Data/developer-model.js')
const router = express.Router()
const convertCurrencies = require('../../currency')
const allowedPeriodFilter = require('../../time-filter')


// Giant filter router
router.get(
  '/filter',
  validate.queryCurrency,
  validate.queryCountPage,
  (req, res) => {
    Developer.getSautiData(req.query, req.count)
      .then(response => {
        if (!response.records || response.records.length < 1) {
          res.status(404).json({
            apiCount: parseInt(req.count),
            message:
              "Records don't exist here, change the query parameters or change page no. "
          })
        } else {
          convertCurrencies(response, req.currency) // Sauti wishes for all currency values to pass through conversion. See further notes in /currency
          .then(converted => {
            allowedPeriodFilter(converted,req.allowableTimePeriod)
            .then(filtered => {
              filtered.count
              ? res.status(200).json({
                  apiCount: parseInt(req.count),
                  warning: filtered.warning,
                  message: req.message,
                  records: filtered.records,
                  ratesUpdated: filtered.ratesUpdated,
                  next: filtered.next,
                  prev: filtered.prev,
                  pageCount: filtered.pageCount,
                  rowCount: filtered.count
                })
              : res.status(200).json({
                  apiCount: parseInt(req.count),
                  warning: filtered.warning,
                  message: req.message,
                  records: filtered.records,
                  ratesUpdated: filtered.ratesUpdated,
                  next: filtered.next,
                  prev: filtered.prev,
                  pageCount: filtered.pageCount,
                  rowCount: filtered.count
                })
          })
          })
          .catch(error => {
            console.log(error)
          })
        }
      })
      .catch(error => {
        console.log(error)
        res.status(500).send(error.message)
      })
  }
)



//getting the latest market price for a product across all markets
router.get(
  '/product/latestprice',
  validate.queryCurrency,
  validate.queryProduct,
  (req, res) => {
    Developer.latestPriceAcrossAllMarkets(req.query)
      .then(response => {
          if (!response) {
          res.status(404).json({
            apiCount: parseInt(req.count),
            message:
              "The product entered doesn't exist in the database, please check the list of available products"
          })
        } else {
          convertCurrencies(response, req.currency) // Sauti wishes for all currency values to pass through conversion. See further notes in /currency
            .then(converted => {
              allowedPeriodFilter(converted,req.allowableTimePeriod)
              .then(filtered => {
                res.status(200).json({
                  data:filtered,
                  message:req.message,
                  apiCount:req.count
                })
              })
              .catch(error => console.log(error))
            })
            .catch(error => {
              console.log(error)
            })
        }
      })
      .catch(error => {
        res.status(500).send(error.message)
      })
  }
)

//getting the latest price of a product from a specific market
//Requires product & market names as string
router.get(
  '/product/pricebymarket',
  validate.queryCurrency,
  validate.queryProductMarket,
  (req, res) => {
    Developer.latestPriceByMarket(req.query)
      .then(response => {
        if (response) {
          convertCurrencies(response, req.currency) // Sauti wishes for all currency values to pass through conversion. See further notes in /currency
          .then(converted => {
            res.status(200).json({
              data:converted,
              message:req.message,
              apiCount:req.count
            })
          })
          .catch(error => {
            console.log(error)
          })
        } else {
          res.status(404).json({
            apiCount: parseInt(req.count),
            message:
              "That product and market combination doesn't exist, please check spelling and list of products and markets"
          })
        }
      })
      .catch(error => {
        console.log(error)
        res.status(500).send(error.message)
      })
  }
)

//Pass a string as query for specific list - market,source,country,products
router.get('/lists', (req, res) => {
  Developer.getListsOfThings(req.query.list)
    .then(records => {
      res.status(200).json({
        apiCount: parseInt(req.count),
        records
      })
    })
    .catch(error => {
      console.log(error)
      res.status(500).send(error.message)
    })
})


//Req.query needs product,startDate,endDate and returns a range of records
//startDate is older than endDate
//requires further validation possibly with moment.js to validate the date values//stretch goal for later
router.get(
  '/product/range',
  validate.queryCurrency,
  validate.queryProductDate,
  validate.queryCountPage,
  (req, res) => {
    Developer.getProductPriceRange(req.query)
      .then(records => {
        convertCurrencies(records, req.currency) // Sauti wishes for all currency values to pass through conversion. See further notes in /currency
        .then(converted => {
          allowedPeriodFilter(converted,req.allowableTimePeriod)
          .then(filtered => {
            filtered.pageCount
            ? res.status(200).json({
                apiCount: parseInt(req.count),
                warning: filtered.warning,
                message: req.message,
                records: filtered.records,
                ratesUpdated: filtered.ratesUpdated,
                next: filtered.next,
                prev: filtered.prev,
                pageCount: filtered.pageCount,
                rowCount: filtered.count
              })
            : res.status(200).json({
                apiCount: parseInt(req.count),
                warning: filtered.warning,
                message: req.message,
                records: filtered.records,
                ratesUpdated: filtered.ratesUpdated,
                next: filtered.next,
                prev: filtered.prev,
                rowCount: filtered.count,
                pagCount:filtered.pageCount
              })
        })
        })
          .catch(error => {
            console.log(error)
          })
      })
      .catch(error => {
        res.status(500).send(error.message)
      })
  }
)

module.exports = router
