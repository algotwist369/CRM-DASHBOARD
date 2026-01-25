// Debug script to check manager visibility issue
// Run this in MongoDB shell or using a test endpoint

// Manager Info from user:
const managerId = "696ddf22035598bc6165e939";
const businessId = "69523543025ac3c144626069";
const managerName = "Testing manager";

// Step 1: Check the Business document
db.businesses.findOne({ _id: ObjectId("69523543025ac3c144626069") }, {
    branch: 1,
    name: 1,
    managers: 1,
    isActive: 1
});

// Expected output should show:
// - branch: "Vashi" (or whatever the branch name is)
// - managers: [ObjectId("696ddf22035598bc6165e939")] (should include this manager)

// Step 2: Check if manager ID is in the managers array
db.businesses.findOne({
    _id: ObjectId("69523543025ac3c144626069"),
    managers: ObjectId("696ddf22035598bc6165e939")
});

// Step 3: Find all businesses with branch "Vashi"  
db.businesses.find({ branch: "Vashi", isActive: true }, { branch: 1, name: 1, managers: 1 });

// ISSUE DIAGNOSIS:
// The manager document has a `business` field pointing to the business
// But the business might not have this manager in its `managers` array
// This is a two-way relationship that needs to be synchronized

// SOLUTION:
// Need to add the manager's ObjectId to the business's managers array
// OR change the query logic to find managers by their business field instead
