const request = require('request-promise');

// * JSON & OPTIONS ARE DEFAULT SETTINGS FOR RETRIEVING TOKEN TO ACCESS API \\
const json = JSON.stringify({
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    audience: 'https://sauti-africa-market-prices.auth0.com/api/v2/',
    grant_type: 'client_credentials'
})

const options = {
    method: 'POST',
    url: 'https://sauti-africa-market-prices.auth0.com/oauth/token',
    headers: { 'content-type': 'application/json' },
    body: json
}
// * JSON & OPTIONS ARE DEFAULT SETTINGS FOR RETRIEVING TOKEN TO ACCESS API \\

// * RETRIEVE FULL USER SCHEMA / DATA FROM AUTH0
const fetchUserSchema = async (req, res) => {
    let fetchedData;

    // * SET TOKEN FOR AUTHORIZED API USAGE
    await request(options)
        .then(result => {
            return !!result === true && JSON.parse(result).access_token
        })
        .then(result => {
            const managementAPI = {
                method: 'GET',
                url: `https://sauti-africa-market-prices.auth0.com/api/v2/users/${req.body.sub}`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${result}`
                }
            }

            return request(managementAPI)
                .then(result => { fetchedData = { ...fetchedData, ...JSON.parse(result) }})
                .then(result => { 
                    res.status(200).json(fetchedData)
                
                })
        })
}

// * LOGIC FOR ASSIGNING USER ROLES ON AUTH0 DB
const assignUserRole = async (req, res) => {
    const { id } = req.params
    const changes = req.body

    // * SET TOKEN FOR AUTHORIZED API USAGE
    await request(options)
        .then(result => !!result === true && JSON.parse(result).access_token)
        .then(result => {
            const managementAPI = {
                method: 'PATCH',
                url: `https://sauti-africa-market-prices.auth0.com/api/v2/users/${id}`,
                headers: {
                    'content-type': 'application/json',
                    authorization: `Bearer ${result}`
                },
                json: changes
            }

            return request(managementAPI).then(result => res.status(200).json(result))
        })
}

module.exports = {
    assignUserRole,
    fetchUserSchema
}