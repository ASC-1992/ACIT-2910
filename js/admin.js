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
    var viewSalesByDay = document.getElementById("viewDaySales");
    
    // Second level div
    var result = document.getElementById("result");
        
    // Third level tables
    var tableInfo = document.getElementById("tableInfo");
    var reportInfo = document.getElementById("reportInfo");
    
    // Search item in database buttons
    var searchDB = document.getElementById("find");
    var changeDB = document.getElementById("changeDB");
    
    // Filter report buttons
    var main = document.getElementById("main");
    var sides = document.getElementById("sides");
    var dessert = document.getElementById("dessert");
    var beverage = document.getElementById("beverage");
    
    // Total amounts integers
    var dbTotalPrice = 0;
    var revenueTotalPrice = 0;
    
    var mainPrice = 0;
    var sidePrice = 0;
    var dessPrice = 0;
    var bevPrice = 0;
    
    // Total amounts divs
    var dbTotal = document.getElementById("dbTotal");
    var revenueTotal = document.getElementById("revenueTotal");
    
    // used to calculate how much quantity was sold - 100 of each item for now
    var startQty = 100;
    
    // Store Status
    $(function(){
        $("#open").click(function() {                  
            $.ajax({
                url:"/weAreOpen",
                type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                success:function(resp){
                    if(resp.status == "success"){
                        alert("ROLLOUT");
                        theStatus.innerHTML = "Open!";
                        theStatus.style.color = "green";
                    } else {
                        alert("Couldn't reset data");
                    }
                }
            });
        });
    });    
    
    $(function(){
        $("#close").click(function() {   
            $.ajax({
                url:"/weAreClosed",
                type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                success:function(resp){
                    if(resp.status == "success"){
                        alert("CLOSED SHOP");
                        theStatus.innerHTML = "Closed!";
                        theStatus.style.color = "red";
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
            clearScreen();
            dbTotal.innerHTML = "";
            $("#tableInfo td").remove(); 
            
            menuText.innerHTML = "SEARCH MENU";
            viewSearch.style.display = "inline";
            result.appendChild(viewSearch);
            searchDB.style.backgroundColor = "yellow";
        });
    });
    
    // First Level Green Add Button
    $(function(){
        $("#add").click(function() {
            clearScreen();
            tableInfo.style.display = "none";
            
            menuText.innerHTML = "ADD MENU";
            addMenu.style.display = "inline";
            result.appendChild(addMenu);
        });
    });
    
    // First Level Red Edit Button
    $(function(){
        $("#edit").click(function() {
            clearScreen();
            $("#tableInfo td").remove(); 
            
            menuText.innerHTML = "EDIT MENU";
            editSearch.style.display = "inline";
            result.appendChild(editSearch);
            searchDB.style.backgroundColor = "red";
        });
    });    
    
    // First Level View Reports Button
    $(function(){
        $("#report").click(function() {
            clearScreen();
            $("#reportInfo td").remove(); 
            revenueTotalPrice = 0;
            tableInfo.style.display = "none";
            
            viewReport.style.display = "inline";
            result.appendChild(viewReport);
            soldItems();
            menuText.innerHTML = "VIEW REPORTS";
        });
    });
    
    // First Level Sales By Day Buttton
    document.getElementById("salesByDay").addEventListener("click", function(){
        clearScreen();
        
        viewSalesByDay.style.display = "inherit";
        result.appendChild(viewSalesByDay);
        daysSales();
        menuText.innerHTML = "SALES BY DAY";
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
    
    // Second Level Filter Report Buttons
    $(function() {    
        $("#main").click(function() {
            $('#reportInfo tr:contains("main")').show();
            $('#reportInfo tr:not(:contains("main"))').hide();
            document.getElementById("head").style.display = "table-row";
            revenueTotal.innerHTML = "Earned revenue for MAIN: $" + mainPrice;
        });
    });
    
    $(function(){
        $("#sides").click(function() {
            $('#reportInfo tr:contains("sides")').show();
            $('#reportInfo tr:not(:contains("sides"))').hide();
            document.getElementById("head").style.display = "table-row";  
            revenueTotal.innerHTML = "Earned revenue for SIDES: $" + sidePrice;
        });
    });    
    
    $(function(){
        $("#dessert").click(function() {
            $('#reportInfo tr:contains("dessert")').show();
            $('#reportInfo tr:not(:contains("dessert"))').hide();
            document.getElementById("head").style.display = "table-row"; 
            revenueTotal.innerHTML = "Earned revenue for DESSERTS: $" + dessPrice;
        });
    });    
    
    $(function(){
        $("#beverage").click(function() {
            $('#reportInfo tr:contains("beverage")').show();
            $('#reportInfo tr:not(:contains("beverage"))').hide();
            document.getElementById("head").style.display = "table-row";
            revenueTotal.innerHTML = "Earned revenue for BEVERAGES: $" + bevPrice;
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
    
    // searches the inventory table and returns items with the inputted name value
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
    
    // searches the inventory table and returns items where quantity is less than start
    function soldItems(){
        reportInfo.style.display = "block";

        $.ajax({
            url:"/getSold",
            type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
            success:function(resp){
                //loop through the select
                for(var i = 0; i<resp.length; i++){
                    var tr = reportInfo.insertRow();
                    var name = document.createElement("td");
                    var price = document.createElement("td");
                    var qty = document.createElement("td");
                    var type = document.createElement("td");
                    var revenue = document.createElement("td");
                    
                    var soldQty = startQty - resp[i].qty;
                    var revenueEarned = soldQty * resp[i].price;
                    
                    name.textContent = resp[i].itemname;
                    price.textContent = resp[i].price;
                    qty.textContent = soldQty;
                    type.textContent = resp[i].type;
                    revenue.textContent = "$" + revenueEarned;

                    tr.appendChild(name);
                    tr.appendChild(price);
                    tr.appendChild(qty);
                    tr.appendChild(type);
                    tr.appendChild(revenue);
                    
                    if(resp[i].type == "main"){
                        mainPrice += revenueEarned;
                    } else if(resp[i].type == "sides") {
                        sidePrice += revenueEarned;
                    } else if(resp[i].type == "dessert") {
                        dessPrice += revenueEarned;
                    } else if(resp[i].type == "beverage") {
                        bevPrice += revenueEarned;
                    }
                    
                    revenueTotalPrice = revenueTotalPrice + revenueEarned;
                }
                revenueTotal.innerHTML = "Total price of earned revenue: $" + revenueTotalPrice;
            }
        });
    }; 
    
    // clears the divs to display the correct information
    function clearScreen() {
        result.innerHTML = "";
        reportInfo.style.display = "none";
    }
    
    function daysSales(){
        var x = [];
        var y = [];
         
        $.ajax({
            url:"/SalesByDay",
            type:"post",
            success:function(resp){
                for(var i=0; i<resp.length; i++){
                    var date = resp[i].date;
                    var dateShortened = date.substring(0,10);
                    x.push(dateShortened);
                    y.push(resp[i].total);
                }
                var traces = [
                    {
                        x: x,
                        y: y,
                        type: 'bar'
                    }
                    ];

                Plotly.newPlot('viewDaySales', traces, {title: "Sales By Day"});
                
            }
        });

    }
});