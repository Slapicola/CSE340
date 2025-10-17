// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require('../utilities/inventory-validation')
const InvModel = require("../models/inventory-model")
const validate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//Route to build seperate vehicle details
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));

//Route to build management views
router.get("/", utilities.accountTypeCheck, utilities.handleErrors(invController.buildManagementView));

//Route to build Add Class View
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassView));

//Route to build Add Vehicle View
router.get("/add-vehicle", utilities.handleErrors(invController.buildAddVehicleView));

//Route to post the new class
router.post('/add-classification',
    invValidate.classRules(),
    invValidate.checkClassData,
    utilities.handleErrors(invController.addNewClass));

//Route to post the new Vehicle
router.post('/add-vehicle',
    invValidate.vehicleRules(),
    invValidate.checkVehicleData,
    utilities.handleErrors(invController.addNewVehicle))

//Route to do something with inventory
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

//Route to view that modifies data
router.get("/edit/:inv_id", utilities.handleErrors(invController.inventoryEditingView));

//Route to post the updated inventory form
router.post("/edit-inventory/",
    invValidate.newVehicleRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateVehicle));

//Route to view that confirms deletion of data
router.get("/delete/:inv_id", utilities.handleErrors(invController.inventoryDeleteView));

//Route to view that confirms deletion of classification
router.get("/delete-class/", utilities.handleErrors(invController.classDeleteView));

//Route to post the delete inventory form
router.post("/delete-confirm/",
    // invValidate.newVehicleRules(),
    // invValidate.checkUpdateData,
    utilities.handleErrors(invController.deleteVehicle));

//Route to post the delete class form
router.post("/delete-class/",
    validate.deleteClassRules(),
    validate.checkDeleteData,
    utilities.handleErrors(invController.deleteClass)
)

module.exports = router;