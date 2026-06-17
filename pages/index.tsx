import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, TrendingUp } from 'lucide-react';

const TMDB_API_KEY = '8d9047190e290e2ef59c9ba25c6198f3';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`)
      .then(res => res.json())
      .then(data => setTrending(data.results || []));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <Head>
        <title>Nawaf Stream | Obsidian Neon</title>
      </Head>

      <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-iceBlue-400 bg-clip-text text-transparent">
          Nawaf Stream
        </h1>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search movies & series..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:neon-border-blue outline-none glass"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-purple-500" />
          <h2 className="text-2xl font-semibold">Trending Now</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {trending.map((item: any) => (
            <a 
              key={item.id} 
              href={`/watch/${item.media_type}/${item.id}`}
              className="group relative rounded-lg overflow-hidden glass focus-state block"
            >
              <img 
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                alt={item.title || item.name}
                className="w-full aspect-[2/3] object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-sm font-medium line-clamp-2">{item.title || item.name}</p>
                <div className="h-1 w-full bg-gray-700 mt-2 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-full animate-pulse" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}