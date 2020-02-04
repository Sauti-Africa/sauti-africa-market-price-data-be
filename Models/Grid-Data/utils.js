// * EXPORTED HELPER FUNCTIONALIES SHARED BY CLIENT & DEVELOPER MODELS FOR GRID-DATA

// Helper function with filter searches for developer
// Notes:
// Flexible by allowing user to select whichever query they want
// Used whereIn in the if/else if statements so that the query can be turned into an array
// if/else if statements used for countries, markets, etc. for single selection and multiple selection
const DBSt = require('../../database/dbSTConfig')


const getSautiData = async (query) => {

    // * VARIABLES FROM ARGUMENT (query)
    const {
        startDate,
        endDate,
        count,
        next
    } = query

    // * INITIAL DB FROM (platform_market_prices2)
    let queryOperation = DBSt('platform_market_prices2')

    // * PAGINATION OPERATION
    const paginate = async (perPage, currentPage) => await queryOperation
        .where('active', (query.a = 1))
        .orderBy('date', 'desc')
        .orderBy('id', 'desc')
        .paginate({
            perPage,
            currentPage
        })

    // * IF QUERY === TRUE, CHECK FOR FILTER OPTIONS, AND UPDATE DATA RESULTS.
    const filterQueryOperation = (query) => {
        // ? QUERY OPERATION EXPRESSION FOR QUERY VALUE IF TRUTHY.
        const assignment = (key, query) => {
            if (query && !Array.isArray(query)) {
                queryOperation = queryOperation.whereIn(key, [query])
            } else if (query && Array.isArray(query)) {
                queryOperation = queryOperation.whereIn(key, query)
            }
        }

        // ? FILTER QUERY OPERATION BASED ON FILTER OPTIONS
        if (query.c) assignment('country', query.c)
        if (query.m) assignment('market', query.m)
        if (query.pcat) assignment('product_cat', query.pcat)
        if (query.pagg) assignment('product_agg', query.pagg)
        if (query.p) assignment('product', query.p)
    };

    // ? IF QUERY IS TRUTHY, CHECK FOR FILTER OPTIONS
    if (query) filterQueryOperation(query);

    queryOperation = queryOperation.select(
        'id',
        'country',
        'market',
        'source',
        'product_cat',
        'product_agg',
        'product',
        'retail',
        'wholesale',
        'currency',
        'unit',
        'date',
        'udate'
    )

    if (startDate && endDate) {
        queryOperation = queryOperation.andWhereBetween('date', [
            startDate,
            endDate
        ])
    }

    const recentRecordDate = await queryOperation
        .where('active', (query.a = 1))
        .orderBy('date', 'desc')
        .orderBy('id', 'desc')
        .then(result => {
            return result[0].date
        })

    if (count && next) {
        return {
            records: await paginate(count, next),
            recentRecordDate: recentRecordDate
        }
    } else if (count) {
        return {
            records: await paginate(count, 1),
            recentRecordDate: recentRecordDate
        }
    } else if (next) {
        return {
            records: await paginate(30, next),
            recentRecordDate: recentRecordDate
        }
    } else {
        return {
            records: await paginate(30, 1),
            recentRecordDate: recentRecordDate
        }
    }
}

module.exports = {
    getSautiData
}