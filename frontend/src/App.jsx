import React, { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar      from './components/Navbar.jsx'
import Footer      from './components/Footer.jsx'
import MovieDetail from './components/MovieDetail.jsx'
import HomePage            from './pages/HomePage.jsx'
import DiscoverPage        from './pages/DiscoverPage.jsx'
import RecommendationsPage from './pages/RecommendationsPage.jsx'
import TrendingPage        from './pages/TrendingPage.jsx'
import GenresPage          from './pages/GenresPage.jsx'
import WatchlistPage       from './pages/WatchlistPage.jsx'
import AnalyticsPage       from './pages/AnalyticsPage.jsx'
import ChatPage            from './pages/ChatPage.jsx'
import AboutPage           from './pages/AboutPage.jsx'
import { useStore } from './store/index.js'

export default function App() {
  const [page,          setPage]          = useState('home')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const { setSelectedMovie: storeSet }    = useStore()

  const navigate = useCallback((p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const openMovie = useCallback((movie) => {
    setSelectedMovie(movie)
    storeSet(movie)
  }, [storeSet])

  const closeMovie = useCallback(() => {
    setSelectedMovie(null)
    storeSet(null)
  }, [storeSet])

  // Global event for Navbar search results
  useEffect(() => {
    const fn = (e) => openMovie(e.detail)
    window.addEventListener('cinai:open-movie', fn)
    return () => window.removeEventListener('cinai:open-movie', fn)
  }, [openMovie])

  const renderPage = () => {
    const p = { onMovieClick: openMovie }
    switch (page) {
      case 'home':            return <HomePage            {...p} />
      case 'discover':        return <DiscoverPage        {...p} />
      case 'recommendations': return <RecommendationsPage {...p} />
      case 'trending':        return <TrendingPage        {...p} />
      case 'genres':          return <GenresPage          {...p} />
      case 'watchlist':       return <WatchlistPage       {...p} />
      case 'analytics':       return <AnalyticsPage />
      case 'chat':            return <ChatPage            {...p} />
      case 'about':           return <AboutPage />
      default:                return <HomePage            {...p} />
    }
  }

  return (
    <div className="min-h-screen bg-cinema-bg text-cinema-text font-body">
      <Navbar onNavigate={navigate} currentPage={page} />

      <AnimatePresence mode="wait">
        <React.Fragment key={page}>
          {renderPage()}
        </React.Fragment>
      </AnimatePresence>

      <Footer />

      <AnimatePresence>
        {selectedMovie && (
          <MovieDetail
            key={selectedMovie.id}
            movie={selectedMovie}
            onClose={closeMovie}
            onMovieClick={openMovie}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
