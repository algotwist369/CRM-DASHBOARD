const express = require("express");
const router = express.Router();

const { 
    syncLeads, 
    getLeads, 
    getLeadStats, 
    getLeadsDelivery,
    getLeadDeliveryById,
    getQueueStatus,
    getQueueJobs,
    getFailedLeads,
    retryLead,
    bulkRetryLeads
} = require("../controller/lead.controller");

router.post("/sync", syncLeads);
router.get("/", getLeads);
router.get("/stats", getLeadStats);
router.get("/delivery", getLeadsDelivery); // Kitne managers ko send hua
router.get("/failed", getFailedLeads); // Failed/unsent leads
router.get("/queue/status", getQueueStatus); // Queue status
router.get("/queue/jobs", getQueueJobs); // Queue jobs
router.post("/:id/retry", retryLead); // Retry specific lead
router.post("/bulk-retry", bulkRetryLeads); // Bulk retry multiple leads
router.get("/:id/delivery", getLeadDeliveryById); // Specific lead ka delivery details

module.exports = router;
