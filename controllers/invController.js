const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/**********************
 * Build inventory by classification view
 ***********************/
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/******************
 * Build vehicles pages
 ******************/
invCont.buildByInvId = async function (req, res, next) {
    // console.log("buildByInvId triggered");
    const inv_id = req.params.inv_id
    let vehicleData = await invModel.getDetailsByInvId(inv_id)
    // console.log(Array.isArray(vehicleData))
    const card = await utilities.buildDetailsCard(vehicleData)
    let nav = await utilities.getNav()
    const vehicleName = vehicleData.inv_year + ' ' + vehicleData.inv_make + ' ' + vehicleData.inv_model
    res.render("./inventory/details", {
        title: vehicleName,
        nav,
        card,
    })
}

module.exports = invCont