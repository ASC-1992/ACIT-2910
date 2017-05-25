const $ = require('jquery');

//test function 1
function loginFunction(){
    return "/loginPage";
}

//test function 2
function numTest(){
    return 5;
}

$(document).ready(function(){
    $(function(){
        $("#homeLogo").click(function() {
            location.href = "/";
        });
    });
    
    $(function(){
        $("#support").click(function() {
            location.href = "/FAQ";
        });
    });
    
    $(function(){
        $("#menuScroller").click(function(){  
            /* DONT DELETE THESE COMMENTS */
            $.ajax({
                url:"/openOrClosed",
                type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                success:function(resp){
                    if (resp.theStatus == true) {
                        location.href = "/menu";
                    } else if (resp.theStatus == false) {
                        alert("Sorry, we're currently closed");
                    } else {
                        alert("Couldn't read store status variable");
                    }
                }
            });
        });
    });
    
    $(function(){
        $(".spImage").click(function() {
            /* DONT DELETE THESE COMMENTS */
            $.ajax({
                url:"/openOrClosed",
                type:"post", //"post" is behind the scenes (invisible) versus "get" (hijackable)
                success:function(resp){
                    if (resp.theStatus == true) {
                        location.href = "/menu";
                    } else if (resp.theStatus == false) {
                        alert("Sorry, we're currently closed");
                    } else {
                       alert("Couldn't read store status variable");
                    }
                }
            });
        });
    
    var login = document.getElementById("login")
    login.addEventListener("click", function(){
        location.href = loginFunction();
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

});
module.exports.numTest = numTest;
module.exports.login = loginFunction;
