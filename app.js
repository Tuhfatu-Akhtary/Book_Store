const express=require('express');
const app=express();
const mysql=require('mysql');
const bodyParser=require('body-parser');
const session=require('express-session');

app.use(function (req,res,next){
    res.set('Cache-Control','no-cache,private,must-revalidate,no-store');
    next();
})
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized:true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
require('dotenv').config();
var con=require("./connection");
app.set('view engine','ejs');
app.use(express.static("public"));

app.get("/",function (req,res){
   res.render("login.ejs");
});

app.get("/login",function (req,res){
    res.render("login.ejs");
});

app.post("/login",function (req,res){
    var email= req.body.email;
    var password= req.body.password;

    if(email && password){
        var sql="SELECT * FROM user WHERE email=? AND password=?;";
        con.query(sql,[email,password],function (error,results,fields){
            if(results.length>0){
                req.session.loggedin=true;
                req.session.email=email;
                req.session.role=results[0].role;
                res.redirect("/book_list");

            }
            else{
                res.send("<h1>Incorrect email or password</h1>");

            }
        });
    }
    else{
        res.send("<h1>Please enter email or password</h1>");
    }
});

const requireRole=(role)=>{
    return (req, res, next) => {
        if (req.session.loggedin && req.session.role === role) {
            next();
        } else {
            res.send('Forbidden');
        }
    };
};

app.get("/registration",function (req,res){
   res.render("registration.ejs");
});

app.post("/registration",function(req,res){

var name=req.body.name;
var email=req.body.email;
var phone_no=req.body.phone_no;
var password=req.body.password;
var cpassword =req.body.cpassword;
var role=req.body.role;

if(password==cpassword){

    var sql="INSERT INTO user (name,email,phone_no,password,role) values('"+name+"','"+email+"','"+phone_no+"','"+password+"','"+role+"');";
    con.query(sql,function (error,results) {
        if (error) throw error;

        res.redirect("/login");
    });
}

else{
    res.send("<h1>Please confirm your password </h1>")
    }


});



app.get("/book_add",requireRole('Admin'),function (req,res){
    res.render("book_add.ejs")
});

app.post("/book_add",function (req,res){
    var book_name=req.body.book_name;
    var edition=req.body.edition;
    var author=req.body.author;
    var publisher=req.body.publisher;
    var genre=req.body.genre;
    var no_page=req.body.no_page;
    var price=req.body.price;
    var no_available_books=req.body.no_available_books;



    console.log(book_name,edition,author,publisher,genre,no_page,price,no_available_books);
    var sql="INSERT INTO book_details(book_name,edition,author,publisher,genre,no_page,price,no_available_books) values ('"+book_name+"','"+edition+"','"+author+"','"+publisher+"','"+genre+"','"+no_page+"','"+price+"','"+no_available_books+"')";
    console.log(sql);

    con.query(sql,function (error){
        if(error){
            throw error;
        }
        else{
            console.log("Data Uploaded Successfully");
            res.redirect("/book_list");
        }
    });
});

app.get("/book_list",function (req,res){
    if(req.session.loggedin==true) {
        if(req.session.role === 'Admin') {
            var sql = "SELECT * FROM book_details";
            con.query(sql, function (error, results) {
                console.log(results);
                if (error) {
                    throw error;
                } else {


                    res.render("book_list.ejs", {book_details: results});
                }
            });
        }
        else{
            var sql = "SELECT * FROM book_details";
            con.query(sql, function (error, results) {
                console.log(results);
                if (error) {
                    throw error;
                } else {


                    res.render("book_listUser.ejs", {book_details: results});
                }
            });

        }
    }
    else{
        res.redirect("/login");
    }
});


app.get("/book_update",requireRole('Admin'),function (req,res){
    con.connect(function (error){
        if(error)  console.log(error);

        var sql="SELECT * FROM book_details WHERE id=?;";

        var id=req.query.id;
        con.query(sql,[id],function(error,results){
            if(error) console.log(error);

            res.render("book_update.ejs",{book_details:results});
        });
    });
});

app.post("/update",function (req,res){

    var book_name=req.body.book_name;
    var edition=req.body.edition;
    var author=req.body.author;
    var publisher=req.body.publisher;
    var genre=req.body.genre;
    var no_page=req.body.no_page;
    var price=req.body.price;
    var no_available_books=req.body.no_available_books;
    var id=req.body.id;


    console.log(book_name,edition,author,publisher,genre,no_page,price,no_available_books,id);
    var sql="Update book_details Set book_name=?,edition=?,author=?,publisher=?,genre=?,no_page=?,price=?,no_available_books=? Where id=?";
    console.log(sql);

    con.query(sql,[book_name,edition,author,publisher,genre,no_page,price,no_available_books,id],function (error){
        if(error){
            throw error;
        }
        else{
            console.log("Data Updated Successfully");
            res.redirect("/book_list");
        }
    });
});

app.get("/book_delete",requireRole('Admin'),function (req,res) {
    con.connect(function (error) {
        if (error) console.log(error);

        var sql = "DELETE FROM book_details WHERE id=?;";
        var id = req.query.id;

        con.query(sql, [id], function (error, results) {
            if (error) console.log(error);

            res.redirect("/book_list");
        });
    });
});

app.get("/logout",function (req,res){
    req.session.destroy((error)=>{
        res.redirect("/login");
    });
});


var server=app.listen(4500,function (){

    console.log("Server Running");
});

