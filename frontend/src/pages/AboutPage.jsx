import React from 'react'
import { motion } from 'framer-motion'
import { Film, Code2, Database, Zap, Globe, Cpu, Shield } from 'lucide-react'
import { PageWrapper } from '../components/UI.jsx'

const STACK = [
  {icon:Code2,    label:'React 18',       desc:'SPA + Framer Motion animations',   color:'#61dafb'},
  {icon:Zap,      label:'FastAPI',        desc:'Python async backend API',          color:'#009688'},
  {icon:Database, label:'TMDB API',       desc:'Real movie data, posters, trailers',color:'#01b4e4'},
  {icon:Globe,    label:'YouTube Embed',  desc:'Legal trailer embedding',           color:'#ff0000'},
  {icon:Cpu,      label:'Hybrid AI',      desc:'Content × Collaborative × Sentiment',color:'#a78bfa'},
  {icon:Shield,   label:'Zustand',        desc:'Persistent global state',           color:'#f5a623'},
]

export default function AboutPage() {
  return (
    <PageWrapper className="pt-20 px-6 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="text-center mb-16">
        <div className="w-20 h-20 bg-cinema-accent/20 border-2 border-cinema-accent/40 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Film size={36} className="text-cinema-accent" />
        </div>
        <h1 className="font-display text-7xl gradient-text mb-4">CINAI</h1>
        <p className="text-cinema-muted text-lg max-w-2xl mx-auto leading-relaxed">
          An AI-powered movie discovery platform combining real-time TMDB data with hybrid machine
          learning recommendations and a cinematic-grade interface.
        </p>
      </motion.div>

      {/* Architecture */}
      <div className="glass rounded-2xl p-8 mb-10">
        <h2 className="font-display text-3xl text-cinema-accent mb-6">SYSTEM ARCHITECTURE</h2>
        <div className="font-mono text-xs text-cinema-muted leading-loose whitespace-pre bg-cinema-card rounded-xl p-6 overflow-x-auto">
{`┌─────────────────────────────────────────────┐
│              REACT SPA (Frontend)           │
│  Home · Discover · Recs · Trending · Genres │
│  Watchlist · Analytics · Chat · About       │
│         Navbar · Search · Voice             │
└──────────────────┬──────────────────────────┘
                   │ /api/* (Vite proxy)
┌──────────────────▼──────────────────────────┐
│          FASTAPI BACKEND (Python)           │
│  ┌──────────────────────────────────────┐   │
│  │      Hybrid Recommendation Engine   │   │
│  │  0.40 Content  (Jaccard genres)     │   │
│  │  0.30 Collab   (TMDB rank signal)   │   │
│  │  0.20 Sentiment(VADER-lite NLP)     │   │
│  │  0.10 Popularity (normalised)       │   │
│  └──────────────────────────────────────┘   │
│  In-memory LRU cache · Input validation     │
└──────┬─────────────────────────┬────────────┘
       │                         │
┌──────▼──────┐         ┌────────▼────────┐
│  TMDB API   │         │  YouTube Embed  │
│  /trending  │         │  (via TMDB key) │
│  /discover  │         │  autoplay muted │
│  /search    │         │  legal iframe   │
│  /movies/*  │         └─────────────────┘
│  /genres    │
└─────────────┘`}
        </div>
      </div>

      {/* Stack */}
      <div className="mb-10">
        <h2 className="font-display text-3xl text-cinema-accent mb-6">TECHNOLOGY STACK</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {STACK.map((s,i)=>(
            <motion.div key={s.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
              transition={{delay:i*0.07}} className="glass rounded-2xl p-5">
              <s.icon size={22} className="mb-3" style={{color:s.color}} />
              <p className="font-bold mb-1">{s.label}</p>
              <p className="text-cinema-muted text-xs">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Model */}
      <div className="glass rounded-2xl p-8 mb-10">
        <h2 className="font-display text-3xl text-cinema-accent mb-4">AI RECOMMENDATION ENGINE</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {label:'Content Filter',weight:'40%',color:'#4f8ef7',desc:'Jaccard genre similarity + keyword DNA'},
            {label:'Collaborative', weight:'30%',color:'#a78bfa',desc:'TMDB viewer correlation rank signals'},
            {label:'Sentiment',     weight:'20%',color:'#34d399',desc:'VADER-lite NLP on movie overviews'},
            {label:'Popularity',    weight:'10%',color:'#f5a623',desc:'Normalised TMDB popularity score'},
          ].map(item=>(
            <div key={item.label} className="text-center p-4 rounded-xl border border-cinema-border">
              <p className="font-mono text-2xl font-bold mb-1" style={{color:item.color}}>{item.weight}</p>
              <p className="font-medium text-sm mb-2">{item.label}</p>
              <p className="text-cinema-muted text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="glass rounded-2xl p-8 mb-10">
        <h2 className="font-display text-3xl text-cinema-accent mb-5">FEATURES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            '🎬 Real TMDB movie data — zero dummy content',
            '🖼️ Strict poster filter — no missing images ever',
            '▶️ Legal YouTube trailers via TMDB video API',
            '🤖 Hybrid AI with explainable confidence scores',
            '💬 Conversational chatbot with intent detection',
            '📊 Live analytics dashboard with Recharts',
            '🔍 Instant search + browser voice input',
            '🎭 Mood-based movie discovery',
            '📱 Fully responsive mobile + desktop layout',
            '🔖 Persistent watchlist with 4 status types',
            '✨ Framer Motion animations throughout',
            '🌑 Film grain + glassmorphism design system',
          ].map((f,i)=><p key={i}>{f}</p>)}
        </div>
      </div>

      {/* Legal */}
      <div className="glass rounded-2xl p-6 border border-cinema-accent/20 text-center">
        <p className="text-cinema-muted text-sm leading-relaxed">
          <strong className="text-white">Legal Notice:</strong>{' '}
          This product uses the TMDB API but is not endorsed or certified by TMDB.
          All movie data, posters and metadata are provided by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer"
            className="text-cinema-accent hover:underline">The Movie Database (TMDB)</a>.
          Trailers are embedded from YouTube via TMDB's official video data API.
        </p>
      </div>
    </PageWrapper>
  )
}
