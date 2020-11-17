const express = require('express')
const bcrypt = require('bcryptjs')

const db = require('./dbConnectExec.js')

const app = express();
app.use(express.json())


app.get("/hi",(req,res)=>{

    res.send("hello world")
    




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

app.get("/VehicleT", (req,res)=>{
    //get data from database
    db.executeQuery(`SELECT *
    FROM VehicleT
    LEFT JOIN DriverT
    ON VehicleT.VehiclePK = DriverT.VehicleFK`)
    .then((result)=>{

        res.status(200).send(result)



    })
    .catch((err)=>{
        console.log(err);
        res.status(500).send()
    })

})

app.get("/VehicleT/:pk", (req, res)=> {
    var pk = req.params.pk
    // console.log("my PK:" , pk)

    var myQuery = `SELECT *
    FROM VehicleT
    LEFT JOIN DriverT
    ON VehicleT.VehiclePK = DriverT.VehicleFK
    WHERE VehiclePK = ${pk}`

    db.executeQuery(myQuery)
        .then((drivers)=> {
            // console.log("Drivers: ", drivers)

            if(drivers[0]){
                res.send(drivers[0])
            }else{res.status(404).send('bad request')}
        })
        .catch((err)=>{
            console.log("Error in /VehicleT/pk", err)
            res.status(500).send()
        })
})
app.listen(5000,()=>{console.log("app is running on port 5000")})