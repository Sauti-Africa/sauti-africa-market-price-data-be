

module.exports = async (data, allowedPeriod ) =>{
    // console.log(`data time filter `, data)

    //create date from most recent record in returned data
    const recentDate = new Date(data.recentRecordDate)
    
    //convert that date to milliseconds
    const recentMS = recentDate.getTime()
    
    //calculate earliest allowable date. (recentMS - 7days) for free users or (recentMS - 730 days) for paid users.
    const recordStartMS = (recentMS - allowedPeriod)
    
    //filter results that are within range
    let filteredResults = await data.data.filter(record => {
        const recordDate = new Date(record.date)
        const recordDateMS = recordDate.getTime()

        return (recordDateMS > recordStartMS)
    })

    if (await filteredResults){
        return {
            warning:data.warning,
            records: filteredResults,
            ratesUpdated:data.ratesUpdated,
            next:data.next,
            prev:data.prev,
            count:data.count,
            pageCount: data.pageCount
       }
    } else if (await !filteredResults && data.data.length > 0){
        return {
            message: `Your current plan is restricted to 7 calendar days of results`,
            warning:data.warning,
            records: filteredResults,
            ratesUpdated:data.ratesUpdated,
            next:data.next,
            prev:data.prev,
            count:data.count,
            pageCount: data.pageCount
       }
    } else if (await !filteredResults && data.data.length === 0){
        return {
            message: `Your query returned no results`,
            warning:data.warning,
            records: filteredResults,
            ratesUpdated:data.ratesUpdated,
            next:data.next,
            prev:data.prev,
            count:data.count,
            pageCount: data.pageCount
       }
    }
}

//! TODO: return message when record [] is empty that user is limited to allowedPeriod