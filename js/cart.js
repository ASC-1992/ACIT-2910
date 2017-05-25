$(document).ready(function(){
    var totalprice = 0;
    
    
                            /* START OF HEADER JAVASCRIPT */
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
    
    $(function(){
        $("#support").click(function() {
            location.href = "/FAQ";
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
        location.href = "/cart";
    });
    
                            /* START OF CART.JS JAVASCRIPT */
    
    $.ajax({
        url:"/myCart",
        type:"post",
        
        success:function(resp){
            for(var i = 0; i<resp.length; i++){
                
                var rowPrice = 0;
                var rowPrice = resp[i].itemqty * resp[i].price
                var ndiv = document.createElement("div");
                ndiv.className = "itemsContainer";
                var closeBut = document.createElement("button");
                closeBut.className = "closeBut";
                closeBut.innerHTML = "X";
                closeBut.id = "cb" + i;
                ndiv.appendChild(closeBut);
                var infoDiv = document.createElement("div");
                infoDiv.className = "info";
                infoDiv.innerHTML = resp[i].itemname + ": Quantity " + resp[i].itemqty + " = $" + rowPrice;
                ndiv.appendChild(infoDiv);
                var foodpic = document.createElement("img");
                foodpic.className = "foodPic";
                var string = resp[i].itemname.split(" ").join("");
                foodpic.src = "/fp/" + string + ".jpg";
                ndiv.appendChild(foodpic);
                
                totalprice += rowPrice;
                
                closeBut.titlename = resp[i].itemname;
                
                closeBut.addEventListener("click", function(){
                    removeItem(this.titlename)
                })
                
                document.getElementById("orderContainer").appendChild(ndiv)

            }
            document.getElementById("totalPrice").innerHTML = "Total Price: $" + totalprice;
        }
            
        
    });
    
    document.getElementById("checkoutBut").addEventListener("click", function(){
        $.ajax({
            url:"/checkout",
            type:"post",

            success:function(resp){
                if(resp.status == "success"){
                    alert("THANK YOU FOR YOUR PURCHASE");
                    location.href = "/NowServing"
                }
            }
        });
    });

    var hits = 0;

    $(".toggle-icon").click(function() {
      $('#nav-container').toggleClass("pushed");
        document.getElementById("secretButton").style.visibility = "visible";
        if  (hits % 2 !== 0){ //for hits 2,4,6,8 etc.
            document.getElementById("secretButton").style.visibility = "hidden";
        }
        else{ // for hits 1,3,5,7
            document.getElementById("secretButton").style.visibility = "visible";
        }
        hits++;
    });
    
    document.getElementById("muteBut").addEventListener("click", function(){
        document.getElementById("musicBox").innerHTML = "";
    });
    
    
});

function removeItem(itemname){
    console.log(itemname);
    $.ajax({
        url:"/removeCartItem",
        type:"post",
        data:{
            itemName: itemname
        },

        success:function(resp){
            if(resp.status == "success"){
                location.reload();
            } else if(resp.status == "fail"){
                alert("Alex, that did not work as intended")
            }
        }
    })
}

