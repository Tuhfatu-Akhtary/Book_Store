const mysql=require('mysql');

require('dotenv').config();
var con=mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DATABASE
});

con.connect(function (error){
    if(error)
    {
        console.log("Database Connection Failed");
    }
    else{
        console.log("Database Connected Successfully");
    }
});

module.exports=con;