const express = require("express");
const router = express.Router();

const {
    addManager,
    getManagers,
    getManagersByLocation,
    deleteManager,
} = require("../controller/manager.controller");
const { validateManager } = require("../middleware/validation");

router.post("/", validateManager, addManager);
router.get("/", getManagers);
router.get("/location/:location", getManagersByLocation);
router.delete("/:id", deleteManager);

module.exports = router;
