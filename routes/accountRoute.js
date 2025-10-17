//Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

//Route to My Account link
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route to registration
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//Route to Account Management
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManage))

//Route to post the registration
router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

// Proccess the logout attempt
router.post("/logout", (req, res) => {
    req.flash("notice", "You have been logged out.")
    req.session.loggedin = false
    res.clearCookie("jwt")
    res.status(200).redirect("/")
})

// Route to Account change page
router.get("/updateAccount/:account_id", utilities.handleErrors(accountController.buildAccountUpdate))

//Process the update
router.post(
    "/updateAccount",
    regValidate.updateRules(),
    utilities.handleErrors(accountController.updateAccount)
)

//Process the passowrd change
router.post(
    "/changePassword",
    regValidate.passwordRules(),
    utilities.handleErrors(accountController.changePassword)
)

module.exports = router;