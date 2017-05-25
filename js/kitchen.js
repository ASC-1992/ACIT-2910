console.log("Kitchen HTML");
var main = [];
var side = [];
var dessert = [];
var beverage = [];
var uniqueArr = [];

var itemsContainer = document.getElementById('itemsContainer');
var cookedItems = document.getElementById('cookedItems');
var readyToServe = document.getElementById('readyToServe');
    
//Populate arrays with food items - Used to create item buttons
    $.ajax({
            url:"/menuDisplay",
            type:"post",

            success:function(resp){

                for(var i = 0; i<resp.length; i++){

                    if(resp[i].type == "main"){
                        main.push(resp[i]);
                    }else if(resp[i].type == "sides") {
                        side.push(resp[i]);
                    }else if(resp[i].type == "dessert"){
                        dessert.push(resp[i]);
                    }else if(resp[i].type == "beverage"){
                        beverage.push(resp[i]);
                    } else {
                        console.log("Okay something went very very wrong");
                    }
                } 
            }
        });
    
//Get all kitchen orders
    $.ajax({
       url:"/kitchenOrders",
        type:"post",
        success:function(resp){
            if(resp.status=='success'){
                var arr = [];
                console.log("Got items for order1");
                for(i=0;i<resp.items.length;i++){
                    arr.push(resp.items[i].orderid);
                }

                uniqueArr = arr.filter(onlyUnique);
                console.log(uniqueArr);


                for(i=0;i<uniqueArr.length;i++){
                    
                    var orderDiv = document.createElement("div");
                    orderDiv.className = 'col-md-4';
                    orderDiv.orderid = uniqueArr[i];
                    orderDiv.innerHTML = "<h2>"+uniqueArr[i]+"</h2>";
                    
                    for(j=0;j<resp.items.length;j++){
                    if(resp.items[j].orderid == uniqueArr[i]){
                        var nDiv = document.createElement("div");
                        nDiv.itemName = resp.items[j].itemname;
                        nDiv.innerHTML = "<h4>" + resp.items[j].itemname + "</h4>";
                        orderDiv.appendChild(nDiv);
                        }
                    }
                    document.getElementById("kitchenContainer").appendChild(orderDiv);
                }

            } else {
                console.log("No items???");
            }
        }
    });

//Buttons that create a div and show food items for their respective food types
    document.getElementById("mainItems").addEventListener("click", function(){

        var menuDiv = document.createElement("div");
        var closeBut = document.createElement("div");
        menuMaker(main, menuDiv, closeBut);
        document.getElementById("itemsContainer").appendChild(menuDiv);
    });

    document.getElementById("sideItems").addEventListener("click", function(){
        var menuDiv = document.createElement("div");
        var closeBut = document.createElement("div");
        menuMaker(side, menuDiv, closeBut);
        document.getElementById("itemsContainer").appendChild(menuDiv);
    });

    document.getElementById("desertItems").addEventListener("click", function(){
        var menuDiv = document.createElement("div");
        var closeBut = document.createElement("div");
        menuMaker(dessert, menuDiv, closeBut);
        document.getElementById("itemsContainer").appendChild(menuDiv);
    });

    document.getElementById("bevItems").addEventListener("click", function(){
        var menuDiv = document.createElement("div");
        var closeBut = document.createElement("div");
        menuMaker(beverage, menuDiv, closeBut);
        document.getElementById("itemsContainer").appendChild(menuDiv);
    });
    
initSockets();


//Creates a unique Array
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

//Begins a timer and makes an AJAX call to update totalReadyItems
function startTimer(duration, display, itemName, quantity) {
    var start = Date.now(), diff, minutes, seconds;
    function timer() {
        diff = duration - (((Date.now() - start) / 1000) | 0);

        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.innerHTML = minutes + ":" + seconds; 

        if (diff <= 0) {
            clearInterval(timer);
            display.innerHTML = "READY";
        }
    };
    timer();
    setInterval(timer, 1000);
    $.ajax({
               url:"/cookedItems",
                type:"post",
                data:{
                    itemname: itemName,
                    qty: quantity
                },
                success:function(resp){
                    if(resp.status=="success"){
                        console.log("Items cooked");
                        
                    }
                }
            });
}

//Creates a timer div and sets the time for the timer
function createTimer(itemsDiv, itemName, quantity){
    var display = document.createElement("div");
    display.style.position = 'right';
    var fiveMinutes = 5;
    startTimer(fiveMinutes, display, itemName, quantity);
    itemsDiv.appendChild(display);
    
    removeEventListener('click', createTimer);
}

//Helps create the buttons and divs to cook items (w/ quantity)
function menuMaker(menutype, menuDiv, closeBut){
    
    menuDiv.style.position = 'absolute';
    menuDiv.style.height = "450px";
    menuDiv.style.width = "500px";
    menuDiv.style.top = '0%';
    menuDiv.style.left = '0%';
    menuDiv.style.backgroundColor = 'black';
    menuDiv.style.zIndex = "2";
    menuDiv.style.transition = "2s";
    document.getElementById("kitchenContainer").style.opacity = "0.5";
    document.getElementById("container2").style.opacity = "0.5";
    
    closeBut.style.height = '15px';
    closeBut.style.width = '15px';
    closeBut.style.position = 'absolute';
    closeBut.style.top = '2%';
    closeBut.style.right = '2%';
    closeBut.style.backgroundColor = 'blue';
    
    closeBut.addEventListener("click", function(){
        menuDiv.style.display = "none"; 
        document.getElementById("kitchenContainer").style.opacity = "1";
        document.getElementById("container2").style.opacity = "1";
    });
    
    for(var i = 0; i<menutype.length; i++){
        var nBut = document.createElement("button");
        nBut.className = "btn btn-lg center-block btn-primary";
        nBut.style.marginTop = "50px";
        nBut.style.marginLeft = "50px";
        nBut.style.position = "relative";
        nBut.style.display = "inline-block";
        nBut.itemName = menutype[i].itemname;
        nBut.innerHTML = menutype[i].itemname;
        
        nBut.addEventListener("click", function(){
            
            var qtyDiv = document.createElement("div");
            var qtyBut1 = document.createElement("button");
            var qtyBut2 = document.createElement("button");
            var qtyBut3 = document.createElement("button");
            
            qtyDiv.style.backgroundColor = "gold";
            qtyDiv.style.position = "absolute";
            qtyDiv.style.height = "100px";
            qtyDiv.style.width = "300px";
            qtyDiv.style.padding = "30px";
            qtyDiv.style.marginTop = "15px";
            qtyDiv.style.marginTop = "35px";
            qtyDiv.style.zIndex = "3";
            
            qtyBut1.className = "btn btn-lg center-block btn-primary";
            qtyBut1.innerHTML = "1";
            qtyBut1.style.position = "relative";
            qtyBut1.style.display = "inline-block";
            qtyBut1.itemName = this.itemName;
            qtyBut1.addEventListener("click", function(){
                menuDiv.style.display = "none"; 
                document.getElementById("kitchenContainer").style.opacity = "1";
                document.getElementById("container2").style.opacity = "1";
                qtyDiv.style.display = "none"; 
                createTimer(qtyBut1, this.itemName, 1);
            });

            qtyBut2.className = "btn btn-lg center-block btn-primary";
            qtyBut2.innerHTML = "2";
            qtyBut2.style.marginLeft = "50px";
            qtyBut2.style.position = "relative";
            qtyBut2.style.display = "inline-block";
            qtyBut2.itemName = this.itemName;
            qtyBut2.addEventListener("click", function(){
                qtyDiv.style.display = "none"; 
                menuDiv.style.display = "none"; 
                document.getElementById("kitchenContainer").style.opacity = "1";
                document.getElementById("container2").style.opacity = "1";
                createTimer(qtyBut2, this.itemName, 2);
            });
            
            qtyBut3.className = "btn btn-lg center-block btn-primary";
            qtyBut3.innerHTML = "6";
            qtyBut3.style.marginLeft = "50px";
            qtyBut3.style.position = "relative";
            qtyBut3.style.display = "inline-block";
            qtyBut3.itemName = this.itemName;
            qtyBut3.addEventListener("click", function(){
                menuDiv.style.display = "none"; 
                document.getElementById("kitchenContainer").style.opacity = "1";
                document.getElementById("container2").style.opacity = "1";
                qtyDiv.style.display = "none"; 
                createTimer(qtyBut3, this.itemName, 6);
            });

            qtyDiv.appendChild(qtyBut1);
            qtyDiv.appendChild(qtyBut2);
            qtyDiv.appendChild(qtyBut3);
            
            menuDiv.appendChild(qtyDiv);
            //-----------------------------------------
        });
        
        menuDiv.appendChild(nBut);
    }
    
    menuDiv.appendChild(closeBut);
};

//Initialize sockets for pending orders - readyitems - expired items
function initSockets(){
    
    var socket = io();  
    
    //Updates all orders
    socket.on("push orders", function(obj){
    readyToServe.innerHTML = "";
    for(var i=0; i<uniqueArr.length; i++){
        var orderDiv = document.createElement("div");
        orderDiv.className = 'col-md-4';
        orderDiv.orderid = uniqueArr[i];
        orderDiv.style.backgroundColor = "blue";
        orderDiv.style.marginTop = "20px";
        orderDiv.style.marginLeft = "20px";
        orderDiv.innerHTML = "<h2>"+uniqueArr[i]+"</h2>";
        var removeItems = {};
        if(obj.items.length>0){
        for(var j=0;j<obj.items.length;j++){
            if(obj.items[j].orderid == uniqueArr[i]){

                var nDiv = document.createElement("div");
                var key = obj.items[j].itemname;
                nDiv.itemname = obj.items[j].itemname;
                nDiv.id = obj.items[j].itemname;
                nDiv.innerHTML = "<h4>" + obj.items[j].itemname + "</h3>";
                
                nDiv.style.color = "white";
                if(key in removeItems){
                    removeItems[key] += obj.items[j].itemqty;
                } else {
                    removeItems[key] = obj.items[j].itemqty;
                }
                orderDiv.appendChild(nDiv);
                }
            }
        }
                var nBut = document.createElement("button");
                nBut.innerHTML = "READY";
                nBut.className = "btn btn-md btn-primary center-block";
                nBut.style.backgroundColor = "black";
                nBut.itemList = removeItems;
                nBut.orderid = uniqueArr[i];
                nBut.addEventListener("click", function(){

                    var removeItems = this.itemList;
                    //Removes completed order from respective tables
                   $.ajax({
                      url:"/removeItems",
                       type:"post",
                       data: {
                           removeItems: removeItems,
                           orderid: this.orderid
                       },
                       success:function(resp){
                           console.log(resp.status);
                       }
                   });

                });
            for(key in removeItems){
                if(removeItems[key] == 0){
                    console.log("HAS 0 ITEMS, BUTTON SHUDNT WORK")
                    nBut.addEventListener("click", function(){
                        console.log("order not complete~");
                    })
                }
            } 
        
            orderDiv.appendChild(nBut);
            readyToServe.appendChild(orderDiv);
        }
    });
    
    //Updates all cooked items
    socket.on("update total orders", function(obj){
        cookedItems.innerHTML = "";
        var rowDiv = document.createElement("div");
        var colDiv1 = document.createElement("div");
        var colDiv2 = document.createElement("div");
        
        rowDiv.className = 'row';
        colDiv1.className = 'col-md-6 center-block';
        colDiv2.className = 'col-md-6 center-block';
        colDiv1.innerHTML = '<tr id="column1"> <h3> Item Name </h3> </tr>';
        colDiv2.innerHTML = '<tr id="column2"> <h3> Quantity </h3> </tr>';
        
        rowDiv.appendChild(colDiv1);
        rowDiv.appendChild(colDiv2);
        cookedItems.appendChild(rowDiv);

        for(var i=0; i<obj.items.length; i++){
            var nDiv = document.createElement("div");
            nDiv.style.color = 'white';
            nDiv.innerHTML = "<h4>" + obj.items[i].itemname + " &emsp;&emsp;&emsp; "+ obj.items[i].qty + "</h4>";
            cookedItems.appendChild(nDiv);
        }
    });
    
    //Helps remove expired/cold food items
    socket.on("expired items", function (obj){
        for(var i=0; i<obj.rows.length; i++){
            var sendObj = {
                itemname : obj.rows[i].itemname,
                qty : obj.rows[i].qty
        }
            socket.emit("update expired items", sendObj);
        }
    });
};