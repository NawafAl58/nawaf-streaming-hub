import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Watch() {
  const router = useRouter();
  const { type, id } = router.query;
  const [details, setDetails] = useState<any>(null);
  const [recommendations, setRecommendations] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (id && type) {
      fetch(`/api/tmdb?path=${type}/${id}`)
        .then(res => res.json())
        .then(data => setDetails(data));
      
      fetch(`/api/tmdb?path=${type}/${id}/recommendations`)
        .then(res => res.json())
        .then(data => setRecommendations(data.results?.slice(0, 6) || []));
    }
  }, [id, type]);

  if (!details) return <div className="bg-[#111] min-h-screen" />;

  const embedUrl = type === 'movie' 
    ? `https://vidsrc.to/embed/movie/${id}`
    : `https://vidsrc.to/embed/tv/${id}/1/1`;

  return (
    <div className="min-h-screen bg-[#111] text-white" dir="rtl">
      <Head>
        <title>{details.title || details.name} | سينما تايم</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <nav className={`fixed top-0 w-full z-[1000] flex justify-between items-center px-[6%] py-4 transition-all duration-300 ${scrolled ? 'bg-[#0c0c0c] border-b border-[#222]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <a href="/" className="text-[#e50914] text-3xl font-bold tracking-wider">سينما تايم</a>
        <div className="flex items-center gap-6">
          <a href="/" className="text-white hover:text-[#e50914] transition-colors"><i className="fas fa-home ml-2"></i>الرئيسية</a>
        </div>
      </nav>

      <div className="pt-20">
        <div className="relative w-full aspect-video md:h-[75vh] bg-black">
          <iframe 
            src={embedUrl}
            className="w-full h-full border-b border-[#222]"
            allowFullScreen
            frameBorder="0"
          />
        </div>

        <div className="px-[6%] py-12">
          <div className="flex flex-col md:flex-row gap-10">
            <img 
              src={details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
              className="w-56 rounded-lg shadow-2xl border border-[#333] hidden md:block self-start"
              alt=""
            />
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{details.title || details.name}</h1>
              <div className="flex gap-6 text-[#f1c40f] mb-8 font-bold text-lg">
                <span><i className="fas fa-star ml-2"></i>{details.vote_average?.toFixed(1)}</span>
                <span className="text-gray-400 font-normal">{details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
                <span className="text-gray-400 font-normal border border-gray-600 px-2 rounded">{type === 'movie' ? 'فيلم' : 'مسلسل'}</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-xl mb-10 max-w-4xl">
                {details.overview || "لا يوجد وصف متاح لهذا العمل حالياً."}
              </p>

              {recommendations.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">قد يعجبك أيضاً</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {recommendations.map((item: any) => (
                      <div 
                        key={item.id}
                        onClick={() => router.push(`/watch/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`)}
                        className="relative aspect-[2/3] bg-[#222] rounded overflow-hidden cursor-pointer movie-card-hover group focus-ring"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && router.push(`/watch/${type}/${item.id}`)}
                      >
                        <img 
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                          className="w-full h-full object-cover"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <i className="fas fa-play text-white text-2xl"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#222] py-10 px-[6%] text-center text-gray-500 text-sm">
        <p>جميع الحقوق محفوظة لسينما تايم © 2026</p>
      </footer>
    </div>
  );
}
