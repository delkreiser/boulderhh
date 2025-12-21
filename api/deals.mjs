export default async function handler(req, res) {
  // Your Google Sheet CSV export URL (hidden on server-side)
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1fOO4xaEGOmRbL1IYHl0YbU2acWxoksjfaJBm9uf4rp4/export?format=csv&gid=0';
  
  try {
    const response = await fetch(SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Sheet fetch failed: ${response.status}`);
    }
    
    const csvData = await response.text();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/csv');
    res.status(200).send(csvData);
    
  } catch (error) {
    console.error('Error fetching sheet:', error);
    res.status(500).json({ 
      error: 'Failed to fetch deals',
      message: error.message 
    });
  }
}