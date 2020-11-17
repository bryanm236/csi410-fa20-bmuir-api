const jwt = require('jsonwebtoken')

const db = require('../dbConnectExec.js')
const config = require('../config.js')


const auth = async(req, res, next)=>{
    // console.log(req.header('Authorization'))
    try{

        //1. decode token

        let myToken = req.header('Authorization').replace('Bearer ','')
        // console.log(myToken)

        let decodedToken = jwt.verify(myToken, config.JWT)
        // console.log(decodedToken)

        let contactPK = decodedToken.pk;
        console.log(contactPK)

        //2. compare token with database token
        let query = `
        SELECT CustomerPK, FirstName, LastName, Email
        FROM CustomerT
        WHERE CustomerPK = ${contactPK} and Token = '${myToken}'`

        let returnedUser = await db.executeQuery(query)
        console.log(returnedUser)


        //3. save user information in the request

    }catch(myError){
        res.status(401).send("Authentication failed.")
    }
}

module.exports = auth