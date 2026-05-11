const express = require('express');
const router = express.Router();
const {
    getAllFreelistings,
    createFreelisting,
    deleteFreelisting,
    deleteAllFreelistings
} = require('../controllers/Freelisting.controller');

//  GET /api/freelistings - Get all freelistings
router.get('/', getAllFreelistings);

//  POST /api/freelistings - Create a new freelisting
router.post('/', createFreelisting);

// DELETE /api/freelistings/:id - Delete a freelisting
router.delete('/:id', deleteFreelisting);

// DELETE /api/freelistings - Delete all freelistings
router.delete('/', deleteAllFreelistings);

module.exports = router;