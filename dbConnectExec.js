const sql = require('mssql')

const config = {
    user: 'bryanmuir98',
    password: 'aliceinwonderland98$',
    server: 'cobazsqlcis410.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
    database: 'bmuir',
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