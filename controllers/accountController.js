// Required
const utilities = require('../utilities')
const accountModel = require('../models/account-model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const session = require('express-session')
require("dotenv").config()


/*******************
 * Deliver login View
 ********************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/*******************
 * Deliver registration view
 *******************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/********************
 * Process Registration
 ********************/
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    //Hash the password before storing
    let hashedPassword
    try {
        //regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error proccessing the registration.')
        req.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }


    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Register",
            nav,
        })
    }
}

/*****************
 * Process Login Request
 *****************/
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            // if (process.env.NODE_ENV === 'development') {
            // } else {
            //     res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            // }
            res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            req.session.account = {
                account_id: accountData.account_id,
                account_firstname: accountData.account_firstname,
                account_lastname: accountData.account_lastname,
                account_email: accountData.account_email,
                account_type: accountData.account_type,
    }
            req.session.loggedin = true
            console.log("The cookie was created.")
            return res.redirect("/account/")
        }
        else {
                req.flash("message notice", "Please check your credentials and try again.")
                res.status(400).render("account/login", {
                    title: "Login",
                    nav,
                    errors: null,
                    account_email,
                })
        }
        } catch (error) {
            throw new Error('Access Forbidden')
        }
}
    
/********************
 * Deliver Management view
 */
async function buildAccountManage(req, res, next) {
    let nav = await utilities.getNav()
    const account_id = parseInt(req.params.account_id)
    console.log("Account ID from session:", req.params.account_id)
    if (!req.session.account) {
  return res.redirect("/account/login"); // or wherever your login page is
}
    res.render("./account/accountManagement", {
        session: req.session,
        title: "Account Management",
        nav,
        errors: null,
        account_id: req.session.account.account_id,
        accountType: req.session.account.account_type,
        userName: req.session.account.account_firstname,
    })
}

/********************
 * Deliver Account Update View
 ********************/
async function buildAccountUpdate(req, res, next) {
    const account_id = parseInt(req.params.account_id)
    let nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/updateAccount", {
        title: "Update Account",
        nav,
        errors: null,
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email
    })
}

/********************
 * Process Account Update
 ********************/
async function updateAccount(req, res) {
    let nav = await utilities.getNav()
    const account_id = parseInt(req.body.account_id)
    const { account_firstname, account_lastname, account_email } = req.body

    // //Hash the password before storing
    // let hashedPassword
    // try {
    //     //regular password and cost (salt is generated automatically)
    //     hashedPassword = await bcrypt.hashSync(account_password, 10)
    // } catch (error) {
    //     req.flash("notice", 'Sorry, there was an error proccessing the registration.')
    //     req.status(500).render("account/register", {
    //         title: "Registration",
    //         nav,
    //         errors: null,
    //     })
    // }

    console.log("Updating account with:", account_id, account_firstname, account_lastname, account_email);
    const updateResult = await accountModel.updateAccount( //create this function in account model
        account_firstname,
        account_lastname,
        account_email,
        account_id
    )
    console.log("Update result:", updateResult);


    if (updateResult) {
        req.session.account.account_firstname = account_firstname;
        req.session.account.account_lastname = account_lastname;
        req.session.account.account_email = account_email;
        
        req.flash(
            "notice",
            `Congratulations, ${account_firstname} you've successfully updated your account.`
        )
        res.status(201).render("account/accountManagement", {
            session: req.session,
            title: "Account Management",
            nav,
            account_id: req.session.account.account_id,
            accountType: req.session.account.account_type,
            userName: req.session.account.account_firstname,
        })
    } else {
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("account/updateAccount", {
            title: "Update Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id

        })
    }
}

/********************
 * Process Password Change
 ********************/
async function changePassword(req, res) {
    let nav = await utilities.getNav()
    const { account_password } = req.body

    //Hash the password before storing
    let newHashedPassword
    try {
        //regular password and cost (salt is generated automatically)
        newHashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error proccessing the password update.')
        req.status(500).render("account/updateAccount", {
            title: "Update Account",
            nav,
            errors: null,
            account_id: req.session.account.account_id,
            account_firstname: req.session.account.account_firstname,
            account_lastname: req.session.account.account_lastname,
            account_email: req.session.account.account_email
        })
    }

    const account_id = req.session.account.account_id
    const changeResult = await accountModel.changePassword( //create this function in account model
        newHashedPassword,
        account_id
    )

    if (changeResult) {
        req.flash(
            "notice",
            `Congratulations, you've successfully changed your password.`
        )
        res.status(201).render("account/accountManagement", {
            title: "Account Management",
            nav,
            session: req.session,
            accountType: req.session.account.account_type,
            userName: req.session.account.account_firstname,
        })
    } else {
        req.flash("notice", "Sorry, the password change failed.")
        res.status(501).render("account/updateAccount", {
            title: "Update Account",
            nav,
            errors: null,
            session: req.session,
            account_id: req.session.account.account_id,
            account_firstname: req.session.account.account_firstname,
            account_lastname: req.session.account.account_lastname,
            account_email: req.session.account.account_email

        })
    }
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManage, buildAccountUpdate, updateAccount, changePassword}