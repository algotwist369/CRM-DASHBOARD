# Quick Reference: SEO Redirect Implementation

## 🚀 Quick Start

### Testing Locally
```powershell
# Navigate to server directory
cd server

# Run the test script
powershell -ExecutionPolicy Bypass -File ".\scripts\test-seo-redirects.ps1"
```

### Deployment Checklist
- [ ] Add environment variables to `.env`
- [ ] Test locally using the PowerShell script
- [ ] Deploy backend and frontend
- [ ] Test in production using curl or browser
- [ ] Submit sitemap to Google Search Console

## 📋 Environment Variables

Add to `server/.env`:
```env
BASE_URL=https://spaadvisor.in
FACEBOOK_URL=https://www.facebook.com/spaadvisor.in
INSTAGRAM_URL=https://www.instagram.com/spaadvisor.in
TWITTER_URL=https://twitter.com/spaadvisor
FREE_LISTING_REDIRECT=/business-register
```

## 🔗 All Redirect Rules

| Old URL Pattern | New URL | Status |
|----------------|---------|--------|
| `/search/result?area=detectedCity&searchSpas=X` | `/search?q=X` | 301 |
| `/search/search/result?...` | `/search?q=X` | 301 |
| `/spa/25` | `/search?legacyId=25` | 301 |
| `/spa/35#!` | `/search?legacyId=35` | 301 |
| `/job-details?position=Spa Manager` | `/careers/spa-manager` | 301 |
| `/apply?position=X` | `/careers/x/apply` | 301 |

| `/facebook` | Facebook Page | 301 |
| `/instagram` | Instagram Page | 301 |
| `/free-listing` | `/business-register` | 301 |
| `/spas?location=X` | `/search?q=X` | 301 |
| `/services` | `/search` | 301 |
| `/spas/slug/id` | `/slug` | 301 |


## 📁 Files Created/Modified

### Backend
- ✅ `server/middleware/seoRedirectMiddleware.js` - Main redirect logic
- ✅ `server/routes/sitemap.js` - robots.txt + sitemap.xml
- ✅ `server/app.js` - Middleware registration
- ✅ `server/docs/SEO_REDIRECT_GUIDE.md` - Full documentation
- ✅ `server/scripts/test-seo-redirects.ps1` - Test script

### Frontend
- ✅ `client/src/components/seo/MetaTags.jsx` - SEO component
- ✅ `client/src/components/seo/index.js` - Export
- ✅ `client/public/robots.txt` - Static fallback

## 🧪 Testing Commands

### Test Specific Redirect
```powershell
curl -I http://localhost:5000/spa/25
# Expected: 301 with Location header
```

### Test robots.txt
```powershell
curl http://localhost:5000/robots.txt
# Expected: Text file with disallow rules
```

### Test sitemap.xml
```powershell
curl http://localhost:5000/sitemap.xml
# Expected: Valid XML with URLs
```

## 🎯 Using MetaTags Component

```jsx
import { MetaTags } from '@/components/seo';

function YourPage() {
    return (
        <>
            <MetaTags
                title="Your Page Title - SpaAdvisor"
                description="Your page description"
                canonical="https://spaadvisor.in/your-page"
                keywords="your, keywords, here"
                ogImage="/images/your-og-image.jpg"
            />
            {/* Your page content */}
        </>
    );
}
```

## 📊 Google Search Console Steps

1. **Submit Sitemap**
   - Go to GSC → Sitemaps
   - Add: `https://spaadvisor.in/sitemap.xml`

2. **Verify Redirects**
   - Use URL Inspection tool
   - Test old URLs
   - Confirm 301 redirects work

3. **Monitor Coverage**
   - Check Coverage report weekly
   - Watch for 404 decreases
   - Monitor valid page increases

4. **Optional: Remove Old URLs**
   - Use Removals tool
   - Request temporary removal
   - Google will de-index over time

## 🔍 Monitoring Logs

Redirect logs look like:
```json
{
  "timestamp": "2026-01-02T12:00:00.000Z",
  "from": "/spa/25",
  "to": "/search?legacyId=25",
  "reason": "Legacy spa detail page",
  "statusCode": 301
}
```

Check server logs for these entries to monitor redirect activity.

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Redirects not working | Check middleware order in `app.js` |
| robots.txt not loading | Verify sitemap routes are mounted at `/` |
| Sitemap shows 0 businesses | Check database query and `isActive` field |
| Old URLs still in GSC | Normal - takes weeks/months for Google to update |

## 📖 Full Documentation

For complete details, see:
- [`server/docs/SEO_REDIRECT_GUIDE.md`](file:///a:/DOS/Projects/CRM-DASHBOARD/server/docs/SEO_REDIRECT_GUIDE.md)
- [`walkthrough.md`](file:///C:/Users/ADMIN/.gemini/antigravity/brain/ff7648d6-380b-4bb8-be61-5ee7aa14bbca/walkthrough.md)

## ✅ Success Checklist

After deployment, verify:
- [ ] All redirect tests pass
- [ ] robots.txt loads at `/robots.txt`
- [ ] sitemap.xml loads at `/sitemap.xml`
- [ ] Environment variables are set
- [ ] Sitemap submitted to Google Search Console
- [ ] Monitoring setup for Coverage report

---

**Last Updated:** 2026-01-02  
**Status:** ✅ Ready for Production
