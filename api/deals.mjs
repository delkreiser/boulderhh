export default async function handler(req, res) {
  // Your Google Sheet CSV export URL (hidden on server-side)
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1fOO4xaEGOmRbL1IYHl0YbU2acWxoksjfaJBm9uf4rp4/export?format=csv&gid=0';
  
  try {
    const response = await fetch(SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Sheet fetch failed: ${response.status}`);
    }
    
    const csvData = await response.text();
    
    // Set CORS headers to allow your frontend to call this
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);
    
  } catch (error) {
    console.error('Error fetching sheet:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
}
```

4. Scroll down and click **"Commit changes"**
5. Add commit message: "Add serverless API to proxy Google Sheets"
6. Click **"Commit changes"** again

### Step 3: Wait for Vercel to Deploy
1. Go to your Vercel dashboard
2. You should see a new deployment starting automatically
3. Wait ~30-60 seconds for it to complete
4. You'll see "Deployment Complete" ✅

### Step 4: Test the API
Once deployed, visit:
```
https://boulderhappyhour.vercel.app/api/deals