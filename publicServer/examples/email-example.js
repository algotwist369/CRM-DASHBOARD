/**
 * EMAIL SENDING USAGE EXAMPLES
 * 
 * This file shows how to use the sendMail utility in your controllers
 */

const { 
    sendEmail, 
    sendOtpEmail, 
    sendWelcomeEmail, 
    sendNotificationEmail,
    sendEmailWithAttachments,
    sendTestEmail,
    verifyConnection
} = require("../utils/sendMail");

// ============================================
// EXAMPLE 1: Basic Email
// ============================================
async function exampleBasicEmail() {
    try {
        const result = await sendEmail({
            to: "user@example.com",
            subject: "Test Email",
            text: "This is a test email",
            html: "<p>This is a <strong>test</strong> email</p>"
        });
        console.log("Email sent:", result);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// ============================================
// EXAMPLE 2: Send OTP Email
// ============================================
async function exampleSendOtp() {
    try {
        await sendOtpEmail("user@example.com", "123456", "My Business");
        console.log("OTP email sent successfully");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// ============================================
// EXAMPLE 3: Send Welcome Email
// ============================================
async function exampleWelcomeEmail() {
    try {
        await sendWelcomeEmail("newuser@example.com", "John Doe");
        console.log("Welcome email sent");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// ============================================
// EXAMPLE 4: Send Notification Email
// ============================================
async function exampleNotificationEmail() {
    try {
        await sendNotificationEmail(
            "admin@example.com",
            "New Lead Received",
            "A new advertising lead has been submitted.",
            "http://localhost:3000/admin/leads/123",
            "View Lead"
        );
        console.log("Notification email sent");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// ============================================
// EXAMPLE 5: Email with Attachments
// ============================================
async function exampleEmailWithAttachments() {
    try {
        await sendEmailWithAttachments(
            "user@example.com",
            "Report Attached",
            "Please find the report attached.",
            "<p>Please find the report attached.</p>",
            [
                {
                    filename: "report.pdf",
                    path: "./uploads/documents/report.pdf"
                }
            ]
        );
        console.log("Email with attachment sent");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// ============================================
// EXAMPLE 6: Verify SMTP Connection
// ============================================
async function exampleVerifyConnection() {
    const result = await verifyConnection();
    if (result.success) {
        console.log("✅ SMTP connection verified");
    } else {
        console.log("❌ SMTP verification failed:", result.message);
    }
}

// ============================================
// EXAMPLE 7: Send Test Email
// ============================================
async function exampleTestEmail() {
    try {
        await sendTestEmail("test@example.com");
        console.log("Test email sent");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// ============================================
// EXAMPLE 8: Use in Controller (Free Listing)
// ============================================
/*
const { sendNotificationEmail } = require("../utils/sendMail");

exports.createFreeListing = async (req, res) => {
    try {
        const entry = await FreeListing.create(req.body);
        
        // Send notification email to admin
        try {
            await sendNotificationEmail(
                process.env.ADMIN_EMAIL,
                "New Free Listing Created",
                `A new free listing has been created: ${entry.businessName}`,
                `${process.env.FRONTEND_URL}/listings/${entry._id}`
            );
        } catch (emailError) {
            console.error("Failed to send notification email:", emailError);
            // Don't fail the request if email fails
        }
        
        res.status(201).json({
            success: true,
            message: "Free listing created successfully",
            data: entry,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create listing",
        });
    }
};
*/

// ============================================
// EXAMPLE 9: Use in Controller (Book Demo)
// ============================================
/*
const { sendNotificationEmail } = require("../utils/sendMail");

exports.createBookDemo = async (req, res) => {
    try {
        const validatedData = bookDemoSchema.parse(req.body);
        const newEntry = await BookDemo.create(validatedData);
        
        // Send confirmation email to user
        try {
            await sendNotificationEmail(
                validatedData.email,
                "Demo Request Received",
                `Hello ${validatedData.fullName}, we have received your demo request for ${validatedData.businessName}. We will contact you soon.`
            );
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
        }
        
        // Send notification to admin
        try {
            await sendNotificationEmail(
                process.env.ADMIN_EMAIL,
                "New Demo Request",
                `A new demo request has been submitted by ${validatedData.fullName} from ${validatedData.businessName}.`
            );
        } catch (emailError) {
            console.error("Failed to send admin notification:", emailError);
        }
        
        return res.status(201).json({
            success: true,
            message: "Book demo request submitted successfully",
            data: newEntry,
        });
    } catch (error) {
        // ... error handling
    }
};
*/

module.exports = {
    exampleBasicEmail,
    exampleSendOtp,
    exampleWelcomeEmail,
    exampleNotificationEmail,
    exampleEmailWithAttachments,
    exampleVerifyConnection,
    exampleTestEmail
};

