const express = require("express");
const router = express.Router();

const {
  createReviewRequest,
    getReviewRequests,
    getReviewRequestById,
    updateReviewRequest,
    deleteReviewRequest,
} = require("../controllers/reviewManagement.controller");


router.post("/", createReviewRequest);

router.get("/", getReviewRequests);

router.get("/:id", getReviewRequestById);

router.put("/:id", updateReviewRequest);

router.delete("/:id", deleteReviewRequest);

module.exports = router;
