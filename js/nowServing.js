

$(document).ready(function(){
    
    $(function(){
        $("#homeLogo").click(function() {
            location.href = "/";
        });
    });
    
     $(function(){
        $("#login").click(function(){
            location.href = "/loginPage";
        });
    });
    
    $.ajax({
        url:"/xiEzMyEY6LAhMzQhYS0=",
        success:function(resp){
            if(resp.type){
                document.getElementById("login").style.display = "none";
                document.getElementById("logout").style.visibility = "visible";
            }
        }
    });
    
    document.getElementById("logout").addEventListener("click", function(){
        $.ajax({
            url:"/logout",
            type:"post",
            success:function(resp){
                location.reload();
                }
            })
    });
    
    var profile = document.getElementById("profile")
    profile.addEventListener("click", function(){
        location.href = "/profile";

    });
    
    document.getElementById("cart").addEventListener("click", function(){
        location.href = "/cart"
    });
    
    //START OF THE NOW SERVING JS CODE//
    
    $.ajax({
        url:"/xiEzMyEY6LAhMzQhYS0=",
        success:function(resp){
            document.getElementById("YOURORDER").innerHTML = "YOUR ORDER: " + resp.orderNum;
        }
    });

    initSockets();
    
});

//transfer all socket stuff into this function
function initSockets(){
    //connect to the io opened tunnel in the server
    var socket = io();
    socket.on("Order Status", function(obj){
        createReadyOrders(obj.nowServing);
        createToBeCooked(obj.kitchen);
    });

}

function createReadyOrders(obj){
    document.getElementById("orderReadyContainer").innerHTML = "Now Serving <br>";

    for(var i = 0; i<obj.length; i++){
        var ndiv = document.createElement("div");
        ndiv.innerHTML = obj[i];
        ndiv.className = "default";
        document.getElementById("orderReadyContainer").appendChild(ndiv);
        ndiv.ids = obj[i];
        
        ndiv.addEventListener("click", function(){
            $.ajax({
                url:"/checkorder",
                type:"post",
                data:{
                    order: this.ids
                },
                success:function(resp){
                    if(resp.status == "fail"){                        
                        console.log("Order not correct");
                        alert("that order is not yours fella");
                    } else if(resp.status == "success"){
                        var receipt = createRecepit(resp.rows);
                        alert("Enjoy Your Meal! \n\n " + receipt);
                        
                        location.href = "/";
                    }
                }
            });
        });
    };
}

function createToBeCooked(obj){
    document.getElementById("ordersPreparedContainer").innerHTML = "Orders Being Prepared <br>";

    for(var i=0; i<obj.length; i++){        
        var ndiv = document.createElement("div");
        ndiv.innerHTML = obj[i];
        ndiv.className = "default";
        document.getElementById("ordersPreparedContainer").appendChild(ndiv);
    }
}

function createRecepit(obj){
    var complete = "RECEPIT\n ====================\n";
    var totalPrice = 0;
    
    for(var i = 0; i<obj.length; i++){
        var rowPrice = obj[i].qty * obj[i].price
        var row = i+1 + ")  " + obj[i].itemname + " x " + obj[i].qty + "......" + rowPrice + "\n";
        
        complete += row;
        totalPrice += rowPrice;
    };
    complete += "\n TOTAL PRICE = $" + totalPrice + "\n ====================";
    return complete;
}

