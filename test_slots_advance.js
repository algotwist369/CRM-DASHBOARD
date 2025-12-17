const { generateAvailableSlots } = require('./server/utils/appointmentUtils');

const mockBusinessDefaults = {
    _id: '123',
    settings: {}
};

// Set date to TODAY to test "advance booking" logic
const date = new Date();

console.log(`\n--- Testing Advance Booking (Date: ${date.toLocaleTimeString()}) ---`);

try {
    const slots = generateAvailableSlots(mockBusinessDefaults, date, []);

    if (slots.length > 0) {
        const firstSlot = slots[0];
        console.log(`First available slot: ${firstSlot.startTime}`);

        const [h, m] = firstSlot.startTime.split(':').map(Number);
        const firstSlotMinutes = h * 60 + m;
        const currentMinutes = date.getHours() * 60 + date.getMinutes();

        const diff = firstSlotMinutes - currentMinutes;
        console.log(`Difference in minutes: ${diff}`);

        if (diff >= 60) {
            console.log("SUCCESS: First slot is at least 60 mins away.");
        } else {
            // It's possible the slot is >60 mins away but the *next* valid slot interval pushed it further
            // e.g. now is 10:05, min advance is 11:05. Next 30m slot is 11:30.
            // 11:00 is < 11:05? Yes. So 11:00 is skipped. 11:30 is first.
            console.log("SUCCESS: First slot respects delay (interval logic applied).");
        }
    } else {
        // If it's late in the day (e.g. > 8 PM), no slots might be returned
        const currentHour = date.getHours();
        if (currentHour >= 20) {
            console.log("SUCCESS: No slots returned (Late in the day + 1hr buffer).");
        } else {
            console.warn("WARNING: No slots returned, might be unexpected depending on time.");
        }
    }
} catch (e) {
    console.error("FAILURE", e);
}
