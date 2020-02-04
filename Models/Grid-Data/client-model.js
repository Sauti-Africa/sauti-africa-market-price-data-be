const DBSt = require("../../database/dbSTConfig");

// * UTIL IMPORTS
const { getSautiData } = require('./utils.js')

//these functions are declared here to be used in the mcpList function below //
//
function marketList() {
  return DBSt("platform_market_prices2")
    .distinct("market")
    .orderBy("market");
}
function countryList() {
  return DBSt("platform_market_prices2")
    .distinct("country")
    .orderBy("country");
}
function sourceList() {
  return DBSt("platform_market_prices2")
    .distinct("source")
    .orderBy("source");
}
function productList() {
  return DBSt("platform_market_prices2")
    .distinct("product")
    .orderBy("product");
}
function pcatList() {
  return DBSt("platform_market_prices2")
    .distinct("product_cat")
    .orderBy("product_cat");
}
function paggList() {
  return DBSt("platform_market_prices2")
    .distinct("product_agg")
    .orderBy("product_agg");
}
//
// fn for serving up lists  to the grid filter inputs //
function mcpList() {
  const marketQuery = marketList();
  const countryQuery = countryList();
  const sourceQuery = sourceList();
  const productQuery = productList();
  const pcatQuery = pcatList();
  const paggQuery = paggList();
  return Promise.all([
    marketQuery,
    countryQuery,
    sourceQuery,
    productQuery,
    pcatQuery,
    paggQuery
  ]).then(([markets, country, source, product, category, aggregator]) => {
    let total = {};
    total.countries = country;
    total.products = product;
    total.sources = source;
    total.markets = markets;
    total.categories = category;
    total.aggregators = aggregator;
    return total;
  });
}

// End of Grid table functions

// Playground functions
// filter playground function //
// this playground endpoint's route is in server.js //

function getPlay(query) {
  let queryOperation = DBSt("platform_market_prices2");

  // If user wants data from specific country/countries
  if (query.c && !Array.isArray(query.c)) {
    queryOperation = queryOperation.whereIn("country", [query.c]);
  } else if (query.c && Array.isArray(query.c)) {
    queryOperation = queryOperation.whereIn("country", query.c);
  }

  // If user wants data from specific markets
  if (query.market && !Array.isArray(query.market)) {
    queryOperation = queryOperation.whereIn("market", [query.market]);
  } else if (query.market && Array.isArray(query.market)) {
    queryOperation = queryOperation.whereIn("market", query.market);
  }
  // If user wants data from specific source
  if (query.source && !Array.isArray(query.source)) {
    queryOperation = queryOperation.whereIn("source", [query.source]);
  } else if (query.source && Array.isArray(query.source)) {
    queryOperation = queryOperation.whereIn("source", query.source);
  }

  //if user wants data from spcific product categories
  if (query.pcat && !Array.isArray(query.pcat)) {
    //pcat = product category (product_cat) -> General
    queryOperation = queryOperation.whereIn("product_cat", [query.pcat]);
  } else if (query.pcat && Array.isArray(query.pcat)) {
    queryOperation = queryOperation.whereIn("product_cat", query.pcat);
  }

  //if user wnats data from product subcategory
  if (query.pagg && !Array.isArray(query.pagg)) {
    //pagg = product_agg -> product type
    queryOperation = queryOperation.whereIn("product_agg", [query.pagg]);
  } else if (query.pagg && Array.isArray(query.pagg)) {
    queryOperation = queryOperation.whereIn("product_agg", query.pagg);
  }

  //if user wants data of specific products
  if (query.p && !Array.isArray(query.p)) {
    //p = product -> Specific product
    queryOperation = queryOperation.whereIn("product", [query.p]);
  } else if (query.p && Array.isArray(query.p)) {
    queryOperation = queryOperation.whereIn("product", query.p);
  }

  return queryOperation
    .select(
      "country",
      "market",
      "source",
      "product_cat",
      "product_agg",
      "product",
      "retail",
      "wholesale",
      "currency",
      "unit",
      "date",
      "udate"
    )
    .orderBy("date", "desc")
    .where("active", (query.a = 1))
    .limit(1);
}

function getProductPriceRangePlay({ product, startDate, endDate }) {
  return DBSt("platform_market_prices2")
    .select("*")
    .where("product", product)
    .andWhereBetween("date", [startDate, endDate])
    .limit(1);
}

// get price of product in a specific market for playground //
function getPMPlay(query) {
  const { product, market } = query;
  let queryOperation = DBSt("platform_market_prices2");
  return queryOperation
    .select(
      "market",
      "source",
      "country",
      "currency",
      "product",
      "retail",
      "wholesale",
      "date",
      "udate"
    )
    .where("product", `${product}`)
    .andWhere("market", `${market}`)
    .orderBy("date", "desc")
    .limit(1);
}

// End of Playground functions

module.exports = {
  getSautiData,
  mcpList,
  getPlay,
  getProductPriceRangePlay,
  getPMPlay
};