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

/******************
 * Build Management View
 ******************/
invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classificationSelect,
    })
}

/*****************
 * Build Add Classification View
 *****************/
invCont.buildAddClassView = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    })
}

/****************
 * Build Add Vehicle View
 ****************/
invCont.buildAddVehicleView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/add-vehicle", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classificationSelect,
    })
}

/***********************
 * Add new Class
 ***********************/
invCont.addNewClass = async function (req, res) {
    try {
        let nav = await utilities.getNav()
        const { classification_name } = req.body
        console.log(classification_name);
        const newClassResults = await invModel.addNewClass(
            classification_name
        )
    
        if (newClassResults) {
            req.flash("notice", "You've added a new Classification!")
            const classificationSelect = await utilities.buildClassificationList()
            res.status(201).render("./inventory/management", {
                title: "Vehicle Management",
                nav,
                errors: null,
                classificationSelect,
            })
        } else {
            req.flash("notice", "A new classification was failed to be added.")
            res.status(201).render("./inventory/add-classification", {
                title: "Add New Classification",
                nav,
                errors: null,
            })
        }

    } catch (err) {
        console.error("Error in addNewClass:", err);
        res.status(500).send("Server Error");
    }
}

/***********************
 * Add new Vehicle
 ***********************/
invCont.addNewVehicle = async function (req, res) {
    let nav = await utilities.getNav()
    const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body

    const newVehicleResults = await invModel.addNewVehicle(
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    )

    if (newVehicleResults) {
        req.flash("notice", "You've added a new Vehicle!")
        const classificationSelect = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
            classificationSelect,
        })
    } else {
        req.flash("notice", "A new vehicle was failed to be added.")
        const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
        res.status(201).render("./inventory/add-vehicle", {
            title: "Add New Vehicle",
            nav,
            errors: null,
            classificationSelect,
        })
    }
}

/********************
 * Return Inventory by classification as JSON
 ********************/
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/****************
 * Build Edit Inventory View
 ****************/
invCont.inventoryEditingView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.params.inv_id)
    const itemData = await invModel.getDetailsByInvId(inv_id)
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
        title: "Edit" + itemName,
        nav,
        classificationSelect,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
    })
}







module.exports = invCont