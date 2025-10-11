system expected
### 8. Get Business Link
**GET** `/admin/business/{{business_id}}/link`
**Headers:** `Authorization: Bearer {{admin_token}}`

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "businessLink": "beauty-palace-downtown-abc123",
        "bookingUrl": "http://localhost:5000/api/appointments/business/beauty-palace-downtown-abc123/info"
    }
}

I got this response
{
    "success": true,
    "data": {
        "businessId": "68ca86745b5c995942e193d3",
        "businessName": "Beauty Palace Downtown",
        "businessLink": "http://localhost:5000/api/beautypalacegroup_68ca86745b5c995942e193d3",
        "managersCount": 1
    }
}