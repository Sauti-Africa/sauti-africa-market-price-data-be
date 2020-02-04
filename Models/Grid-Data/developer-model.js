// * PKGS && DB
const DBSt = require('../../database/dbSTConfig')
const { attachPaginate } = require('knex-paginate');

// * INITIALIZE KNEX-PAGINATE
attachPaginate();

// * UTIL IMPORTS
const { getSautiData } = require('./utils.js')

// fn to get the latest price for a product across all markets //
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
  
}

// fn to get the latest price for a product by market //


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
    data: [records[0]],
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
    count,
    next
  } = query

  let queryOperation = DBSt('platform_market_prices2');

  const paginate = async (perPage, currentPage) => await queryOperation
        .where('active', (query.a = 1))
        .orderBy('date', 'desc')
        .orderBy('id', 'desc')
        .paginate({
            perPage,
            currentPage
        })
  
  //? sets the filtered query

  queryOperation = queryOperation
    .select('*')
    .where('product','=', product)
    .andWhereBetween('date', [startDate, endDate])

  const recentRecordDate = await queryOperation
        .where('active', (query.a = 1))
        .orderBy('date', 'desc')
        .orderBy('id', 'desc')
        .then(result => {
            return result[0].date
        })

  if (count && next){
    return{
      records: await paginate(count,next),
      recentRecordDate: recentRecordDate
    } 
  } else if (count){
    return{
      records: await paginate(count,1),
      recentRecordDate: recentRecordDate
    }
  } else if (next){
      return{
        records: await paginate(30,next),
        recentRecordDate: recentRecordDate
      }
  } else {
      return{
        records: await paginate(count,1),
        recentRecordDate: recentRecordDate
      }
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