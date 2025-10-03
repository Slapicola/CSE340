const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
// const InvModel = require("../models/inventory-model")

/********************
 * Classification form validation rules
 ********************/
validate.classRules = () => {
    return [
        //classification is required and must be a string
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .isAlpha()
            .withMessage("Please provide a classification name."),
    ]
}

/**********************
 * Check data and return errors or continue to management view
 **********************/
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors: errors.array(),
            title: "Add New Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

/********************
 * Vehicle form validation rules
 ********************/
validate.vehicleRules = () => {
    return [
        //classification is required and must be a string
        body("classification_name")
            .trim()
            .escape()
            .notEmpty().withMessage("Please select a classification name."),
        
        //make is required and must be a string
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .isAlpha()
            .withMessage("Please provide a vehicle make."),
        
        //model is required and must be a string
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .isAlpha()
            .withMessage("Please provide a vehicle model."),
        
        //description is required and must be text
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a description."),
        
        //image path is required and must be a string
        body("inv_image")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .isAlpha()
            .withMessage("Please provide an image path."),
        
        //thumbnail path is required and must be a string
        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .isAlpha()
            .withMessage("Please provide a thumbnail path."),
        
        //price is required and must be an integer
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isInt()
            .isLength({ min: 3 })
            .withMessage("Please provide a price."),
        
        //year is required and must be an integer
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isInt()
            .isLength({ min: 4 })
            .withMessage("Please provide a year."),
        
        //miles is required and must be digits only
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isInt()
            .isLength({ min: 1 })
            .withMessage("Please provide a miles count."),
        
        //color is required and must be a string
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .isAlpha()
            .withMessage("Please provide a color."),
    ]
}

/**********************
 * Check data and return errors or continue to management view
 **********************/
validate.checkVehicleData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
    const errors = validationResult(req)
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-vehicle", {
            errors: errors.array(),
            title: "Add New Vehicle",
            nav,
            classificationSelect,
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}

module.exports = validate