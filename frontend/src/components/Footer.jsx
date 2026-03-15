import React from 'react'
import { Film } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-cinema-border bg-cinema-surface mt-10">
      <div className="max-w-screen-2xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cinema-accent rounded-lg flex items-center justify-center">
              <Film size={15} fill="white" className="text-white" />
            </div>
            <div>
              <p className="font-display text-xl tracking-widest gradient-text">CINAI</p>
              <p className="text-cinema-muted text-xs">AI Movie Discovery</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-cinema-muted text-xs justify-center">
            {['Home','Discover','Trending','Genres','Watchlist','Analytics','AI Chat','About'].map(l => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-cinema-border text-center">
          <p className="text-cinema-muted text-xs leading-relaxed max-w-xl mx-auto">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
            Movie data provided by{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer"
              className="text-cinema-accent hover:underline">The Movie Database (TMDB)</a>.
            Trailers embedded from YouTube via TMDB's official video API.
          </p>
          <p className="text-cinema-muted/40 text-xs mt-2">© {new Date().getFullYear()} CINAI</p>
        </div>
      </div>
    </footer>
  )
}
