#!/usr/bin/env node
/**
 * seed-supabase.js
 *
 * Reads the FitGirl games list, queries IGDB for metadata,
 * and inserts missing games into Supabase.
 *
 * Usage:
 *   node scripts/seed-supabase.js              # full run
 *   node scripts/seed-supabase.js --dry-run    # preview without inserting
 *   node scripts/seed-supabase.js --limit 50   # process only first 50 missing games
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────
const IGDB_CLIENT_ID = 'mpfderd8ki6o11rvbzh0f5qvzau480';
const IGDB_CLIENT_SECRET = 'ozpa01p6ropc2acenr60zk1g89c13u';

const SUPABASE_URL = 'https://bqbijlcqrrfajlnvrbkf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxYmlqbGNxcnJmYWpsbnZyYmtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk3ODU2NSwiZXhwIjoyMDk4NTU0NTY1fQ.reIY-bDpwnr2ezCp5pYOAC-dtu-W4JfM64ylQnO5QJs';

const FITGIRL_LIST = resolve(__dirname, '../../abc/scraped_data/fitgirl_games_list.txt');
const PROGRESS_FILE = resolve(__dirname, '.seed-progress.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT_IDX = args.indexOf('--limit');
const LIMIT = LIMIT_IDX !== -1 ? parseInt(args[LIMIT_IDX + 1], 10) : Infinity;

// ─── IGDB Auth ───────────────────────────────────────────────────────────────
let igdbToken = null;
let igdbTokenExpiry = 0;

async function getIgdbToken() {
  if (igdbToken && Date.now() < igdbTokenExpiry) return igdbToken;

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: IGDB_CLIENT_ID,
      client_secret: IGDB_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) throw new Error(`IGDB auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  igdbToken = data.access_token;
  igdbTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return igdbToken;
}

async function igdbQuery(endpoint, body) {
  const token = await getIgdbToken();
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
      Accept: 'application/json',
    },
    body,
  });

  if (res.status === 429) {
    const retry = parseInt(res.headers.get('retry-after') || '2', 10);
    console.log(`  Rate limited, waiting ${retry}s...`);
    await sleep(retry * 1000);
    return igdbQuery(endpoint, body);
  }

  if (!res.ok) {
    const text = await res.text();
    console.log(`  IGDB error ${res.status}: ${text.slice(0, 200)}`);
    return [];
  }

  return res.json();
}

// ─── Title Cleaning ──────────────────────────────────────────────────────────
function cleanTitle(raw) {
  let t = raw.trim();

  // strip trailing: + N DLCs, + Bonus OST, + Windows 7 Fix, + Yuzu/Ryujinx Emus...
  t = t.replace(/\s*\+\s*\d*\s*(DLC|Bonus|OST|Soundtrack|Content|Fix|Emu|Update|Patch|Crack|Mod)[^\n]*/gi, '');

  // strip trailing version/build: – v1.2.3, – Build 1234, – v1.0 (Release), #19619
  t = t.replace(/\s*[–\-]\s*(v\d|Build\s|#\d|b\d).*/i, '');

  // strip trailing comma + version: ", v1.13.3"
  t = t.replace(/,\s*(v\d|Build\s).*/i, '');

  // strip trailing edition labels if preceded by dash/en-dash
  t = t.replace(/\s*[–\-]\s*(Deluxe|Ultimate|Definitive|Game of the Year|GOTY|Anniversary|Complete|Collection|Anthology|Premium|Gold|Platinum)\s*(Edition)?\s*$/gi, '');

  // strip trailing parenthetical year/edition: (2023), (Deluxe Edition)
  t = t.replace(/\s*\((?:\d{4}|Deluxe|Ultimate|Definitive|GOTY|Anniversary|Complete|Edition)[^)]*\)\s*$/gi, '');

  // strip trailing "Edition" standalone
  t = t.replace(/\s+Edition\s*$/gi, '');

  // clean up leftover trailing dashes/spaces
  t = t.replace(/\s*[–\-]\s*$/, '').trim();

  return t;
}

// ─── Supabase Helpers ────────────────────────────────────────────────────────
async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
  });
  if (!res.ok) throw new Error(`Supabase GET ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supabaseInsert(rows) {
  if (!rows.length) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/games`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    console.log(`  Supabase insert error ${res.status}: ${text.slice(0, 300)}`);
    return false;
  }
  return true;
}

async function getAllExistingGames() {
  const games = [];
  let start = 0;
  const pageSize = 1000;
  while (true) {
    const batch = await supabaseGet(`games?select=id,title&order=id&offset=${start}&limit=${pageSize}`);
    games.push(...batch);
    if (batch.length < pageSize) break;
    start += pageSize;
  }
  return games;
}

// ─── IGDB → Game Row Mapping ─────────────────────────────────────────────────
const IGDB_GENRE_MAP = {
  'Point-and-click': 'Adventure',
  'Fighting': 'Action',
  'Shooter': 'Action',
  'Music': 'Music',
  'Platform': 'Platformer',
  'Puzzle': 'Puzzle',
  'Racing': 'Racing',
  'Real time strategy': 'Strategy',
  'Role-playing (RPG)': 'RPG',
  'Simulator': 'Simulation',
  'Sport': 'Sports',
  'Strategy': 'Strategy',
  'Turn-based strategy (TBS)': 'Strategy',
  'Tactical': 'Strategy',
  'Quiz/Trivia': 'Puzzle',
  'Hack and slash/Beat \'em up': 'Action',
  'Adventure': 'Adventure',
  'Indie': 'Indie',
  'Arcade': 'Arcade',
  'Visual Novel': 'Visual Novel',
  'Card & Board Game': 'Card/Board',
  'MOBA': 'MOBA',
};

function mapGenre(igdbGenres) {
  if (!igdbGenres?.length) return 'Unknown';
  const mapped = igdbGenres
    .map(g => IGDB_GENRE_MAP[g.name] || g.name)
    .filter(Boolean);
  return [...new Set(mapped)].slice(0, 3).join(', ') || 'Unknown';
}

function mapRating(rating, ratingCategory) {
  if (!rating) return '';
  // rating is a number 0-100, rating_category is an enum (0=EXTERNAL, 1=IGDB, etc.)
  // Just return the numeric rating as a string
  return Math.round(rating).toString();
}

function buildGameRow(igdbGame, cleanName) {
  const releaseYear = igdbGame.first_release_date
    ? new Date(igdbGame.first_release_date * 1000).getFullYear()
    : new Date().getFullYear();

  const coverUrl = igdbGame.cover?.url
    ? igdbGame.cover.url.replace('t_thumb', 't_1080p')
    : '';

  const developers = (igdbGame.involved_companies || [])
    .filter(c => c.developer)
    .map(c => c.company?.name)
    .filter(Boolean);

  const publishers = (igdbGame.involved_companies || [])
    .filter(c => c.publisher)
    .map(c => c.company?.name)
    .filter(Boolean);

  const platforms = (igdbGame.platforms || [])
    .map(p => p.name)
    .filter(Boolean);

  const tags = [
    ...(igdbGame.game_modes || []).map(m => m.name),
    ...(igdbGame.themes || []).map(t => t.name),
  ].filter(Boolean);

  return {
    id: igdbGame.id,
    title: igdbGame.name || cleanName,
    platform: platforms.length ? platforms[0] : 'PC (Microsoft Windows)',
    available: true,
    image: coverUrl || `https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.jpg`,
    genre: mapGenre(igdbGame.genres),
    year: releaseYear,
    description: (igdbGame.summary || '').slice(0, 500),
    long_description: igdbGame.summary || '',
    features: tags,
    developer: developers[0] || '',
    publisher: publishers[0] || '',
    rating: '',
    size: '',
    tags,
    sys_requirements_min: {},
    sys_requirements_rec: {},
  };
}

// ─── Fuzzy Title Match ───────────────────────────────────────────────────────
function normalizeForMatch(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 40);
}

function scoreMatch(igdbName, cleanName) {
  const a = normalizeForMatch(igdbName);
  const b = normalizeForMatch(cleanName);
  if (a === b) return 100;
  if (a.startsWith(b) || b.startsWith(a)) return 90;
  if (a.includes(b) || b.includes(a)) return 80;
  // Levenshtein-ish: just check first 20 chars
  if (a.slice(0, 20) === b.slice(0, 20)) return 70;
  return 0;
}

// ─── Progress Tracking ───────────────────────────────────────────────────────
function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { processed: [], inserted: [], skipped: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ─── Main ────────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  FitGirl → IGDB → Supabase Seeder`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no inserts)' : 'LIVE'}`);
  if (LIMIT < Infinity) console.log(`  Limit: ${LIMIT} games`);
  console.log(`${'='.repeat(60)}\n`);

  // 1. Read FitGirl list
  const rawLines = readFileSync(FITGIRL_LIST, 'utf-8')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  console.log(`FitGirl list: ${rawLines.length} entries`);

  // 2. Clean titles
  const cleaned = rawLines.map(raw => ({
    raw,
    clean: cleanTitle(raw),
  }));

  // Deduplicate by cleaned title (keep first occurrence)
  const seen = new Set();
  const unique = cleaned.filter(({ clean }) => {
    const key = normalizeForMatch(clean);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Unique titles after dedup: ${unique.length}`);

  // 3. Fetch all existing games from Supabase
  console.log('\nFetching existing games from Supabase...');
  const existing = await getAllExistingGames();
  const existingTitles = new Map();
  for (const g of existing) {
    existingTitles.set(normalizeForMatch(g.title), g.id);
  }
  console.log(`Existing games in DB: ${existing.length}`);

  // 4. Find missing
  const missing = unique.filter(({ clean }) => {
    const key = normalizeForMatch(clean);
    // Check exact match or close match
    for (const [existingKey] of existingTitles) {
      if (key === existingKey || key.startsWith(existingKey) || existingKey.startsWith(key)) {
        return false;
      }
    }
    return true;
  });

  console.log(`Missing from DB: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log('All games already in database. Nothing to do.');
    return;
  }

  // 5. Load progress
  const progress = loadProgress();
  const processedSet = new Set(progress.processed);

  // Filter out already processed
  const todo = missing.filter(({ clean }) => !processedSet.has(normalizeForMatch(clean)));
  console.log(`Remaining after progress check: ${todo.length}\n`);

  const toProcess = todo.slice(0, LIMIT);

  // 6. Process each game
  let inserted = 0;
  let failed = 0;
  let noMatch = 0;
  const BATCH_SIZE = 50;
  let batch = [];

  for (let i = 0; i < toProcess.length; i++) {
    const { raw, clean } = toProcess[i];
    const pct = ((i + 1) / toProcess.length * 100).toFixed(1);
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${pct}% — "${clean}" ... `);

    try {
      // Search IGDB
      const results = await igdbQuery('games', `search "${clean.replace(/"/g, '\\"')}"; fields name,cover.url,genres.name,first_release_date,summary,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,platforms.name,game_modes.name,themes.name; limit 5;`);

      if (!results.length) {
        console.log('NO RESULTS');
        progress.processed.push(normalizeForMatch(clean));
        progress.skipped.push(clean);
        noMatch++;
        saveProgress(progress);
        // IGDB free tier: ~8 requests/sec, be conservative
        await sleep(350);
        continue;
      }

      // Find best match
      let best = null;
      let bestScore = 0;
      for (const r of results) {
        const s = scoreMatch(r.name, clean);
        if (s > bestScore) {
          bestScore = s;
          best = r;
        }
      }

      if (bestScore < 50) {
        console.log(`LOW MATCH (${bestScore}%: "${best?.name}")`);
        progress.processed.push(normalizeForMatch(clean));
        progress.skipped.push(`${clean} → best: ${best?.name} (${bestScore}%)`);
        noMatch++;
        saveProgress(progress);
        await sleep(350);
        continue;
      }

      // Build row
      const row = buildGameRow(best, clean);
      batch.push(row);
      console.log(`OK (${bestScore}%: "${best.name}", ${row.genre}, ${row.year})`);

      progress.processed.push(normalizeForMatch(clean));
      progress.inserted.push(clean);

      // Flush batch
      if (batch.length >= BATCH_SIZE) {
        if (!DRY_RUN) {
          const ok = await supabaseInsert(batch);
          if (ok) {
            console.log(`  → Inserted ${batch.length} games`);
            inserted += batch.length;
          } else {
            console.log(`  → Batch insert failed`);
            failed += batch.length;
          }
        } else {
          console.log(`  → [DRY RUN] Would insert ${batch.length} games`);
          inserted += batch.length;
        }
        batch = [];
        saveProgress(progress);
      }

      await sleep(350);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failed++;
      progress.processed.push(normalizeForMatch(clean));
      saveProgress(progress);
      await sleep(1000);
    }
  }

  // Flush remaining
  if (batch.length) {
    if (!DRY_RUN) {
      const ok = await supabaseInsert(batch);
      if (ok) {
        console.log(`\n  → Inserted final ${batch.length} games`);
        inserted += batch.length;
      } else {
        console.log(`\n  → Final batch insert failed`);
        failed += batch.length;
      }
    } else {
      console.log(`\n  → [DRY RUN] Would insert final ${batch.length} games`);
      inserted += batch.length;
    }
    saveProgress(progress);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  DONE`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  No IGDB match: ${noMatch}`);
  console.log(`  Errors: ${failed}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
