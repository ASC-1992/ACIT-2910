//REQUIRE ALL MODULES
const express = require("express");
const session = require("express-session");
const pg = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

//START SERVER
var app = express();
const server = require("http").createServer(app);

//SETUP SETTINGS FOR DB, SERVER, and FOLDERS
var io = require("socket.io")(server);
var pF = path.resolve(__dirname, "pages");
var dbURL = process.env.DATABASE_URL || "postgres://postgres:123456@localhost:5432/endor"|| "postgres://localhost:5432/endor"; // this is for mac
const port = process.env.PORT || 10000;

//REDIRECT /builder to the BUILD FOLDER
app.use("/builder", express.static("build"));

//REDIRECT /css to the BUILD FOLDER
app.use("/css", express.static("style"));

//REDIRECT /fp to the MENU ITEMS FOLDER
app.use("/fp", express.static("menuItems"));

app.use('/bjs', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/bjs', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/bcss', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

//Used for later in the project to ensure sockets are always have the right array to work with
var arr = {
    kitchen: [],
    nowServing: []
}

// used to determine whether we are open or closed - closed on default
var storeStatus = false;
// used to calculate how much quantity was sold - 100 of each item for now
var startQty = 100;

//SESSION SETTING
app.use(session({
    secret:"endor", //cookie handling
    resave: true,
    saveUninitialized: true
}));

//BODY PARSER SETTING
app.use(bodyParser.urlencoded({
    extended:true
}));

// all GET request/response function below //

//Root folder
app.get("/", function(req, resp){
    if(req.session.email){
        console.log("User is already logged in");
        resp.sendFile(pF+"/home.html");
    } else{
        resp.sendFile(pF+"/home.html");
    }
        ///^^^^ How can we make this so that you cant log in with the same email on multiple devices at the same time??

});
app.get("/profile", function(req,resp){
    if(req.session.type == "customer" || req.session.type == "test"){
        resp.sendFile(pF+"/profile.html");
    } else if(req.session.type == "kitchen") {
        resp.sendFile(pF+"/kitchen.html");
    } else if(req.session.type == "admin"){
        resp.sendFile(pF+"/admin.html");
    } else {
        resp.sendFile(pF+"/login.html");
    }
});
app.get("/loginPage", function(req,resp){
   resp.sendFile(pF+"/login.html");
});
app.get("/menu", function(req, resp){
    if(req.session.ids){
        /* DONT DELETE THESE COMMENTS */
//        if (storeStatus == false) {
//            resp.sendFile(pF+"/closed.html");
//        } else {
            resp.sendFile(pF+"/menu.html");
        
    } else {
        resp.sendFile(pF+"/login.html")
    }
});
app.get("/cart", function(req, resp){
    if(req.session.ids){
    resp.sendFile(pF+"/cart.html");
    } else {
        resp.sendFile(pF+"/login.html")
    }
});
app.get("/FAQ", function(req,resp){
    resp.sendFile(pF+"/faq.html");
});
app.get("/secret", function(req,resp){
    resp.sendFile(pF+"/secret.html");
});
app.get("/NowServing", function(req, resp){
    if(req.session.ids){
    resp.sendFile(pF+"/nowServing.html");
    } else {
        resp.sendFile(pF+"/login.html")
    }});

// end of GET section //

// start of all POST request/response functions //

app.post("/logout", function(req, resp){
    req.session.destroy();
    resp.end("success");
});
app.post("/register", function(req,resp){
    var password = req.body.password;
    var email = req.body.email;
    var type = "customer";
    var loc = req.body.location;
    var gender = req.body.gender;
    
    bcrypt.hash(password, 5, function(err, bpass){

        pg.connect(dbURL, function(err, client, done){
            if(err){
                console.log(err);
                var obj = {
                    status: "fail",
                    msg: "CONNECTION FAIL"
                }
                resp.send(obj);
            }
            client.query("SELECT * FROM users WHERE email = ($1)", [email], function(err, result){
                done();
                if(err){
                        console.log(err);
                        var obj = {
                            status:"fail",
                            msg:"Something went wrong"
                        }
                        resp.send(obj);
                }

                if(result.rows.length == 0){
                    client.query("INSERT INTO users (email, password, location, type, gender) VALUES ($1, $2, $3, $4, $5)", [email, bpass, loc, type, gender], function(err, result){
                        done();
                        if(err){
                            console.log(err);
                            var obj = {
                                status:"fail",
                                msg:"SOMETHING WENT WRONG"
                            }
                            resp.send(obj);
                        }
                        var obj = {
                            status: "success"
                        }
                        resp.send(obj);
                    });
                } else {
                    var obj = {
                        status:"fail"
                    }
                    resp.send(obj);
                }

            });
        });
    });
});
app.post("/login", function(req,resp){
    var email = req.body.email;
    var password = req.body.password;
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        
        client.query("SELECT userid, email, password, location, type, gender FROM users WHERE email = $1", [email], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong" 
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length > 0) {
                if(result.rows[0].type == "customer"){
                    bcrypt.compare(password, result.rows[0].password, function(err, isMatch){
                        if(isMatch){
                            console.log("Pass Matches!!")
                            req.session.ids = result.rows[0].userid;
                            req.session.email = result.rows[0].email;
                            req.session.location = result.rows[0].location;
                            req.session.gender = result.rows[0].gender;
                            req.session.type = result.rows[0].type;
                            var obj = {
                                status:"success",                    
                                type: result.rows[0].type
                            }
                            resp.send(obj);
                        } else {
                            console.log(err);
                        }
                        //resp.send({status:"success"});
                    });
                } else if (result.rows[0].type == "admin" || result.rows[0].type == "kitchen" || result.rows[0].type == "test"){
                    console.log("It realizes its an admin")
                    if(result.rows[0].password == req.body.password){
                        console.log("It realizes that the password matches")
                            req.session.ids = result.rows[0].userid;
                            req.session.email = result.rows[0].email;
                            req.session.location = result.rows[0].location;
                            req.session.gender = result.rows[0].gender;
                            req.session.type = result.rows[0].type;
                            var obj = {
                                status:"success",                    
                                type: result.rows[0].type
                            }
                            resp.send(obj);
                    }
                } else {
                    var obj = {
                        status:"fail"
                    }
                    resp.send(obj);
                }
                
            } else {
               var obj = {
                    status:"fail",
                    msg:"Something went wrong"
                }
                resp.send(obj); 
            }
            
        });
    });
});

app.post("/menuDisplay", function(req, resp){
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        client.query("SELECT itemname, price, description, picture, type FROM inventory", [],function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                    status:"fail",
                    msg:"Something went wrong"
                }
                resp.send(obj);
            }
            if(result.rows.length > 0){
                resp.send(result.rows);
            } else {
                resp.send({status:"fail"})
            }
        });
    });
});

app.post("/menuCount", function(req, resp){
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        client.query("SELECT COUNT(orderid) FROM items WHERE orderid = $1", [req.session.orderNum],function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                    status:"fail",
                    msg:"Something went wrong"
                }
                resp.send(obj);
            }
            if(result.rows.length > 0){
                req.session.itemCount = result.rows[0].count;
                resp.send({msg:result.rows[0].count})
            } else {
                resp.send({status:"fail"})
            }
        });
    });
});

//This is for the contraint of only adding unique items to the Cart
app.post("/orderingIndividualItem", function(req, resp){
    var itemName = req.body.itemName;
     pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
            if(req.session.orderNum){
                client.query("SELECT * FROM items WHERE orderid = ($1) AND itemname = ($2)", [req.session.orderNum, itemName], function(err, result){
                   done();
                    if(err){
                        console.log(err);
                    }

                    if(result.rows.length > 0){
                        resp.send({status:"fail"})
                    } else {
                        resp.send({status:"success"})
                    }
                });  
            } else {
                //Reason I am still sending a success is because since their session orderNum isnt defined and they will get it on the next ajax call... this is fundamentally broken as they can log out and then log in again to order the same item as they have already found
                resp.send({status:"success"});
            }
     });
});

app.post("/ordering", function(req, resp){
    var orderName = req.body.itemName;
    var orderPrice = req.body.price;
    var orderQty = req.body.qty
    var b00lean;
    
    if(req.session.itemCount > 9){
        resp.send({status:"itemLimit"});
    } else {
        pg.connect(dbURL, function(err, client, done){
            if(err){
                console.log(err);
                var obj = {
                    status: "fail",
                    msg: "CONNECTION FAIL"
                }
                resp.send(obj);
            }

            //checks if their is an existing order
            client.query("SELECT * FROM orders WHERE userid = ($1)", [req.session.ids], function(err, result){
                done();
                if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
                }
                if(result.rows.length > 0){
                    req.session.orderNum = result.rows[0].ordernum;
                    orderDate = result.rows[0].datetime;

                    b00lean = insertItems(client, done, req.session.orderNum);
                    if(b00lean == 1){
                        resp.send({status:"success"});

                    }

                } else {
                    client.query("INSERT INTO orders (userid) VALUES ($1) RETURNING ordernum, datetime", [req.session.ids], function(err, result){
                        done();
                        if(err){
                            console.log(err);
                            var obj = {
                                status:"fail",
                                msg:"something went wrong"
                            }
                            resp.send(obj);
                        }
                        if(result.rows.length > 0){
                            req.session.orderNum = result.rows[0].ordernum;
                            orderDate = result.rows[0].datetime;

                            b00lean = insertItems(client, done, req.session.orderNum);
                            if(b00lean == 1){
                                resp.send({status:"success"});
                            }
                        } else {
                            resp.send({status:"fail"});
                        }
                    });
                }
            });
        });
    }
        
        


    
    function insertItems(client, done, rr){
        client.query("INSERT INTO items (orderid, itemname, itemqty, price) VALUES ($1, $2, $3, $4)", [rr, orderName, orderQty, orderPrice],function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                    status:"fail",
                    msg:"Something went wrong"
                }
                resp.send(obj);
                req.session.itemCount ++
            }
        });
        return 1;
    };

});


    

app.post("/myCart", function(req, resp){
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        
        client.query("SELECT * FROM items WHERE orderid = $1", [req.session.orderNum], function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                    status:"fail",
                    msg:"SOMETHING WENT WRONG"
                }
                resp.send(obj);
            }
            
            if(result.rows.length > 0){
                resp.send(result.rows);
            } else {
                resp.send({status:"fail"});
            }
        });
    });
});

app.post("/removeCartItem", function(req, resp){
    var itemName = req.body.itemName;
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        
        client.query("DELETE FROM items WHERE ctid=(SELECT ctid FROM items WHERE itemname = ($1) AND orderid = ($2) LIMIT 1)", [req.body.itemName, req.session.orderNum], function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                    status:"fail",
                    msg:"SOMETHING WENT WRONG"
                }
                resp.send(obj);
            }
            req.session.itemCount = req.session.itemCount - 1;
            resp.send({status:"success"});

        });
    });
});

app.post("/checkout", function(req, resp){
    console.log("CHECKOUT")
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        client.query("INSERT INTO adminItems (itemName, qty, price) SELECT itemName, itemqty, price FROM items WHERE orderid = $1", [req.session.orderNum], function(err, result){
            done();
        });
        
        client.query("INSERT INTO kitchen (itemName, orderid, qty, price) SELECT itemName, orderid, itemqty, price FROM items WHERE orderid = $1 RETURNING itemName, qty", [req.session.orderNum], function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                    status:"fail",
                    msg:"SOMETHING WENT WRONG"
                }
                resp.send(obj);
            }
            
            if(result.rows.length > 0){
                client.query("DELETE FROM items WHERE orderid = $1 RETURNING itemname", [req.session.orderNum], function(err, result){
                    done();
                    if(result.rows.length > 0){
                        resp.send({status:"success"});
                    } else {
                        resp.send({status:"fail"});
                    }
                })
            } else {
                resp.send({status:"fail"});
            }
        });
    });
});

//Kitchen related POSTs
app.post("/kitchenOrders", function(req,resp){
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        
        client.query("SELECT * from kitchen", [], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length > 0) {
                var obj = {
                    status:"success",
                    items:result.rows
                }
                resp.send(obj);
            } else {
               var obj = {
                    status:"fail",
                    msg:"Something went wrong"
                }
                resp.send(obj); 
            }
            
        });
    });
});
app.post("/cookedItems", function(req,resp){
    var itemname = req.body.itemname;
    var qty = req.body.qty;
    setTimeout(function(){
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        
        client.query("INSERT into cookeditems(itemname, qty, timecooked) VALUES($1, $2, NOW()+interval '5 second')", [itemname, qty], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length > 0) {
                var obj = {
                    status:"success",
                }
                resp.send(obj);
            } else {
               var obj = {
                    status:"fail",
                    msg:"Something went wrong"
                }
                resp.send(obj); 
            }
        });
        
    });
    
    pg.connect(dbURL, function(err, client, done){
       client.query("UPDATE totalreadyitems SET qty = qty+$1 WHERE itemname = $2", [qty, itemname], function(err, result){
            done();
        }); 
    });
        }, 5000);
});
app.post("/displayTotalItems", function(req,resp){
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
            resp.send(obj);
        }
        
        client.query("SELECT * FROM totalreadyitems", [], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length > 0) {
                var obj = {
                    status:"success",
                    rows:result.rows
                }
                resp.send(obj);
            } else {
               var obj = {
                    status:"fail",
                    msg:"Something went wrong"
                }
                resp.send(obj); 
            }
        });
        
    });
});
app.post("/removeItems", function(req,resp){
    console.log(req.body.removeItems);
    var arr = req.body.removeItems;
    
    for(var itemname in arr){
        if(!arr.hasOwnProperty(itemname)) continue;
        var qty = arr[itemname];
        pg.connect(dbURL, function(err, client, done){
            if(err){
                console.log(err);
                var obj = {
                    status: "fail",
                    msg: "CONNECTION FAIL"
                }
            }

            client.query("UPDATE totalreadyitems SET qty = qty - $1 WHERE itemname = $2", [qty, itemname], function(err, result){
                done();
                if(err){
                        console.log(err);
                        var obj = {
                            status:"fail"
                        }
                }
                try{
                    if(result.rows.length > 0) {
                    var obj = {
                        status:"success"
                        }

                    }
                } catch (TypeError){
                    console.log("CAUGHT U DUMB ERROR");
                    var obj = {
                        status:"FAILED"
                    };
                }
            });

        });
        
    }
    
    var orderid = req.body.orderid;
        pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            var obj = {
                status: "fail",
                msg: "CONNECTION FAIL"
            }
        }
        ///Using this so it so it inserts into readyOrder table getting rid of the ajax call that is called earlier (is this refactoring it sounds like refactoring), also is going to used by Alex to make a reciept!
        
        client.query("INSERT INTO readyorder (orderid, itemname, qty, price) SELECT orderid, itemname, qty, price FROM kitchen WHERE orderid = $1 RETURNING orderid", [orderid], function(err, result){
            done();
            if(err){console.log(err)}
            
            if(result.rows.length > 0){
                client.query("DELETE FROM kitchen WHERE orderid = $1", [orderid], function(err, result){
                    done();
                    if(err){
                            console.log(err);
                            var obj = {
                                status:"fail"
                            }
                    }
                    try{
                        if(result.rows.length > 0) {
                        var obj = {
                            status:"success"
                            }

                        }
                    } catch (TypeError){
                        console.log("CAUGHT U DUMB ERROR");
                        var obj = {
                            status:"FAILED"
                        };
                    }
                });
            }
        });

    });
    resp.send({status:"success"});
});
//End of Kitchen related POSTs

// Profile
app.post("/changeMyPass", function(req, resp){
    var confirmPass = req.body.confirmPass;
    
    bcrypt.hash(confirmPass, 5, function(err, bpass){

        pg.connect(dbURL, function(err, client, done){
           if(err){
               console.log(err);
               var obj = {
                   status:"fail",
                   msg:"CONNECTION FAIL"
               }
               resp.send(obj);
            }

            client.query("UPDATE users SET password=($1) WHERE userid=($2)", [bpass, req.session.ids], function(err, result){
                done();
                if(err){
                    console.log(err);
                    var obj = {
                       status:"fail",
                       msg:"invalid"
                    }
                    resp.send(obj);
                }

                var obj = {
                    status:"success"
                }
                resp.send(obj);
            });
        });
    });
});

// Start of Admin
app.post("/weAreOpen", function(req, resp){   
    storeStatus = true;
    
    pg.connect(dbURL, function(err, client, done){
       if(err){
           console.log(err);
           var obj = {
               status:"fail",
               msg:"CONNECTION FAIL"
           }
           resp.send(obj);
        }
        
        client.query("UPDATE totalreadyitems SET qty=(0)", function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                   status:"fail",
                   msg:"invalid"
                }
                resp.send(obj);
            }
        });        
        
        client.query("TRUNCATE cookeditems, items, kitchen, orders, readyorder", function(err, result){
            done();
            if(err){
                console.log(err);
                var obj = {
                   status:"fail",
                   msg:"invalid"
                }
                resp.send(obj);
            }
        });        
        
        resp.send({
            status:"success",
            theStatus:storeStatus
        });
    });
});

app.post("/weAreClosed", function(req, resp){   
    storeStatus = false;
    
    resp.send({
        status:"success",
        theStatus:storeStatus
    });
});

app.post("/openOrClosed", function(req, resp){       
    resp.send({
        theStatus:storeStatus
    });
});

app.post("/addMyItem", function(req,resp){
    var itemName = req.body.itemName;
    var itemPrice = req.body.itemPrice;    
    var itemDesc = req.body.itemDesc;
    var itemQty = req.body.itemQty;    
    var itemType = req.body.itemType;
    var itemPic = req.body.itemPic;

    pg.connect(dbURL, function(err, client, done){
       if(err){
           console.log(err);
           var obj = {
               status:"fail",
               msg:"CONNECTION FAIL"
           }
           resp.send(obj);
        }
        
        client.query("SELECT * FROM inventory WHERE itemname = ($1)", [itemName], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length == 0){
                client.query("INSERT INTO inventory (itemName, price, description, qty, type, picture) VALUES ($1, $2, $3, $4, $5, $6)", [itemName, itemPrice, itemDesc, itemQty, itemType, itemPic], function(err, result){
                    done();
                    if(err){
                        console.log(err);
                        var obj = {
                            status:"fail",
                            msg:"SOMETHING WENT WRONG"
                        }
                        resp.send(obj);
                    }
                    var obj = {
                        status: "success"
                    }
                    resp.send(obj);
                });
            } else {
                var obj = {
                    status:"fail"
                }
                resp.send(obj);
            }
        });
    });
});

app.post("/getItem", function(req, resp){
    var searchName = req.body.searchName;
    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            resp.send({status:"fail"});
        }
        
        client.query("SELECT * FROM inventory WHERE itemname LIKE $1", ['%' + searchName + '%'], function(err, result){
            done();
            if(err){
                console.log(err);
                resp.send({status:"fail"});
            }
            
            if(result.rows.length > 0){
                resp.send(result.rows);
            } else {
                resp.send({status:"fail"});
            }
        });
    })
});

app.post("/getSold", function(req, resp){    
    pg.connect(dbURL, function(err, client, done){
        if(err){
            console.log(err);
            resp.send({status:"fail"});
        }
        
        client.query("SELECT * FROM INVENTORY WHERE QTY < ($1)", [startQty], function(err, result){
            done();
            if(err){
                console.log(err);
                resp.send({status:"fail"});
            }
            
            if(result.rows.length > 0){
                resp.send(result.rows);
            } else {
                resp.send({status:"fail"});
            }
        });
    })
});

app.post("/changeThePrice", function(req, resp){
    var changeName = req.body.changeName;
    var newPrice = req.body.newPrice;
    
    pg.connect(dbURL, function(err, client, done){
       if(err){
           console.log(err);
           var obj = {
               status:"fail",
               msg:"CONNECTION FAIL"
           }
           resp.send(obj);
        }
        
        client.query("SELECT * FROM inventory WHERE itemname = ($1)", [changeName], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length == 1){
                client.query("UPDATE inventory SET price=($1) WHERE itemname=($2)", [newPrice, changeName], function(err, result){
                    done();
                    if(err){
                        console.log(err);
                        var obj = {
                            status:"fail",
                            msg:"SOMETHING WENT WRONG"
                        }
                        resp.send(obj);
                    }
                    var obj = {
                        status: "success"
                    }
                    resp.send(obj);
                });
            } else {
                var obj = {
                    status:"fail"
                }
                resp.send(obj);
            }
        });
    });
});

app.post("/changeTheQty", function(req, resp){
    var nameQty = req.body.nameQty;
    var newQty = req.body.newQty;
    
    pg.connect(dbURL, function(err, client, done){
       if(err){
           console.log(err);
           var obj = {
               status:"fail",
               msg:"CONNECTION FAIL"
           }
           resp.send(obj);
        }
        
        client.query("SELECT * FROM inventory WHERE itemname = ($1)", [nameQty], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length == 1){
                client.query("UPDATE inventory SET qty=($1) WHERE itemname=($2)", [newQty, nameQty], function(err, result){
                    done();
                    if(err){
                        console.log(err);
                        var obj = {
                            status:"fail",
                            msg:"SOMETHING WENT WRONG"
                        }
                        resp.send(obj);
                    }
                    var obj = {
                        status: "success"
                    }
                    resp.send(obj);
                });
            } else {
                var obj = {
                    status:"fail"
                }
                resp.send(obj);
            }
        });
    });
});

app.post("/removeMyItem", function(req,resp){
    var changeNameRM = req.body.changeNameRM;

    pg.connect(dbURL, function(err, client, done){
       if(err){
           console.log(err);
           var obj = {
               status:"fail",
               msg:"CONNECTION FAIL"
           }
           resp.send(obj);
        }
        
        client.query("SELECT * FROM inventory WHERE itemname = ($1)", [changeNameRM], function(err, result){
            done();
            if(err){
                    console.log(err);
                    var obj = {
                        status:"fail",
                        msg:"Something went wrong"
                    }
                    resp.send(obj);
            }
            
            if(result.rows.length == 1){
                client.query("DELETE FROM inventory WHERE itemname = ($1)", [changeNameRM], function(err, result){
                    done();
                    if(err){
                        console.log(err);
                        var obj = {
                            status:"fail",
                            msg:"SOMETHING WENT WRONG"
                        }
                        resp.send(obj);
                    }
                    var obj = {
                        status: "success"
                    }
                    resp.send(obj);
                });
            } else {
                var obj = {
                    status:"fail"
                }
                resp.send(obj);
            }
        });
    });
});

app.post("/SalesByDay", function(req, resp){
     pg.connect(dbURL, function(err, client, done){
       if(err){
           console.log(err);
           var obj = {
               status:"fail",
               msg:"CONNECTION FAIL"
           }
           resp.send(obj);
        }
        
        client.query("SELECT date, SUM(qty * price) AS total FROM adminitems GROUP BY date", [], function(err, result){
            done();
            if(err){console.log(err)}
            if(result.rows.length > 0){
                resp.send(result.rows)
            } else {
                resp.send({status:"fail"});
            }
        });
     });
});
// End of Admin

//Start of NowServing
app.post("/checkorder", function(req, resp){
    var order = req.body.order;
    
    if(order == req.session.orderNum){
        pg.connect(dbURL, function(err, client, done){
            client.query("SELECT * FROM readyOrder WHERE orderid = $1", [req.session.orderNum], function(err, result){
                done();
                if(result.rows.length > 0){
                    var obj = {
                        status:"success",
                        rows: result.rows
                    }
                    resp.send(obj);
                    client.query("DELETE FROM readyOrder WHERE orderid = $1", [req.session.orderNum], function(err, result){
                        done();
                    });
                    
                }
            });

            client.query("DELETE FROM orders WHERE orderid = $1", [req.session.orderNum], function(err, result){
                done();
            });
        });
    } else {
        resp.send({status:"fail"});
    }

});


app.get("/xiEzMyEY6LAhMzQhYS0=", function(req, resp){
    //This is basically to send information to the profile page, its an encrypted word (probably doesnt need to be just trying to be sneaky)
    resp.send(req.session);
});

// end of POST functions //

//Sockets for kitchen functions
io.on("connection", function(socket){ 
    
        setInterval(function(){
            //SELECT all items in order and send over socket to client
            pg.connect(dbURL, function(err, client, done){
                if(err){
                    console.log(err);
                    var obj = {
                        status: "fail",
                        msg: "CONNECTION FAIL"
                    }
                }

                client.query("SELECT * from kitchen", [], function(err, result){
                    done();
                    if(err){
                            console.log(err);
                            var obj = {
                                status:"fail",
                                msg:"Something went wrong"
                            }
                    }

                    if(result.rows.length > 0) {
                        var obj = {
                            status:"success",
                            items:result.rows
                        }
                        socket.emit("push orders", obj);
                    } else {
                       var obj = {
                            status:"fail",
                            msg:"Something went wrong"
                        }
                       socket.emit("push orders", "Failed");
                    }
                });
            });
            //SELECT all totalReadyItems and display to client to show all prepared items.
            pg.connect(dbURL, function(err, client, done){
                if(err){
                    console.log(err);
                    var obj = {
                        status: "fail",
                        msg: "CONNECTION FAIL"
                    }
                }

                client.query("SELECT * from totalreadyitems ORDER BY itemname", [], function(err, result){
                    done();
                    if(err){
                            console.log(err);
                            var obj = {
                                status:"fail",
                                msg:"Something went wrong"
                            }
                    }

                    if(result.rows.length > 0) {
                        var obj = {
                            status:"success",
                            items:result.rows
                        }
                        socket.emit("update total orders", obj);
                    } else {
                       var obj = {
                            status:"fail",
                            msg:"Something went wrong"
                        }
                       socket.emit("update total orders", obj);
                    }
                });
            });
            //DELETE items from cookedItems if they have expired (been cooked for more than 5 minutes)
            pg.connect(dbURL, function(err, client, done){
                if(err){
                    console.log(err);
                    var obj = {
                        status: "fail",
                        msg: "CONNECTION FAIL"
                    }
                }

                client.query("DELETE FROM cookeditems WHERE NOW() - timecooked > '5 minutes' RETURNING itemname, qty", [], function(err, result){
                    done();
                    if(err){
                            console.log(err);
                            var obj = {
                                status:"fail",
                                msg:"Something went wrong"
                            }
                    }
                    try {
                    if(result.rows.length > 0) {
                        var obj = {
                            status:"success",
                            rows: result.rows
                        }
                        io.emit('expired items', obj);
                    } else {
                       var obj = {
                            status:"fail",
                        }
                    }
                    } catch (TypeError){
                        console.log("Type Error!")
                    }
                });
            });
            }, 1000);
    
    //Update table totalReadyItems after item has expired
    socket.on("update expired items", function(obj){
        var itemname = obj.itemname;
        var qty = obj.qty;
           pg.connect(dbURL, function(err, client, done){
                    if(err){
                        console.log(err);
                        var obj = {
                            status: "fail",
                            msg: "CONNECTION FAIL"
                        }
                    }

                    client.query("UPDATE totalreadyitems SET qty = qty - $1 WHERE itemname = $2", [qty, itemname], function(err, result){
                        done();
                        if(err){
                                console.log(err);
                                var obj = {
                                    status:"fail",
                                    msg:"Something went wrong"
                                }
                        }
                        try {
                        if(result.rows.length > 0) {
                            var obj = {
                                status:"success",
                                rows: result.rows
                            }
                            io.emit('expired items', obj);
                        } else {
                           var obj = {
                                status:"fail",
                            }
                        }
                        } catch (TypeError){
                            console.log("Type Error!")
                        }
                    });
                }); 
    });
    
    setTimeout(()=> {
        setInterval(function(){
            (function(arr){

                pg.connect(dbURL, function(err, client, done){

                    client.query("SELECT DISTINCT orderid FROM kitchen", [], function(err, result){
                        done();
                        if(result.rows.length >= 0){
                            arr.kitchen = [];
                            for(var i = 0; i<result.rows.length; i++){
                                arr.kitchen.push(result.rows[i].orderid);
                            }
                        }
                    });

                    client.query("SELECT DISTINCT orderid FROM readyOrder", [], function(err, result){
                        done();
                        if(result.rows.length >= 0){
                            arr.nowServing = [];
                            for(var i = 0; i<result.rows.length; i++){
                                arr.nowServing.push(result.rows[i].orderid);
                            }
                        }
                    });
                });
            })(arr);
            socket.emit("Order Status", {
                kitchen: arr.kitchen,
                nowServing: arr.nowServing
            });
        }, 1000);
    }, 1000)
    
    //Disconnect socket
    socket.on("disconnect", function(){
        
    });
});


//Listen to port
server.listen(port, function(err){
    if(err){
        console.log(err);
        return false;
    }
    
    console.log(port+" is running");
});
