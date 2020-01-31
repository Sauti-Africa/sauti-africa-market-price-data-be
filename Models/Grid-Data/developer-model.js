// * PKGS && DB
const DBSt = require('../../database/dbSTConfig')
const { attachPaginate } = require('knex-paginate');

// * INITIALIZE KNEX-PAGINATE
attachPaginate();

// * UTIL IMPORTS
const { getSautiData } = require('./utils.js')

// fn to get the latest price for a product across all markets //
//! Doesn't need pagination
async function latestPriceAcrossAllMarkets(query) {
  const {
    product
  } = query
  const records = await DBSt.schema.raw(
    `SELECT pmp.source, pmp.market, pmp.product, pmp.retail, pmp.wholesale, pmp.currency, pmp.date, pmp.udate FROM platform_market_prices2 AS pmp INNER JOIN
    (
        SELECT max(date) as maxDate, market, product, retail, currency, wholesale, source, udate
       FROM platform_market_prices2
       WHERE product=?
       GROUP BY market
   ) p2
   ON pmp.market = p2.market
    AND pmp.date = p2.maxDate
     WHERE pmp.product=?
     order by pmp.date desc`,
    [product, product]
  )

  // console.log(`LPAAMmodel `, await data[0])
  
  let data = {
    data: records[0],
    pagination: {
      currentPage:0,
      total: 0,
      lastPage: 0
      }
  }



  return {
    
    records: data,
    recentRecordDate: records[0][0].date,

      }
  //return console.log(await records[0]) 
  
}

// fn to get the latest price for a product by market //

//!this code works, needs cleanup. Issue is at the route in the first promise. Object returned by model is not what is being received in the promise.
async function latestPriceByMarket(query) {
  const {
    product,
    market
  } = query
  let queryOperation = DBSt('platform_market_prices2')
  const queryResult = await queryOperation
    .select(
      'market',
      'source',
      'country',
      'currency',
      'product',
      'retail',
      'wholesale',
      'date',
      'udate'
    )
    .where('product', `${product}`)
    .andWhere('market', `${market}`)
    .orderBy('date', 'desc')
    .limit(1)

  const records = [await queryResult[0]]

  let data = {
    data: records[0],
    pagination: {
      currentPage:0,
      total: 0,
      lastPage: 0
      }
  }



  return {
    
    records: data,
    recentRecordDate: records[0].date,

      }


  // let returnObj =  await {
  //   records: result[0],
  //   recentRecordDate: result[0].date,
  //   pagination: {
  //     currentPage:0,
  //     total: 0,
  //     lastPage: 0
  //     }
  // }

  // try{
  //   console.log(await returnObj)
  //   return await returnObj;
  // }
  // catch(error){
  //   console.log(error)
  // }
  

}
// fn that returns a list of items, markets by default //
function getListsOfThings(query, selector) {
  let queryOperation = DBSt('platform_market_prices2')
  if (query === undefined) {
    query = 'market'
  }
  switch (query.toLowerCase()) {
    case 'market':
      return queryOperation.distinct('market').orderBy('market')
    case 'country':
      return queryOperation.distinct('country').orderBy('country')
    case 'source':
      return queryOperation.distinct('source').orderBy('source')
    case 'product':
      return queryOperation.distinct('product').orderBy('product')
    default:
      return queryOperation.distinct('market').orderBy('market')
  }
}
// fn that returns records for a product via date range, with pagination //
async function getProductPriceRange(query) {
  let {
    product,
    startDate,
    endDate,
    count
  } = query
  let entries
  let totalCount
  if (query.next) {
    const cursorArray = query.next.split('_')
    const nextDate = new Date(cursorArray[0])
    const nextId = cursorArray[1]
    let queryOperation = DBSt('platform_market_prices2')
      .select('*')
      .where('product', product)
      .andWhereBetween('date', [startDate, endDate])
    entries = await queryOperation
      .where(function () {
        this.whereRaw('date < ?', [nextDate]).orWhere(function () {
          this.whereRaw('date = ?', [nextDate]).andWhereRaw('id <= ?', [nextId])
        })
      })
      .where('active', (query.a = 1))
      .orderBy('date', 'desc')
      .orderBy('id', 'desc')
      .limit(Number(count) + 1)
  } else {
    let queryOperation = DBSt('platform_market_prices2')
      .select('*')
      .where('product', product)
      .andWhereBetween('date', [startDate, endDate])
    totalCount = await queryOperation.clone().count()
    entries = await queryOperation
      .where('active', (query.a = 1))
      .orderBy('date', 'desc')
      .orderBy('id', 'desc')
      .limit(Number(count) + 1)
  }
  const lastEntry = entries[entries.length - 1]
  entries.length ? (next = `${lastEntry.date}_${lastEntry.id}`) : (next = null)
  const entriesOffset = entries.splice(0, Number(count))
  const firstEntry = entriesOffset[0]
  entriesOffset.length ?
    (prev = `${firstEntry.date}_${firstEntry.id}`) :
    (prev = null)
  return {
    records: entriesOffset,
    next: next,
    prev: prev,
    count: totalCount
  }
}

// * 
module.exports = {
  getSautiData,
  latestPriceByMarket,
  latestPriceAcrossAllMarkets,
  getProductPriceRange,
  getListsOfThings
}