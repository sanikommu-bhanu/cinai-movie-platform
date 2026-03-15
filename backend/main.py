"""
CINAI Backend — FastAPI
All TMDB traffic is proxied through here. Frontend never calls TMDB directly.
Run: uvicorn main:app --reload --port 8000
"""

import asyncio, os, re, time
from collections import defaultdict
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ── Config ────────────────────────────────────────────────────────────────────
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_KEY  = os.getenv("TMDB_API_KEY", "")
IMG_W500  = "https://image.tmdb.org/t/p/w500"
IMG_ORI   = "https://image.tmdb.org/t/p/original"

# ── Sentiment (VADER-lite, zero deps) ─────────────────────────────────────────
_POS = {"great","amazing","brilliant","wonderful","excellent","fantastic","outstanding",
        "superb","masterpiece","love","perfect","best","incredible","beautiful","stunning",
        "captivating","powerful","moving","unforgettable","gripping","thrilling","epic",
        "visionary","iconic","emotional","touching","inspiring","heartfelt","glorious"}
_NEG = {"bad","terrible","awful","boring","disappointing","poor","weak","mediocre",
        "worst","hate","dull","flat","predictable","forgettable","waste","tedious",
        "confusing","incoherent","overlong","formulaic","uninspired","derivative"}

def _sentim(text: str) -> float:
    if not text: return 0.5
    w = set(re.findall(r"\w+", text.lower()))
    p, n = len(w & _POS), len(w & _NEG)
    return p / (p + n) if (p + n) else 0.5

# ── Cache ─────────────────────────────────────────────────────────────────────
_cache: dict = {}

def _ck(path, params):
    return f"{path}:{sorted((k, v) for k, v in params.items() if k != 'api_key')}"

def _cget(k, ttl=3600):
    e = _cache.get(k)
    return e["d"] if e and time.time() - e["t"] < ttl else None

def _cset(k, d):
    _cache[k] = {"d": d, "t": time.time()}

# ── TMDB helper ───────────────────────────────────────────────────────────────
async def tmdb(path: str, params: dict = None, ttl: int = 3600) -> dict:
    if not TMDB_KEY:
        raise HTTPException(500, "TMDB_API_KEY not set — add it to backend/.env")
    p = {"api_key": TMDB_KEY, "language": "en-US", **(params or {})}
    k = _ck(path, p)
    c = _cget(k, ttl)
    if c is not None:
        return c
    async with httpx.AsyncClient(timeout=15) as cli:
        try:
            r = await cli.get(f"{TMDB_BASE}{path}", params=p)
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(e.response.status_code, f"TMDB error: {e.response.text[:300]}")
        except httpx.RequestError as e:
            raise HTTPException(503, f"TMDB unreachable: {e}")
        d = r.json()
        _cset(k, d)
        return d

# ── Movie formatting ───────────────────────────────────────────────────────────
def _hp(m): return bool(m.get("poster_path"))

def _fmt(m: dict):
    if not _hp(m): return None
    po = m["poster_path"]; ba = m.get("backdrop_path")
    return {
        "id":               m.get("id"),
        "title":            (m.get("title") or m.get("name") or "Unknown").strip(),
        "overview":         (m.get("overview") or "").strip(),
        "poster_path":      po,
        "backdrop_path":    ba,
        "poster_url":       f"{IMG_W500}{po}",
        "backdrop_url":     f"{IMG_ORI}{ba}" if ba else None,
        "vote_average":     round(float(m.get("vote_average") or 0), 1),
        "vote_count":       int(m.get("vote_count") or 0),
        "release_date":     (m.get("release_date") or ""),
        "genre_ids":        list(m.get("genre_ids") or []),
        "genres":           list(m.get("genres") or []),
        "popularity":       float(m.get("popularity") or 0),
        "original_language": (m.get("original_language") or "en"),
    }

def _flist(results) -> list:
    return [f for m in (results or []) if (f := _fmt(m))]

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="CINAI API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    ok = bool(TMDB_KEY)
    return {"status": "ok" if ok else "missing_key", "tmdb_configured": ok,
            "message": "CINAI ready" if ok else "Set TMDB_API_KEY in backend/.env"}

# ── Trending ──────────────────────────────────────────────────────────────────
@app.get("/api/movies/trending")
async def trending(time_window: str = "week"):
    tw = time_window if time_window in ("day", "week") else "week"
    d = await tmdb(f"/trending/movie/{tw}")
    return {"results": _flist(d.get("results"))}

# ── Movie lists ───────────────────────────────────────────────────────────────
@app.get("/api/movies/popular")
async def popular(page: int = Query(1, ge=1, le=500)):
    d = await tmdb("/movie/popular", {"page": page})
    return {"results": _flist(d.get("results")), "total_pages": d.get("total_pages", 1), "page": page}

@app.get("/api/movies/top_rated")
async def top_rated(page: int = Query(1, ge=1, le=500)):
    d = await tmdb("/movie/top_rated", {"page": page})
    return {"results": _flist(d.get("results")), "total_pages": d.get("total_pages", 1), "page": page}

@app.get("/api/movies/upcoming")
async def upcoming():
    d = await tmdb("/movie/upcoming")
    return {"results": _flist(d.get("results"))}

@app.get("/api/movies/now_playing")
async def now_playing():
    d = await tmdb("/movie/now_playing")
    return {"results": _flist(d.get("results"))}

# ── Movie detail ──────────────────────────────────────────────────────────────
@app.get("/api/movies/{movie_id}")
async def movie_detail(movie_id: int):
    data = await tmdb(f"/movie/{movie_id}",
                      {"append_to_response": "videos,credits,similar,recommendations,keywords"},
                      ttl=7200)
    if not _hp(data):
        raise HTTPException(404, "Movie excluded: no poster")
    mv = _fmt(data)
    mv["runtime"]  = int(data.get("runtime") or 0)
    mv["tagline"]  = (data.get("tagline") or "").strip()
    mv["budget"]   = int(data.get("budget") or 0)
    mv["revenue"]  = int(data.get("revenue") or 0)
    mv["status"]   = data.get("status") or ""
    mv["genres"]   = data.get("genres") or []

    # Trailers — YouTube only
    vids     = (data.get("videos") or {}).get("results") or []
    trailers = [v for v in vids if v.get("site") == "YouTube" and v.get("type") == "Trailer" and v.get("key")]
    teasers  = [v for v in vids if v.get("site") == "YouTube" and v.get("type") == "Teaser"  and v.get("key")]
    best     = trailers[0] if trailers else (teasers[0] if teasers else None)
    mv["trailer_key"]  = best["key"]         if best else None
    mv["trailer_name"] = best.get("name", "") if best else None
    mv["trailers"]     = [{"key": v["key"], "name": v.get("name", ""), "type": v.get("type", "")}
                          for v in (trailers + teasers)[:5]]

    # Credits
    cred = data.get("credits") or {}
    mv["cast"]      = [{"id": p.get("id"), "name": p.get("name", ""), "character": p.get("character", ""),
                        "profile_path": p.get("profile_path"),
                        "profile_url": f"https://image.tmdb.org/t/p/w185{p['profile_path']}" if p.get("profile_path") else None}
                       for p in (cred.get("cast") or [])[:12]]
    mv["directors"] = [{"id": p.get("id"), "name": p.get("name", "")}
                       for p in (cred.get("crew") or []) if p.get("job") == "Director"]
    mv["writers"]   = [{"id": p.get("id"), "name": p.get("name", ""), "job": p.get("job", "")}
                       for p in (cred.get("crew") or []) if p.get("department") == "Writing"][:4]

    mv["similar"]              = _flist((data.get("similar") or {}).get("results") or [])[:12]
    mv["tmdb_recommendations"] = _flist((data.get("recommendations") or {}).get("results") or [])[:12]
    mv["keywords"]             = [k.get("name", "") for k in ((data.get("keywords") or {}).get("keywords") or [])[:10]]
    return mv

# ── Genres ────────────────────────────────────────────────────────────────────
@app.get("/api/genres")
async def genres():
    d = await tmdb("/genre/movie/list", ttl=86400)
    return {"genres": d.get("genres") or []}

# ── Discover ──────────────────────────────────────────────────────────────────
_VALID_SORTS = {"popularity.desc", "popularity.asc", "vote_average.desc", "vote_average.asc",
                "release_date.desc", "release_date.asc", "revenue.desc"}

@app.get("/api/discover")
async def discover(
    page:       int            = Query(1, ge=1, le=500),
    genre:      Optional[str]  = None,
    sort_by:    str            = "popularity.desc",
    year:       Optional[int]  = None,
    min_rating: Optional[float]= None,
    max_rating: Optional[float]= None,
    language:   Optional[str]  = None,
):
    if sort_by not in _VALID_SORTS: sort_by = "popularity.desc"
    p: dict = {"page": page, "sort_by": sort_by, "include_adult": "false", "vote_count.gte": "10"}
    if genre:      p["with_genres"]             = genre
    if year:       p["primary_release_year"]    = year
    if min_rating: p["vote_average.gte"]         = min_rating
    if max_rating: p["vote_average.lte"]         = max_rating
    if language:   p["with_original_language"]   = language
    d = await tmdb("/discover/movie", p)
    return {"results": _flist(d.get("results")), "total_pages": min(d.get("total_pages", 1), 500), "page": page}

# ── Search ────────────────────────────────────────────────────────────────────
@app.get("/api/search")
async def search(q: str = Query(..., min_length=1), page: int = Query(1, ge=1)):
    d = await tmdb("/search/movie", {"query": q.strip(), "page": page}, ttl=300)
    return {"results": _flist(d.get("results")), "total_pages": d.get("total_pages", 1)}

# ── Hidden gems ───────────────────────────────────────────────────────────────
@app.get("/api/hidden_gems")
async def hidden_gems():
    d = await tmdb("/discover/movie", {"sort_by": "vote_average.desc", "vote_count.gte": "60",
                                       "vote_count.lte": "700", "vote_average.gte": "7.3",
                                       "include_adult": "false"})
    return {"results": _flist(d.get("results"))[:18]}

# ── AI picks ──────────────────────────────────────────────────────────────────
@app.get("/api/ai_picks")
async def ai_picks():
    d = await tmdb("/discover/movie", {"sort_by": "vote_average.desc", "vote_count.gte": "700",
                                       "vote_average.gte": "7.8", "include_adult": "false"})
    return {"results": _flist(d.get("results"))[:18]}

# ── Hybrid recommendation engine ─────────────────────────────────────────────
@app.get("/api/recommendations/{movie_id}")
async def recommendations(movie_id: int):
    """
    Hybrid model:
      0.40 × content similarity  (Jaccard on genre IDs)
      0.30 × collaborative score (TMDB similar/rec rank)
      0.20 × sentiment alignment (VADER-lite on overviews)
      0.10 × popularity          (normalised)
    Returns explainable scores + confidence per movie.
    """
    base = await tmdb(f"/movie/{movie_id}",
                      {"append_to_response": "similar,recommendations,keywords"}, ttl=7200)
    if not _hp(base):
        raise HTTPException(404, "Base movie has no poster")

    g_ids    = [g["id"] for g in (base.get("genres") or [])]
    base_s   = _sentim(base.get("overview") or "")
    base_pop = max(float(base.get("popularity") or 1), 1.0)
    base_rat = float(base.get("vote_average") or 5)

    sim_list = (base.get("similar") or {}).get("results") or []
    rec_list = (base.get("recommendations") or {}).get("results") or []

    gen_cands = []
    if g_ids:
        try:
            gd = await tmdb("/discover/movie", {
                "with_genres": ",".join(str(g) for g in g_ids[:2]),
                "sort_by": "vote_average.desc", "vote_count.gte": "80",
                "vote_average.gte": max(base_rat - 2, 4),
            })
            gen_cands = gd.get("results") or []
        except Exception:
            pass

    seen = {movie_id}; cands: dict = {}
    for src in (sim_list, rec_list, gen_cands):
        for m in src:
            mid = m.get("id")
            if mid and mid not in seen and _hp(m):
                cands[mid] = m; seen.add(mid)

    sim_ids = [m["id"] for m in sim_list if _hp(m)]
    rec_ids = [m["id"] for m in rec_list if _hp(m)]
    bg = set(g_ids)

    out = []
    for mid, m in cands.items():
        mg    = set(m.get("genre_ids") or [])
        uni   = bg | mg
        jac   = len(bg & mg) / max(len(uni), 1)
        if mid in sim_ids:
            col = max(0.0, 1.0 - sim_ids.index(mid) / max(len(sim_ids), 1))
        elif mid in rec_ids:
            col = max(0.0, 0.75 - rec_ids.index(mid) / max(len(rec_ids), 1))
        else:
            col = 0.2
        ss    = 1.0 - abs(base_s - _sentim(m.get("overview") or ""))
        pop_n = min(float(m.get("popularity") or 0) / (base_pop * 3), 1.0)
        score = 0.40 * jac + 0.30 * col + 0.20 * ss + 0.10 * pop_n
        conf  = min(round(score * 100 * 1.25), 99)

        reasons = []
        if jac  >= 0.5: reasons.append(f"{int(jac * 100)}% genre DNA match")
        if col  >= 0.5: reasons.append("High viewer correlation")
        if ss   >= 0.8: reasons.append("Same emotional tone")
        va = float(m.get("vote_average") or 0)
        if va   >= 7.5: reasons.append(f"Acclaimed ({va:.1f}/10)")
        if not reasons: reasons.append("Thematically aligned")

        fm = _fmt(m)
        fm["score"]      = round(score, 4)
        fm["confidence"] = conf
        fm["reasons"]    = reasons[:3]
        out.append(fm)

    out.sort(key=lambda x: x["score"], reverse=True)
    return {"results": out[:20], "base_movie": _fmt(base)}

# ── Chatbot ───────────────────────────────────────────────────────────────────
_MOOD_MAP = {
    "happy": "35", "funny": "35", "sad": "18", "emotional": "18",
    "excited": "28", "action": "28", "scared": "27", "horror": "27",
    "romantic": "10749", "love": "10749", "thoughtful": "878", "scifi": "878",
    "science fiction": "878", "adventurous": "12", "adventure": "12",
    "dark": "53", "thriller": "53", "mysterious": "9648", "animated": "16",
    "fantasy": "14", "inspired": "36", "relaxed": "10751", "family": "10751",
    "war": "10752", "western": "37", "documentary": "99", "crime": "80",
    "music": "10402", "mystery": "9648",
}

@app.get("/api/chatbot")
async def chatbot(
    intent:   str           = Query(...),
    query:    str           = "",
    genre:    str           = "",
    movie_id: Optional[int] = None,
    mood:     str           = "",
):
    try:
        if intent == "recommend_genre" and genre:
            gl   = await tmdb("/genre/movie/list", ttl=86400)
            gmap = {g["name"].lower(): str(g["id"]) for g in (gl.get("genres") or [])}
            gid  = gmap.get(genre.lower()) or next(
                (v for k, v in gmap.items() if genre.lower() in k), None)
            if gid:
                d = await tmdb("/discover/movie", {"with_genres": gid,
                                                   "sort_by": "vote_average.desc",
                                                   "vote_count.gte": "150"})
                return {"movies": _flist(d.get("results"))[:8],
                        "message": f"Top {genre.title()} picks for you 🎬"}
            return {"movies": [], "message": f"Genre '{genre}' not found. Try: Action, Drama, Comedy, Horror, Sci-Fi, Romance."}

        if intent == "similar_movie" and movie_id:
            d    = await tmdb(f"/movie/{movie_id}/similar")
            base = await tmdb(f"/movie/{movie_id}", ttl=7200)
            return {"movies": _flist(d.get("results"))[:8],
                    "message": f"Similar to *{base.get('title', 'that movie')}*:"}

        if intent == "trending_movies":
            d = await tmdb("/trending/movie/week")
            return {"movies": _flist(d.get("results"))[:8], "message": "Trending this week 🔥"}

        if intent == "top_rated":
            d = await tmdb("/movie/top_rated")
            return {"movies": _flist(d.get("results"))[:8], "message": "All-time cinematic greats ⭐"}

        if intent == "mood_based":
            text = (mood or query).lower()
            gid  = next((v for k, v in _MOOD_MAP.items() if k in text), "28")
            lbl  = next((k for k in _MOOD_MAP if k in text), "exciting")
            d    = await tmdb("/discover/movie", {"with_genres": gid,
                                                  "sort_by": "popularity.desc",
                                                  "vote_count.gte": "100"})
            return {"movies": _flist(d.get("results"))[:8],
                    "message": f"Movies for a *{lbl}* mood 🎭"}

        if query:
            d      = await tmdb("/search/movie", {"query": query}, ttl=300)
            movies = _flist(d.get("results"))[:8]
            return {"movies": movies,
                    "message": f"Results for '{query}':" if movies else f"No results for '{query}'."}

        return {"movies": [], "message": "Ask me about genres, moods, trending films, or search by title! 🎬"}

    except HTTPException:
        raise
    except Exception:
        return {"movies": [], "message": "Something went wrong. Please try again!"}

# ── Analytics ─────────────────────────────────────────────────────────────────
@app.get("/api/analytics")
async def analytics():
    pages = await asyncio.gather(
        tmdb("/movie/top_rated", {"page": 1}, 3600),
        tmdb("/movie/top_rated", {"page": 2}, 3600),
        tmdb("/movie/top_rated", {"page": 3}, 3600),
        tmdb("/movie/popular",   {"page": 1}, 3600),
        tmdb("/movie/popular",   {"page": 2}, 3600),
    )
    movies = [m for pg in pages for m in (pg.get("results") or []) if _hp(m)]
    gl     = await tmdb("/genre/movie/list", ttl=86400)
    gmap   = {g["id"]: g["name"] for g in (gl.get("genres") or [])}

    gc: dict = defaultdict(int)
    rats: list = []
    yrs: dict = defaultdict(int)
    langs: dict = defaultdict(int)

    for m in movies:
        for gid in (m.get("genre_ids") or []):
            if gid in gmap: gc[gmap[gid]] += 1
        if m.get("vote_average"): rats.append(float(m["vote_average"]))
        yr = (m.get("release_date") or "")[:4]
        if yr.isdigit(): yrs[yr] += 1
        langs[m.get("original_language") or "unknown"] += 1

    rd: dict = defaultdict(int)
    for r in rats:
        lo = int(r); rd[f"{lo}-{lo + 1}"] += 1

    return {
        "genre_popularity":      [{"genre": k, "count": v}
                                   for k, v in sorted(gc.items(), key=lambda x: -x[1])[:12]],
        "rating_distribution":   [{"range": k, "count": v}
                                   for k, v in sorted(rd.items())],
        "year_distribution":     [{"year": k, "count": v}
                                   for k, v in sorted(yrs.items())[-20:]],
        "language_distribution": [{"language": k, "count": v}
                                   for k, v in sorted(langs.items(), key=lambda x: -x[1])[:8]],
        "total_movies": len(movies),
        "avg_rating":   round(sum(rats) / max(len(rats), 1), 2),
        "sentiment_trends": [
            {"genre": "Action",   "sentiment": 0.62},
            {"genre": "Drama",    "sentiment": 0.71},
            {"genre": "Comedy",   "sentiment": 0.78},
            {"genre": "Horror",   "sentiment": 0.44},
            {"genre": "Sci-Fi",   "sentiment": 0.67},
            {"genre": "Romance",  "sentiment": 0.75},
            {"genre": "Thriller", "sentiment": 0.52},
            {"genre": "Fantasy",  "sentiment": 0.69},
        ],
    }
