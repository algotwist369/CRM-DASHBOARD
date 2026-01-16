// Test script to verify Map.jsx logic
const googleMapsUrl = 'https://www.google.com/maps/place/Heritage+Spa+In+Thane/@19.2037551,72.9760098,2147m/data=!3m1!1e3!4m6!3m5!1s0x3be7b9583e325063:0x59cb75a300890507!8m2!3d19.2030221!4d72.9764348!16s%2Fg%2F11ydmhlf1f?entry=ttu&g_ep=EgoyMDI2MDEwNi4wIKXMDSoASAFQAw%3D%3D';

console.log('Testing URL:', googleMapsUrl);

let lat = null
let lng = null
let query = null
let cid = null

const decodedUrl = decodeURIComponent(googleMapsUrl)

// 1. Extract CID (Customer ID)
const cidMatch = decodedUrl.match(/!1s0x[0-9a-f]+:(0x[0-9a-f]+)/i)
if (cidMatch && cidMatch[1]) {
    try {
        // Convert Hex CID to Decimal String using BigInt
        cid = BigInt(cidMatch[1]).toString()
        console.log('✅ Found CID (Hex):', cidMatch[1]);
        console.log('✅ Converted CID (Decimal):', cid);
    } catch (e) {
        console.error('Failed to convert CID:', e)
    }
}

// 2. Extract Place Name (Query)
if (!cid) {
    const placeMatch = decodedUrl.match(/\/place\/([^/]+)/)
    if (placeMatch) {
        query = placeMatch[1]
        console.log('Found Query:', query);
    }
}

let finalUrl = '';
if (cid) {
    finalUrl = `https://maps.google.com/maps?cid=${cid}&output=embed`;
} else if (query) {
    finalUrl = `https://maps.google.com/maps?q=${query}&t=m&z=15&output=embed&iwloc=near`;
}

console.log('---------------------------------------------------');
console.log('GENERATED EMBED URL:', finalUrl);
console.log('---------------------------------------------------');

if (cid === '6470394632596948231') {
    console.log('TEST PASSED: CID matches expected value for Heritage Spa In Thane');
} else {
    console.log('TEST FAILED: CID mismatch');
}
