import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const API_BASE = "https://cinai-backend.onrender.com/api"
/* ── Simple fetch cache ────────────────────────────────────────────────────── */
const _cache   = new Map()
const _fly     = new Map()

export async function apiFetch(path, ttl = 60000) {
  const now   = Date.now()
  const entry = _cache.get(path)
  if (entry && now - entry.ts < ttl) return entry.data
  if (_fly.has(path)) return _fly.get(path)

  const p = fetch(`${API_BASE}${path}`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then(data => {
      _cache.set(path, { data, ts: Date.now() })
      _fly.delete(path)
      return data
    })
    .catch(err => {
      _fly.delete(path)
      throw err
    })

  _fly.set(path, p)
  return p
}

/* ── Global store ──────────────────────────────────────────────────────────── */
export const useStore = create(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (movie) => {
        if (!movie?.id) return
        const list = get().watchlist
        if (!list.find(m => m.id === movie.id))
          set({ watchlist: [...list, { ...movie, addedAt: new Date().toISOString(), status: 'want' }] })
      },
      removeFromWatchlist: (id) =>
        set({ watchlist: get().watchlist.filter(m => m.id !== id) }),
      updateWatchlistStatus: (id, status) =>
        set({ watchlist: get().watchlist.map(m => m.id === id ? { ...m, status } : m) }),
      isInWatchlist: (id) => Boolean(id && get().watchlist.some(m => m.id === id)),

      ratings: {},
      rateMovie:  (id, rating) => set({ ratings: { ...get().ratings, [id]: rating } }),
      getRating:  (id)         => get().ratings[id] || 0,

      selectedMovie: null,
      setSelectedMovie: (movie) => set({ selectedMovie: movie }),
    }),
    {
      name: 'cinai-v2',
      partialize: (s) => ({ watchlist: s.watchlist, ratings: s.ratings }),
    }
  )
)
