const { OAuth2Client } = require("google-auth-library")





let ClientKey = process?.env?.GOOGLE_ACCOUNT_CLIENT_ID

const GoogleClient = new OAuth2Client({ clientId: ClientKey })


module.exports = { GoogleClient }