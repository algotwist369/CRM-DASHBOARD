require("dotenv").config();
const https = require("https");

const accountSid = process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.trim() : "";
const authToken = process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN.trim() : "";

const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

const options = {
    hostname: "api.twilio.com",
    path: `/2010-04-01/Accounts/${accountSid}.json`,
    method: "GET",
    headers: {
        "Authorization": `Basic ${auth}`
    }
};

console.log(`Testing Raw HTTP Auth for SID: ${accountSid}`);

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
                console.log("✅ RAW REQUEST SUCCESS!");
                console.log("Account:", json.friendly_name);
                console.log("Type:", json.type);
                console.log("Status:", json.status);
            } else {
                console.log("❌ RAW REQUEST FAILED");
                console.log("Error Code:", json.code);
                console.log("Message:", json.message);
                console.log("More Info:", json.more_info);
            }
        } catch (e) {
            console.log("Raw Response:", data);
        }
    });
});

req.on("error", (error) => {
    console.error("Network Error:", error);
});

req.end();
