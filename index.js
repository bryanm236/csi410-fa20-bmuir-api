const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const db = require('./dbConnectExec.js')
const config = require('./config.js')
const auth = require('./middleware/authenticate')
const app = express();
app.use(express.json())



app.post("/rides", auth, async (req,res)=>{

    try{ var DriverFK = req.body.DriverFK;
        var LocationTo = req.body.LocationTo;
        var LocationFrom = req.body.LocationFrom;
        var RideType = req.body.RideType
    
        if(!DriverFK || !LocationTo || !LocationFrom || !RideType){
            res.status(400).send("bad request")
        }

        LocationTo = LocationTo.replace("'","''")
        LocationFrom = LocationFrom.replace("'","''")
        RideType = LocationTo.replace("'","''")


        // console.log("here is the Customer requesting a ride", req.contact)
        // res.send("Driver is on the way...")
    
        let insertQuery = `INSERT INTO RideT(RideType, LocationTo, LocationFrom, DriverFK, CustomerFK)
        OUTPUT inserted.RidePK, inserted.LocationTo,inserted.LocationFrom,inserted.DriverFK
        VALUES('${RideType}','${LocationTo}','${LocationFrom}','${DriverFK}','${req.contact.CustomerPK}')`

        let insertedRide = await db.executeQuery(insertQuery)

        // console.log(insertedRide)
        res.status(201).send(insertedRide[0])
    
    }
        catch(error){
            console.log("error in POST /rides", error);
            res.status(500).send()
        }
   

})

app.get('/CustomerT/me', auth, (req,res)=>{
    res.send(req.contact)
})

app.get("/hi",(req,res)=>{

    res.send("hello world")
    




})

app.post("/CustomerT/login", async (req,res)=>{

    // console.log(req.body)

    var Email = req.body.Email;
    var Password = req.body.Password;

    if(!Email || !Password){
        return res.status(400).send('bad request')
    }

    //1. Check that user email exists in the database

    var query = `SELECT *
    FROM CustomerT
    WHERE Email = '${Email}'`

    let result;

    try{
        result = await db.executeQuery(query);
    }catch(myError){
        console.log('error in /CustomerT/login')
        return res.status(500).send()
    }

    // console.log(result)

    if(!result[0]){return res.status(400).send('Invalid user credentials')}


    //2. Check that their password matches

    let user = result[0]
    // console.log(user)

    if(!bcrypt.compareSync(Password,user.Password)){
        console.log("invalid password");
        return res.status(400).send("Invalid user credentials")
    }

    //3. Generate token

    let token = jwt.sign({pk: user.CustomerPK}, config.JWT, {expiresIn: '60 minutes'} )

    console.log(token)


    //4. Save the token in database and send token and user information back to user

    let setTokenQuery = `UPDATE CustomerT
    SET Token = '${token}'
    WHERE CustomerPK = ${user.CustomerPK}`

    try{
        await db.executeQuery(setTokenQuery)

        res.status(200).send({
            token: token,
            user: {
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.Email,
                CustomerPK: user.CustomerPK
            }
        })
    }
    catch(myError){
        console.log("error setting user token ", myError);
        res.status(500).send()
    }
})

app.post("/CustomerT", async (req,res)=>{
    // res.send("creating user")
    console.log("request body", req.body)

    var FirstName = req.body.FirstName;
    var LastName = req.body.LastName;
    var Email = req.body.Email;
    var Password = req.body.Password;

    if(!FirstName || !LastName || !Email || !Password){
        return res.status(400).send("bad request")
    }

    FirstName = FirstName.replace("'","''")
    LastName = LastName.replace("'","''")

    var emailCheckQuery = `SELECT Email
    FROM CustomerT
    WHERE Email = '${Email}'`

    var existingUser = await db.executeQuery(emailCheckQuery)

    // console.log("existing user", existingUser)
    if(existingUser[0]) {
        return res.status(409).send('Please enter a different email.')
    }

    var hashedPassword = bcrypt.hashSync(Password)

    var insertQuery = `INSERT INTO CustomerT(FirstName,LastName,Email,Password)
    VALUES('${FirstName}','${LastName}','${Email}','${hashedPassword}')`

    db.executeQuery(insertQuery).then(()=>{res.status(201).send()})
    .catch((err)=>{
        console.log("error in POST /CustomerT",err)
        res.status(500).send()
    })
})

// app.post()
// app.put()
// app.delete()

app.get("/DriverT", (req,res)=>{
    //get data from database
    db.executeQuery(`SELECT *
    FROM DriverT
    LEFT JOIN VehicleT
    ON DriverT.VehicleFK = VehicleT.VehiclePK`)
    .then((result)=>{

        res.status(200).send(result)



    })
    .catch((err)=>{
        console.log(err);
        res.status(500).send()
    })

})

app.get("/DriverT/:pk", (req, res)=> {
    var pk = req.params.pk
    // console.log("my PK:" , pk)

    var myQuery = `SELECT *
    FROM DriverT
    LEFT JOIN VehicleT
    ON DriverT.VehicleFK = VehicleT.VehiclePK
    WHERE DriverPK = ${pk}`

    db.executeQuery(myQuery)
        .then((drivers)=> {
            // console.log("Drivers: ", drivers)

            if(drivers[0]){
                res.send(drivers[0])
            }else{res.status(404).send('bad request')}
        })
        .catch((err)=>{
            console.log("Error in /DriverT/pk", err)
            res.status(500).send()
        })
})
app.listen(5000,()=>{console.log("app is running on port 5000")})