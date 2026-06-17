import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [t, m, v] = await Promise.all([
          fetch('/api/tmdb?path=trending/all/day').then(r => r.json()),
          fetch('/api/tmdb?path=movie/popular').then(r => r.json()),
          fetch('/api/tmdb?path=tv/popular').then(r => r.json())
        ]);
        setTrending(t.results || []);
        setPopularMovies(m.results || []);
        setPopularTV(v.results || []);
        if (t.results?.[0]) setHeroMovie(t.results[0]);
      } catch (e) {
        console.error(e);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (search.length > 2) {
      const timer = setTimeout(async () => {
        const res = await fetch(`/api/tmdb?path=search/multi&query=${encodeURIComponent(search)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const MovieCard = ({ item }: { item: any }) => {
    const type = item.media_type || (item.title ? 'movie' : 'tv');
    return (
      <div 
        onClick={() => router.push(`/watch/${type}/${item.id}`)}
        className="movie-card focus-ring"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && router.push(`/watch/${type}/${item.id}`)}
      >
        <img 
          src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
          alt={item.title || item.name}
        />
        <div className="movie-overlay">
          <p className="movie-card-title">{item.title || item.name}</p>
          <div className="movie-card-meta">
            <span>{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
            <span className="rating"><i className="fas fa-star ml-1"></i>{item.vote_average?.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Head>
        <title>سينما تايم | للمشاهدة المباشرة</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-right">
          <a href="/" className="logo">سينما تايم</a>
          <ul className="nav-menu">
            <li><a href="#" className="active">الرئيسية</a></li>
            <li><a href="#">أفلام</a></li>
            <li><a href="#">مسلسلات</a></li>
            <li><a href="#">أضيف حديثاً</a></li>
          </ul>
        </div>
        <div className="nav-left">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="بحث..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="user-profile bg-[#e50914]"></div>
        </div>
      </nav>

      {search.length > 2 ? (
        <div className="main-container pt-32">
          <h2 className="section-title mb-8">نتائج البحث عن: {search}</h2>
          <div className="movie-row">
            {searchResults.map((m: any) => <MovieCard key={m.id} item={m} />)}
          </div>
        </div>
      ) : (
        <>
          {heroMovie && (
            <section 
              className="hero" 
              style={{ backgroundImage: `linear-gradient(to right, rgba(17,17,17,0.9) 10%, transparent), linear-gradient(to top, #111, transparent), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})` }}
            >
              <div className="hero-content">
                <h1 className="hero-title">{heroMovie.title || heroMovie.name}</h1>
                <div className="hero-meta">
                  <span className="rating"><i className="fas fa-star ml-1"></i>{heroMovie.vote_average?.toFixed(1)}</span>
                  <span>{heroMovie.release_date?.split('-')[0] || heroMovie.first_air_date?.split('-')[0]}</span>
                  <span className="age-limit">16+</span>
                </div>
                <p className="hero-desc">{heroMovie.overview}</p>
                <div className="hero-btns">
                  <button 
                    onClick={() => router.push(`/watch/${heroMovie.media_type || (heroMovie.title ? 'movie' : 'tv')}/${heroMovie.id}`)}
                    className="btn btn-play focus-ring"
                  >
                    <i className="fas fa-play"></i> تشغيل
                  </button>
                  <button className="btn btn-info focus-ring">
                    <i className="fas fa-info-circle"></i> المزيد من المعلومات
                  </button>
                </div>
              </div>
            </section>
          )}

          <div className="main-container">
            <div className="mb-12">
              <div className="section-title">
                <h2>أفلام رائجة</h2>
                <a href="#">عرض الكل</a>
              </div>
              <div className="movie-row">
                {trending.slice(0, 12).map((m: any) => <MovieCard key={m.id} item={m} />)}
              </div>
            </div>

            <div className="mb-12">
              <div className="section-title">
                <h2>أفلام مختارة</h2>
                <a href="#">عرض الكل</a>
              </div>
              <div className="movie-row">
                {popularMovies.slice(0, 12).map((m: any) => <MovieCard key={m.id} item={m} />)}
              </div>
            </div>

            <div className="mb-12">
              <div className="section-title">
                <h2>مسلسلات شهيرة</h2>
                <a href="#">عرض الكل</a>
              </div>
              <div className="movie-row">
                {popularTV.slice(0, 12).map((m: any) => <MovieCard key={m.id} item={m} />)}
              </div>
            </div>
          </div>
        </>
      )}

      <footer>
        <p>جميع الحقوق محفوظة لسينما تايم © 2026</p>
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <a href="#" style={{ color: '#555', textDecoration: 'none' }}>الخصوصية</a>
          <a href="#" style={{ color: '#555', textDecoration: 'none' }}>شروط الاستخدام</a>
          <a href="#" style={{ color: '#555', textDecoration: 'none' }}>اتصل بنا</a>
        </div>
      </footer>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
        body { background-color: #111; color: #fff; overflow-x: hidden; }
        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 20px 6%; position: fixed; width: 100%; top: 0; z-index: 1000; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); transition: background 0.3s ease; }
        .navbar.scrolled { background-color: #0c0c0c; border-bottom: 1px solid #222; }
        .nav-right, .nav-left { display: flex; align-items: center; gap: 30px; }
        .logo { color: #e50914; font-size: 28px; font-weight: 700; text-decoration: none; letter-spacing: 1px; }
        .nav-menu { display: flex; list-style: none; gap: 20px; }
        .nav-menu a { color: #b3b3b3; text-decoration: none; font-size: 16px; transition: color 0.3s ease; }
        .nav-menu a:hover, .nav-menu a.active { color: #fff; font-weight: 600; }
        .search-box { position: relative; display: flex; align-items: center; }
        .search-box input { background-color: rgba(0, 0, 0, 0.6); border: 1px solid #444; color: #fff; padding: 8px 35px 8px 15px; border-radius: 20px; outline: none; font-size: 14px; transition: all 0.3s ease; }
        .search-box input:focus { border-color: #e50914; background-color: rgba(0, 0, 0, 0.8); }
        .search-box i { position: absolute; right: 12px; color: #b3b3b3; }
        .user-profile { width: 35px; height: 35px; border-radius: 4px; cursor: pointer; }
        .hero { height: 85vh; position: relative; background-size: cover; background-position: center; display: flex; align-items: center; padding: 0 6%; }
        .hero-content { max-width: 650px; margin-top: 80px; }
        .hero-title { font-size: 48px; font-weight: 700; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.6); }
        .hero-meta { display: flex; gap: 15px; font-size: 14px; color: #cccccc; margin-bottom: 20px; align-items: center; }
        .rating { color: #f1c40f; font-weight: bold; }
        .age-limit { border: 1px solid #ccc; padding: 1px 6px; font-size: 12px; border-radius: 3px; }
        .hero-desc { font-size: 18px; line-height: 1.6; color: #e5e5e5; margin-bottom: 30px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .hero-btns { display: flex; gap: 15px; }
        .btn { padding: 10px 25px; border-radius: 5px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.3s ease; border: none; }
        .btn-play { background-color: #fff; color: #000; }
        .btn-play:hover { background-color: rgba(255,255,255,0.85); }
        .btn-info { background-color: rgba(109, 109, 110, 0.7); color: #fff; }
        .btn-info:hover { background-color: rgba(109, 109, 110, 0.4); }
        .main-container { padding: 40px 6%; position: relative; z-index: 2; background-color: #111; }
        .section-title { font-size: 22px; font-weight: 600; margin-bottom: 20px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
        .section-title a { font-size: 14px; color: #e50914; text-decoration: none; }
        .movie-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
        .movie-card { position: relative; border-radius: 6px; overflow: hidden; cursor: pointer; transition: transform 0.3s ease; aspect-ratio: 2/3; background-color: #222; }
        .movie-card:hover { transform: scale(1.05); z-index: 5; }
        .movie-card img { width: 100%; height: 100%; object-fit: cover; }
        .movie-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.9) 30%, transparent); opacity: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 15px; transition: opacity 0.3s ease; }
        .movie-card:hover .movie-overlay { opacity: 1; }
        .movie-card-title { font-size: 14px; font-weight: 600; margin-bottom: 5px; }
        .movie-card-meta { display: flex; justify-content: space-between; font-size: 12px; color: #b3b3b3; }
        .focus-ring:focus { outline: 3px solid #e50914; transform: scale(1.05); z-index: 10; }
        footer { border-top: 1px solid #222; padding: 30px 6%; text-align: center; color: #555; font-size: 14px; }
        @media (max-width: 768px) {
          .nav-menu { display: none; }
          .hero-title { font-size: 32px; }
          .hero-desc { font-size: 14px; }
          .movie-row { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
        }
      `}</style>
    </div>
  );
}
