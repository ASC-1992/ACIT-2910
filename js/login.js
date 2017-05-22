$(document).ready(function(){
    
    document.getElementById("homeLogo").addEventListener("click", function(){
        location.href = "/"
    });
    
    $(function(){
        $("#support").click(function() {
            location.href = "/FAQ";
        });
    });
    
    var profile = document.getElementById("profile")
    profile.addEventListener("click", function(){
        location.href = "/profile";
    });
    
    document.getElementById("loginBut").addEventListener("click", function(){
       $.ajax({
           url:"/login",
           type:"post",
           data:{
             email: document.getElementById("email").value,
             password: document.getElementById("pass").value
           },
           success:function(resp){
               if(resp.status == "success"){
                   console.log("logged in");
                   if(resp.type == "customer"){
                       location.href = "/menu";
                   } else {
                       location.href = "/profile";
                   }
               } else {
                   console.log("cant log in");
                   alert("Sorry, that email/password combination doesn't exist")
               }
           }
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
    
    document.getElementById("cart").addEventListener("click", function(){
        location.href = "/cart"
    });
    
    document.getElementById("registerBut").addEventListener("click", function(){
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("regBox").style.display = "inline-block";
        document.getElementById("verticalBox").style.height = "75vh";
    });    
    
    document.getElementById("showLoginBut").addEventListener("click", function(){
        document.getElementById("regBox").style.display = "none";
        document.getElementById("loginBox").style.display = "inline-block";
        document.getElementById("verticalBox").style.height = "60vh";
        
    });
    
                            /* REGISTRATION PORTION */
    //REGEX
    
    var regEx = /^([-@./#&+\w\s]){1,40}$/
    var emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    
    
    
    document.getElementById("submitBut").addEventListener("click", function(){
        var email = document.getElementById("emailReg").value;
        var pass = document.getElementById("passReg").value;
        var gender = document.getElementById("genderSelect").value;
        var location = document.getElementById("planetSelect").value;
        
        if((regEx.test(pass) == true) && (regEx.test(gender) == true) && (regEx.test(location)== true) && (emailRegEx.test(email) == true)){

            $.ajax({
                url:"/register",
               type:"post",
               data:{
                   email: email,
                   password: pass,
                   gender: gender,
                   location: location
               },
               success:function(resp){
                   if(resp.status == "success"){
                        console.log("register complete")
                        document.getElementById("regBox").style.display = "none";
                        document.getElementById("loginBox").style.display = "inline-block";
                   } else if(resp.status == "fail"){
                       alert("Email is already in use");
                   }
               }
            });
        } else {
            alert("Please Check your information provided");
        }
    });
});