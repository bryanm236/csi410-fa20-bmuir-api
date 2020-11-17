const sql = require('mssql')
const bmuirConfig = require('./config.js')

const config = {
    user: bmuirConfig.DB.user,
    password: bmuirConfig.DB.password,
    server: bmuirConfig.DB.server, // You can use 'localhost\\instance' to connect to named instance
    database: bmuirConfig.DB.database,
}

async function executeQuery(aQuery) {
    var connection = await sql.connect(config)
    var result = await connection.query(aQuery)

    return result.recordset


}

module.exports = {executeQuery: executeQuery}
// executeQuery(`SELECT *
// FROM VehicleT
// LEFT JOIN DriverT
// ON VehicleT.VehiclePK = DriverT.VehicleFK

// `)