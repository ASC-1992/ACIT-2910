const webpack = require("webpack");
const path = require("path");

var sF = path.resolve(__dirname, "js");
var bF = path.resolve(__dirname, "build");

var config = {
    entry: {
        "home":sF+"/home.js",
        "menu":sF+"/menu.js",
        "login":sF+"/login.js",
        "profile":sF+"/profile.js",
        "kitchen": sF+"/kitchen.js",
        "cart":sF+"/cart.js",
        "faq":sF+"/faq.js",     
        "admin":sF+"/admin.js",
        "ns":sF+"/nowServing.js"
    },
    output:{
        filename:"[name]bundle.js",
        path:bF
    },
    plugins:[
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery"
        })
    ]
};

module.exports = config;