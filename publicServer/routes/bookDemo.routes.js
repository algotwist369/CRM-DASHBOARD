const express = require("express");
const router = express.Router();
const {
    createBookDemo,
    getAllBookDemos,
    getBookDemoById,
    deleteBookDemo,
    updateBookDemoStatus,
} = require("../controllers/bookDemo.controller");

router.post("/", createBookDemo);

router.get("/", getAllBookDemos);

router.get("/:id", getBookDemoById);

router.put("/:id", updateBookDemoStatus);

router.delete("/:id", deleteBookDemo);

module.exports = router;
