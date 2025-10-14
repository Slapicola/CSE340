/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const cookieParser= require("cookie-parser")

/*************************
 * Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: { secure: false}
}))

// express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) //for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(utilities.checkJWTToken)

// app.use(utilities.loggedIn)






/* ***********************
 * View Engine and Templates
 *************************/
const path = require('path');

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
app.set('views', path.join(__dirname, 'views/layouts'));

// Keep messing with this
// app.use((req, res, next) => {
//   res.locals.loggedin = req.session.loggedin || false
//   next()
// })


/* ***********************
 * Routes
 *************************/
app.use(static)
//Index Route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", inventoryRoute)
// Account routes
app.use("/account", accountRoute)

// File Not Found Rout - must be last route in the list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Whoops, it seems you've went off-road!" })
})
/***************************
 * Express Error Handler
 * Place after all other ware
 ***************************/
app.use(async (error, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${error.message}`)
  if(error.status == 404){ message = error.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'} 
  res.render("errors/error", {
    title: error.status || 'Server Error',
    message,
    nav
  })
})




/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT 
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.get('/', (req, res) => {
  res.send('Your web service is up and running!');
});
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
