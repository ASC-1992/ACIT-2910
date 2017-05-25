$(document).ready(function(){
    $.ajax({
        url:"/xiEzMyEY6LAhMzQhYS0=",
        success:function(resp){
            console.log("E-mail : " + resp.email);
            document.getElementById("email").innerHTML = "Hope you're having a great day, " + emailUsername(resp.email) + "!"; 
        }
    });
    
    document.getElementById("logout").addEventListener("click", function(){
        $.ajax({
            url:"/logout",
            type:"post",
            success:function(resp){
                location.reload();
            }
        });
    });
    
    $.ajax({
        url:"/openOrClosed",
        type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
        success:function(resp){
            if (resp.theStatus == true) {
                theStatus.innerHTML = "Open!";
                theStatus.style.color = "green";
            } else if (resp.theStatus == false) {
                theStatus.innerHTML = "Closed!";
                theStatus.style.color = "red";
            } else {
                alert("Couldn't read store status variable");
            }
        }
    });
    
    // First level buttons
    var viewSearch = document.getElementById("viewSearch");
    var addMenu = document.getElementById("addMenu");
    var editSearch = document.getElementById("editSearch"); 
    var viewReport = document.getElementById("viewReport"); 
    
    // Second level div
    var result = document.getElementById("result");
        
    // Third level tables
    var tableInfo = document.getElementById("tableInfo");
    var ordersTable = document.getElementById("ordersTable");
    var itemsTable = document.getElementById("itemsTable");
    
    // Search item in database buttons
    var searchDB = document.getElementById("find");
    var changeDB = document.getElementById("changeDB");
    
    // Total amounts integers
    var dbTotalPrice = 0;
    var ordersTotalPrice = 0;
    var itemsTotalPrice = 0;
    
    // Total amounts divs
    var dbTotal = document.getElementById("dbTotal")
    var ordersTotal = document.getElementById("ordersTotal")
    var itemsTotal = document.getElementById("itemsTotal")
    
    // Store Status
    $(function(){
        $("#open").click(function() {      
            theStatus.innerHTML = "Open!";
            theStatus.style.color = "green";
            
            $.ajax({
                url:"/weAreOpen",
                type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                success:function(resp){
                    if(resp.status == "success"){
                        alert("ROLLOUT");
//                        alert(resp.theStatus);
                    } else {
                        alert("Couldn't reset data");
                    }
                }
            });
        });
    });    
    
    $(function(){
        $("#close").click(function() {   
            theStatus.innerHTML = "Closed!";
            theStatus.style.color = "red";
            
            $.ajax({
                url:"/weAreClosed",
                type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                success:function(resp){
                    if(resp.status == "success"){
                        alert("CLOSED SHOP");
//                        alert(resp.theStatus);
                    } else {
                        alert("Couldn't reset data");
                    }
                }
            });
        });
    });
    
    // First Level Yellow Search Button
    $(function(){
        $("#searchBut").click(function() {
            result.innerHTML = "";
            dbTotal.innerHTML = "";
            $("#tableInfo td").remove(); 
            hideReports();
            menuText.innerHTML = "SEARCH MENU";
            viewSearch.style.display = "inline";
            result.appendChild(viewSearch);
            searchDB.style.backgroundColor = "yellow";
        });
    });
    
    // First Level Green Add Button
    $(function(){
        $("#add").click(function() {
            result.innerHTML = "";
            tableInfo.style.display = "none";
            hideReports();
            menuText.innerHTML = "ADD MENU";
            addMenu.style.display = "inline";
            result.appendChild(addMenu);
        });
    });
    
    // First Level Red Edit Button
    $(function(){
        $("#edit").click(function() {
            result.innerHTML = "";
            $("#tableInfo td").remove(); 
            hideReports();
            menuText.innerHTML = "EDIT MENU";
            editSearch.style.display = "inline";
            result.appendChild(editSearch);
            searchDB.style.backgroundColor = "red";
        });
    });    
    
    // First Level View Reports Button
    $(function(){
        $("#report").click(function() {
            result.innerHTML = "";
            ordersTotal.innerHTML = "";
            itemsTotal.innerHTML = "";
            tableInfo.style.display = "none";
            hideReports();
            menuText.innerHTML = "VIEW REPORTS";
            viewReport.style.display = "inline";
            result.appendChild(viewReport);
        });
    });
    
    // Second Level Search Item button
    $(function(){
        $("#viewFind").click(function() {
            var searchName = document.getElementById("searchName").value;
            if (searchName != ""){
                $("#tableInfo td").remove(); 
                console.log("Finding " + searchName);
                dbTotalPrice = 0;
                displayDB();
                document.getElementById("searchName").value = "";
            } else {
                alert("Enter item name please");
            }
        });
    }); 
    
    // Second Level Add Item Button
    $(function(){
        $("#addItem").click(function() {
            var itemName = document.getElementById("itemName").value;
            var itemPrice = document.getElementById("itemPrice").value;
            var itemDesc = document.getElementById("itemDesc").value;
            var itemQty = document.getElementById("itemQty").value;
            var itemType = document.getElementById("itemType").value;
            var itemPic = document.getElementById("itemPic").value;
            
            addMenu.reset();
            
            if(itemName && itemPrice && itemDesc && itemQty && itemType && itemPic != ""){
                $.ajax({
                    url:"/addMyItem",
                    type:"post",
                    data:{
                        itemName: itemName,
                        itemPrice: itemPrice,
                        itemDesc: itemDesc,
                        itemQty: itemQty,
                        itemType: itemType,
                        itemPic: itemPic
                    },
                    success:function(resp){
                        if(resp.status == "success"){
                            alert("Successfully added item!");
                        } else if(resp.status == "fail"){
                            alert("Item already exists!");
                        }
                    }
                });
            } else {
                alert("Ensure item isn't blank / doesn't already exist");
            }
        });
    }); 
    
    // Second Level Edit Find Keyword button
    $(function(){
        $("#find").click(function() {
            var searchName = document.getElementById("searchName").value;
            if (searchName != ""){
                $("#tableInfo td").remove(); 
                console.log("Finding " + searchName);
                displayDB();
                document.getElementById("searchName").value = "";       
                pleaseMenu.style.display = "block";
                result.appendChild(pleaseMenu);
            } else {
                alert("Enter item name please");
            }
        });
    });    
    
    // Second Level View Orders Report button
    $(function(){
        $("#ordersReport").click(function() {
            itemsTable.style.display = "none";
            $("#ordersTable td").remove();
            ordersTotalPrice = 0;
            ordersDB();
        });
    });    
    
    // Second Level View Items Report button
    $(function(){
        $("#itemsReport").click(function() {
            ordersTable.style.display = "none";
            $("#itemsTable td").remove(); 
            itemsTotalPrice = 0;
            itemsDB();
        });
    });  
    
    // Third Level Edit Change Price Button
    $(function(){
        $("#pricePlease").click(function() {
            changeDB.style.display = "block";
            result.appendChild(changeDB);
        });
    });       
    
    // Third Level Edit Change Quantity Button
    $(function(){
        $("#qtyPlease").click(function() {
            changeQty.style.display = "block";
            result.appendChild(changeQty);
        });
    });    
    
    // Third Level Edit Remove Item Button
    $(function(){
        $("#removePlease").click(function() {
            removeDB.style.display = "block";
            result.appendChild(removeDB);
        });
    });
    
    // Fourth Level Edit Change Price Options
    $(function(){
        $("#changePrice").click(function() {
            var changeName = document.getElementById("changeName").value;
            var newPrice = document.getElementById("newPrice").value;
            console.log("Change " + changeName + " to " + newPrice);
            if (changeName && newPrice != ""){
                document.getElementById("changeName").value = "";
                document.getElementById("newPrice").value = "";
                $.ajax({
                    url:"/changeThePrice",
                    data:{
                        changeName: changeName,
                        newPrice: newPrice
                    },
                    type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                    success:function(resp){
                        if(resp.status == "success"){
                            alert("Price successfully changed!");
                        } else if(resp.status == "fail"){
                            alert("CHANGE FAILED: ENTER FULL ITEM NAME");
                        }
                    }
                });
            } else {
                alert("Please check that the name and/or price is not blank");
            }
        });
    });    
    
    // Fourth Level Edit Change Quantity Options
    $(function(){
        $("#qtyBut").click(function() {
            var nameQty = document.getElementById("nameQty").value;
            var newQty = document.getElementById("newQty").value;
            console.log("Change " + nameQty + " to " + newQty);
            if (nameQty && newQty != ""){
                document.getElementById("nameQty").value = "";
                document.getElementById("newQty").value = "";
                $.ajax({
                    url:"/changeTheQty",
                    data:{
                        nameQty: nameQty,
                        newQty: newQty
                    },
                    type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                    success:function(resp){
                        if(resp.status == "success"){
                            alert("Quantity successfully changed!");
                        } else if(resp.status == "fail"){
                            alert("CHANGE FAILED: ENTER FULL ITEM NAME");
                        }
                    }
                });
            } else {
                alert("Please check that the name and/or quantity is not blank");
            }
        });
    });
    
    // Fourth Level Edit Remove Item Options
    $(function(){
        $("#removeItem").click(function() {
            var changeNameRM = document.getElementById("changeNameRM").value;
            console.log("Removing " + changeNameRM);
            if (changeNameRM != ""){
                document.getElementById("changeNameRM").value = "";
                $.ajax({
                    url:"/removeMyItem",
                    data:{
                        changeNameRM: changeNameRM
                    },
                    type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                    success:function(resp){
                        if(resp.status == "success"){
                            alert("Item successfully removed!");
                        } else if(resp.status == "fail"){
                            alert("CHANGE FAILED: ENTER FULL ITEM NAME");
                        }
                    }
                });
            } else {
                alert("Please check that the item is not blank");
            }
        });
    });
    
    /* parses the whole e-mail address to get the username, before the "@"
    only works after login, otherwise throws error because no e-mail */
    function emailUsername(email) {
        return email.match(/^(.+)@/)[1];
    };
    
    // searches the DB and returns items with the inputted name value
    function displayDB(){
        var searchName = document.getElementById("searchName").value;
        tableInfo.style.display = "block";

        $.ajax({
            url:"/getItem",
            data:{
                searchName:searchName
            },
            type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
            success:function(resp){
                //loop through the select
                for(var i = 0; i<resp.length; i++){
                    var tr = tableInfo.insertRow();
                    var name = document.createElement("td");
                    var price = document.createElement("td");
                    var desc = document.createElement("td");
                    var qty = document.createElement("td");
                    var type = document.createElement("td");
                    var pic = document.createElement("td");

                    name.textContent = resp[i].itemname;
                    price.textContent = resp[i].price;
                    desc.textContent = resp[i].description;
                    qty.textContent = resp[i].qty;
                    type.textContent = resp[i].type;
                    pic.textContent = resp[i].picture;

                    tr.appendChild(name);
                    tr.appendChild(price);
                    tr.appendChild(desc);
                    tr.appendChild(qty);
                    tr.appendChild(type);
                    tr.appendChild(pic);
                    
                    dbTotalPrice = dbTotalPrice + resp[i].price;
                }
                dbTotal.innerHTML = "Total price of search result: $" + dbTotalPrice;
            }
        });
    };    
    
    // returns the orders table
    function ordersDB(){
        ordersTable.style.display = "block";

        $.ajax({
            url:"/getOrders",
            type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
            success:function(resp){
                //loop through the select
                for(var i = 0; i<resp.length; i++){
                    var tr = ordersTable.insertRow();
                    var orderid = document.createElement("td");
                    var datetime = document.createElement("td");
                    var ordernum = document.createElement("td");
                    var totalprice = document.createElement("td");
                    var userid = document.createElement("td");

                    orderid.textContent = resp[i].orderid;
                    datetime.textContent = resp[i].datetime;
                    ordernum.textContent = resp[i].ordernum;
                    totalprice.textContent = resp[i].totalprice;
                    userid.textContent = resp[i].userid;

                    tr.appendChild(orderid);
                    tr.appendChild(datetime);
                    tr.appendChild(ordernum);
                    tr.appendChild(totalprice);
                    tr.appendChild(userid);
                    
                    ordersTotalPrice = ordersTotalPrice + resp[i].totalprice;
                }
                ordersTotal.innerHTML = "Total price of all orders: $" + ordersTotalPrice;
            }
        });
    };    
    
    // returns the items table
    function itemsDB(){
        itemsTable.style.display = "block";

        $.ajax({
            url:"/getItems",
            type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
            success:function(resp){
                //loop through the select
                for(var i = 0; i<resp.length; i++){
                    var tr = itemsTable.insertRow();
                    var orderid = document.createElement("td");
                    var itemname = document.createElement("td");
                    var datetime = document.createElement("td");
                    var itemqty = document.createElement("td");
                    var price = document.createElement("td");

                    orderid.textContent = resp[i].orderid;
                    itemname.textContent = resp[i].itemname;
                    datetime.textContent = resp[i].datetime;
                    itemqty.textContent = resp[i].itemqty;
                    price.textContent = resp[i].price;

                    tr.appendChild(orderid);
                    tr.appendChild(itemname);
                    tr.appendChild(datetime);
                    tr.appendChild(itemqty);
                    tr.appendChild(price);
                    
                    itemsTotalPrice = itemsTotalPrice + resp[i].price;
                }
                itemsTotal.innerHTML = "Total price of all items: $" + itemsTotalPrice;
            }
        });
    };
    
    // hides report tables
    function hideReports(){
        ordersTable.style.display = "none";
        itemsTable.style.display = "none";
    }
    
    function PreviousDaysSales(){
        
        $.ajax({
            url:"/SalesByDay",
            type:"post",
            success:function(resp){
                
            }
        })
    }
});