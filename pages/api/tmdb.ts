import type { NextApiRequest, NextApiResponse } from 'next';

const TMDB_KEYS = [
  '8d9047190e290e2ef59c9ba25c6198f3', // Original
  'c8233f2022d1645e5052327771746977', // Fallback 1
  '522d421671d1727a6211451f36077a79'  // Fallback 2
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  if (!apiPath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Construct query string for all other params
  const queryParams = new URLSearchParams();
  Object.keys(req.query).forEach(key => {
    if (key !== 'path') {
      queryParams.append(key, req.query[key] as string);
    }
  });

  let lastError = null;

  for (const key of TMDB_KEYS) {
    try {
      const url = `https://api.themoviedb.org/3/${apiPath}?api_key=${key}&${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
      
      const errorData = await response.json();
      lastError = errorData.status_message || `TMDB responded with ${response.status}`;
    } catch (err: any) {
      lastError = err.message;
    }
  }

  res.status(500).json({ error: lastError || 'All TMDB keys failed' });
}
