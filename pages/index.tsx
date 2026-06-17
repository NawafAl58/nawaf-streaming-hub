import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const [trendingRes, popularRes, topRatedRes] = await Promise.all([
          fetch('/api/tmdb?path=trending/all/day'),
          fetch('/api/tmdb?path=movie/popular'),
          fetch('/api/tmdb?path=tv/popular')
        ]);

        const trendingData = await trendingRes.json();
        const popularData = await popularRes.json();
        const topRatedData = await topRatedRes.json();

        setTrending(trendingData.results || []);
        setPopular(popularData.results || []);
        setTopRated(topRatedData.results || []);
        
        if (trendingData.results?.length > 0) {
          setHeroMovie(trendingData.results[0]);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  useEffect(() => {
    if (search.length > 2) {
      const delaySearch = setTimeout(async () => {
        const res = await fetch(`/api/tmdb?path=search/multi&query=${encodeURIComponent(search)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      }, 500);
      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const MovieCard = ({ item }: { item: any }) => {
    const type = item.media_type || (item.title ? 'movie' : 'tv');
    return (
      <div 
        onClick={() => router.push(`/watch/${type}/${item.id}`)}
        className="relative aspect-[2/3] bg-[#222] rounded-md overflow-hidden cursor-pointer movie-card-hover group focus-ring"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && router.push(`/watch/${type}/${item.id}`)}
      >
        <img 
          src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
          alt={item.title || item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <p className="text-sm font-bold mb-1 line-clamp-1">{item.title || item.name}</p>
          <div className="flex justify-between text-[10px] text-gray-300">
            <span>{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
            <span className="text-[#f1c40f]"><i className="fas fa-star mr-1"></i>{item.vote_average?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  };

  const MovieSection = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        <a href="#" className="text-[#e50914] text-sm hover:underline">عرض الكل</a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {items.map((item: any) => <MovieCard key={item.id} item={item} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111] text-white" dir="rtl">
      <Head>
        <title>سينما تايم | للمشاهدة المباشرة</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <nav className={`fixed top-0 w-full z-[1000] flex justify-between items-center px-[6%] py-4 transition-all duration-300 ${scrolled ? 'bg-[#0c0c0c] border-b border-[#222]' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex items-center gap-8">
          <a href="/" className="text-[#e50914] text-3xl font-bold tracking-wider">سينما تايم</a>
          <ul className="hidden md:flex items-center gap-6 text-[#b3b3b3] text-sm">
            <li><a href="/" className="text-white font-bold">الرئيسية</a></li>
            <li><a href="#" className="hover:text-white transition-colors">أفلام</a></li>
            <li><a href="#" className="hover:text-white transition-colors">مسلسلات</a></li>
            <li><a href="#" className="hover:text-white transition-colors">أضيف حديثاً</a></li>
          </ul>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center">
            <i className="fas fa-search absolute right-3 text-gray-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="ابحث عن فيلم أو مسلسل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/60 border border-[#444] rounded-full py-2 pr-10 pl-4 text-sm outline-none focus:border-[#e50914] focus:bg-black/80 transition-all w-48 md:w-64"
            />
          </div>
          <div className="w-8 h-8 bg-red-600 rounded-sm cursor-pointer"></div>
        </div>
      </nav>

      {search.length > 2 && (
        <div className="pt-24 px-[6%] min-h-screen bg-[#111]">
          <h2 className="text-2xl font-bold mb-8">نتائج البحث عن: {search}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {searchResults.map((item: any) => <MovieCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {!search && (
        <>
          {heroMovie && (
            <div className="relative h-[85vh] flex items-center px-[6%]">
              <div 
                className="absolute inset-0 z-[-1] bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(to right, rgba(17,17,17,0.9) 20%, transparent), linear-gradient(to top, #111, transparent), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})` }}
              />
              <div className="max-w-2xl mt-20">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{heroMovie.title || heroMovie.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
                  <span className="text-[#f1c40f] font-bold"><i className="fas fa-star ml-1"></i>{heroMovie.vote_average?.toFixed(1)}</span>
                  <span>{heroMovie.release_date?.split('-')[0] || heroMovie.first_air_date?.split('-')[0]}</span>
                  <span className="border border-gray-400 px-2 py-0.5 rounded text-xs">16+</span>
                </div>
                <p className="text-gray-200 text-lg leading-relaxed mb-8 drop-shadow-md line-clamp-3">
                  {heroMovie.overview}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => router.push(`/watch/${heroMovie.media_type || (heroMovie.title ? 'movie' : 'tv')}/${heroMovie.id}`)}
                    className="bg-white text-black px-8 py-3 rounded font-bold flex items-center gap-3 hover:bg-white/80 transition-all focus-ring"
                  >
                    <i className="fas fa-play"></i> تشغيل
                  </button>
                  <button className="bg-gray-500/70 text-white px-8 py-3 rounded font-bold flex items-center gap-3 hover:bg-gray-500/40 transition-all focus-ring">
                    <i className="fas fa-info-circle"></i> المزيد من المعلومات
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="px-[6%] py-10 relative z-10 bg-[#111]">
            <MovieSection title="أفلام رائجة" items={trending} />
            <MovieSection title="مسلسلات شهيرة" items={popular} />
            <MovieSection title="الأعلى تقييماً" items={topRated} />
          </main>
        </>
      )}

      <footer className="border-t border-[#222] py-10 px-[6%] text-center text-gray-500 text-sm">
        <p className="mb-4">جميع الحقوق محفوظة لسينما تايم © 2026</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-white">سياسة الخصوصية</a>
          <a href="#" className="hover:text-white">اتصل بنا</a>
          <a href="#" className="hover:text-white">شروط الاستخدام</a>
        </div>
      </footer>
    </div>
  );
}
