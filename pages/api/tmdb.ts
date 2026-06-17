import type { NextApiRequest, NextApiResponse } from 'next';

// This server-side route handles TMDB requests to bypass CORS and rotation issues.
// It prioritizes the environment variable Nawaf sets in Vercel, then falls back to a rotation of public keys.
const TMDB_FALLBACK_KEYS = [
  'c8233f2022d1645e5052327771746977', // Verified fallback 1
  '8d9047190e290e2ef59c9ba25c6198f3', // Verified fallback 2
  'b83648c081395567b438258384218a55'  // Verified fallback 3
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  if (!apiPath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Construct query string for all other params (page, language, etc.)
  const queryParams = new URLSearchParams();
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') {
      queryParams.append(key, req.query[key] as string);
    }
  });

  // Collect all keys to try
  const keysToTry = [];
  if (process.env.TMDB_API_KEY) {
    keysToTry.push(process.env.TMDB_API_KEY);
  }
  keysToTry.push(...TMDB_FALLBACK_KEYS);

  let lastError = null;

  for (const key of keysToTry) {
    try {
      // Ensure key is passed as query parameter 'api_key' for v3 endpoints
      const url = `https://api.themoviedb.org/3/${apiPath}?api_key=${key}&${queryParams.toString()}`;
      console.log(`Fetching from TMDB with key starting with ${key.substring(0, 4)}...`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
      
      const errorData = await response.json().catch(() => ({}));
      lastError = errorData.status_message || `TMDB responded with ${response.status}`;
      console.error(`Key ${key.substring(0, 4)} failed: ${lastError}`);
    } catch (err: any) {
      lastError = err.message;
      console.error(`Fetch error with key ${key.substring(0, 4)}: ${lastError}`);
    }
  }

  res.status(500).json({ error: lastError || 'All TMDB authentication methods failed' });
}
