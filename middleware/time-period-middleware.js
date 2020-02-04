module.exports = async (req,res,next) => {

    const { role } = req


    //set values for freePeriod/paidPeriod in milliseconds
    const freePeriod = Number(604800000)
    const paidPeriod = Number(63072000000)

    if (role === 'freeUser'){
        req.allowableTimePeriod = freePeriod
        next()
    } else if (role === 'paidUser' || role === 'admin') {
        req.allowableTimePeriod = freePeriod
        next()
    } else if (role === undefined || role === null){
        req.allowableTimePeriod = freePeriod
        next()
    }
}

