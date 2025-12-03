const express = require("express");
const router = express.Router();

const {
    createAdvertise,
    getAllAdvertise,
    getAdvertiseById,
    updateAdvertise,
    deleteAdvertise,
} = require("../controllers/advertise.controller");

router.post("/", createAdvertise);

router.get("/", getAllAdvertise);

router.get("/:id", getAdvertiseById);

router.put("/:id", updateAdvertise);

router.delete("/:id", deleteAdvertise);

module.exports = router;
