import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Play } from 'lucide-react';

const TMDB_API_KEY = '8d9047190e290e2ef59c9ba25c6198f3';

export default function Watch() {
  const router = useRouter();
  const { type, id } = router.query;
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (id && type) {
      fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then(data => setDetails(data));
    }
  }, [id, type]);

  if (!details) return <div className="bg-[#050505] min-h-screen" />;

  const embedUrl = type === 'movie' 
    ? `https://vidsrc.to/embed/movie/${id}`
    : `https://vidsrc.to/embed/tv/${id}/1/1`;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Head>
        <title>{details.title || details.name} | Nawaf Stream</title>
      </Head>

      <div className="relative w-full aspect-video md:h-[70vh] bg-black">
        <iframe 
          src={embedUrl}
          className="w-full h-full border-b border-purple-500/30"
          allowFullScreen
          frameBorder="0"
        />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <img 
            src={details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
            className="w-48 rounded-xl shadow-2xl neon-border-purple hidden md:block"
            alt=""
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{details.title || details.name}</h1>
            <div className="flex gap-4 text-iceBlue-400 mb-6 font-medium">
              <span>{details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
              <span>{details.vote_average?.toFixed(1)} TMDB</span>
              <span className="uppercase">{type}</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg mb-8">
              {details.overview}
            </p>

            {type === 'tv' && details.seasons && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Play size={20} className="text-purple-500" />
                  Seasons
                </h3>
                <div className="flex flex-wrap gap-3">
                  {details.seasons.map((s: any) => (
                    <button key={s.id} className="glass px-6 py-2 rounded-lg hover:neon-border-blue focus-state">
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}