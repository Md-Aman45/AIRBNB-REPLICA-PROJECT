const User = require("../models/user.js");

// Render Form for Signup...
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};


// For Signup...
module.exports.signup = async(req, res) => {
    try {
     let { username, email, password } = req.body;
     const newUser = new User({ email, username });
     const registeredUser = await User.register(newUser, password);
     console.log(registeredUser);
     req.login(registeredUser, (err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Welcome to Wonderlust!");
        res.redirect("/listings");
     })
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};


// Render Form for Login...
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};


// For Login...
module.exports.login = async(req, res) => {
    req.flash("success", "Welcome back to Wonderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};


// For Logout...
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
           return next(err);
        }
        req.flash("success", "you are logged out now!");
        res.redirect("/listings");
    });
};