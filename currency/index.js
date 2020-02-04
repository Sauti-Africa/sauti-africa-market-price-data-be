const axios = require('axios')

const { promisify } = require('util')

const client = require('../redis')

client.get = promisify(client.get)

// Ideally we should have historical exchange rate data so that we can adjust older prices accordingly. Sauti will be providing that at a future date, but for now wishes to use the current day's rates for conversion of all currency data.

const getExchangeRates = async () => {

  

  const defaultRates = {
    // Fallback in case currency API goes down. Instead of being a static object, we can ultimately cache most recent successful call in redis and pull it from there
    MWK: {
      rate: 734.47
    },
    RWF: {
      rate: 930.85
    },
    KES: {
      rate: 101.96
    },
    UGX: {
      rate: 3683.55
    },
    TZS: {
      rate: 2299.97
    },
    CDF: {
      rate: 1665
    },
    BIF: {
      rate: 1873.73
    },
    USD: {
      rate: 1
    },
    updated: 'Tue, 19 Nov 2019 13:34:22 GMT'
  }

  const recent = await client.get('recentExchangeRates') // Check redis cache for recent exchange rate data

  if (recent) {
    
    return JSON.parse(recent)
  } else {
    return await axios
      .get(
        'http://sautiafrica.org/endpoints/api.php?url=v1/exchangeRates/&type=json'
      )
      .then(res => {
        res.data.updated = new Date().toUTCString() // Store time we pulled from the API
        client.set('recentExchangeRates', JSON.stringify(res.data), 'EX', 600) // cache for 10 minutes
        client.set('lastKnownExchangeRates', JSON.stringify(res.data)) // cache indefinitely as fallback in case API goes down and recentExchangeRates has expired
        return res.data
      })
      .catch(async error => {
        // If API call fails and there is no fresh result in cache, return last successfull pull from the API if found, otherwise return default rates
        
        const lastKnown = await client.get('lastKnownExchangeRates')
        return lastKnown ? JSON.parse(lastKnown) : defaultRates
      })
  }
}

// Convert current currency value to USD as a base and then to its target currency
const convertCurrency =  (source, target, value, exchangeRates) => {
  if (source !== target && exchangeRates[source].rate !== 0) {
    return (value / exchangeRates[source].rate) * exchangeRates[target].rate
  } else {
    return value
  } 
}

module.exports = async (response, targetCurrency) => {
  return await getExchangeRates()
    .then(rates => {
      if (response.records){
        if (!response.records){
           return  {
            ratesUpdated: rates.updated,
            pagination: response.records.pagination,
            data: response.records.data.map(row => {
              row.wholesale =  convertCurrency(
                row.currency,
                targetCurrency,
                row.wholesale,
                rates
              )
              row.retail =  convertCurrency(
                row.currency,
                targetCurrency,
                row.retail,
                rates
              )
              row.currency = targetCurrency
              return row
            }),
            next: response.records.pagination.currentPage+1,
            prev: response.records.pagination.currentPage,
            count: response.records.pagination.total,
            pageCount: response.records.pagination.lastPage,
            recentRecordDate:response.recentRecordDate
          }
        } else {
          return {
            ratesUpdated: rates.updated,
            pagination: response.records.pagination,
            data: response.records.data.map(row => {
              row.wholesale =  convertCurrency(
                row.currency,
                targetCurrency,
                row.wholesale,
                rates
              )
              row.retail =  convertCurrency(
                row.currency,
                targetCurrency,
                row.retail,
                rates
              )
              row.currency = targetCurrency
              return row
            }),
            next: Number(response.records.pagination.currentPage)+1,
            prev: Number(response.records.pagination.currentPage)-1,
            count: response.records.pagination.total,
            pageCount: response.records.pagination.lastPage,
            recentRecordDate:response.recentRecordDate,
          }
        }
      }
    })
    .catch(error => {
      console.log(`Currency Conversion Error:  `, error)
      return {
        warning: 'Currency conversion failed. Prices not converted',
        response
      }
    })
}
