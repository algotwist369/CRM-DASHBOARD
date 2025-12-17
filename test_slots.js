const { generateAvailableSlots } = require('./server/utils/appointmentUtils');

// Mock business with missing settings (Defaults test)
const mockBusinessDefaults = {
    _id: '123',
    settings: {}
};

// Mock business closed today (assuming test runs on a specific day, let's allow all days for open test)
// Note: Utils check date.toLocaleDateString for day name.
const mockBusinessClosed = {
    settings: {
        workingHours: {
            days: ['nothing'],
            open: '09:00',
            close: '17:00'
        }
    }
};

const date = new Date('2025-01-01T12:00:00Z'); // A Wednesday

console.log("--- Testing Defaults ---");
try {
    const slots = generateAvailableSlots(mockBusinessDefaults, date, []);
    console.log(`Slots generated: ${slots.length}`);
    if (slots.length > 0) {
        console.log(`First slot: ${slots[0].startTime} - ${slots[0].endTime}`);
        console.log(`Last slot: ${slots[slots.length - 1].startTime} - ${slots[slots.length - 1].endTime}`);
    }
    // Expected: 09:00 to 21:00 = 12 hours = 24 slots (30 mins)
    // 09:00, 09:30 ... 20:30 (ends 21:00)
    // Actually loop is < endMinutes. 21:00 is 1260 mins. 09:00 is 540.
    // (1260 - 540) / 30 = 24 slots.
    if (slots.length === 24) console.log("SUCCESS: Defaults match 9am-9pm 30min");
    else console.error(`FAILURE: Expected 24 slots, got ${slots.length}`);
} catch (e) {
    console.error("FAILURE: Crashed on defaults", e);
}

console.log("\n--- Testing Explicit Closed ---");
try {
    const slotsClosed = generateAvailableSlots(mockBusinessClosed, date, []);
    console.log(`Slots generated: ${slotsClosed.length}`);
    if (slotsClosed.length === 0) console.log("SUCCESS: Correctly returned no slots for closed business");
    else console.error("FAILURE: Should return 0 slots");
} catch (e) {
    console.error("FAILURE: Crashed on closed", e);
}
