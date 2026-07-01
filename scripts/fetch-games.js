import fs from 'fs';
import path from 'path';

// twitch client credentials can be passed as arguments or environment variables
const CLIENT_ID = process.env.TWITCH_CLIENT_ID || process.argv[2];
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || process.argv[3];
const TARGET_COUNT = Number(process.env.TARGET_COUNT) || 7500;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'Chyba: Chýba Twitch Client ID alebo Client Secret!');
  console.log('\nPre prístup k IGDB API musíte vytvoriť aplikáciu na Twitch vývojárskom portáli.');
  console.log('Spustite skript nasledovne:\n');
  console.log('  \x1b[36m$env:TWITCH_CLIENT_ID="id"; $env:TWITCH_CLIENT_SECRET="secret"; node scripts/fetch-games.js\x1b[0m (PowerShell)');
  console.log('  alebo');
  console.log('  \x1b[36mnode scripts/fetch-games.js klientske_id klientsky_secret\x1b[0m\n');
  process.exit(1);
}

// IGDB caps results at 500 per request and offsets at 500, so a single query
// can return at most 500 rows. To pull thousands we split the query per genre,
// page through each genre (offset 0 -> 500 in 500-step pages), and dedupe by ID.
const GENRES = [
  'Role-playing (RPG)', 'Shooter', 'Adventure', 'Platform', 'Puzzle',
  'Point-and-click', 'Fighting', 'Real Time Strategy (RTS)', 'Strategy',
  'Simulator', 'Racing', 'Music', 'Sport', 'Indie', "Hack and slash/Beat 'em up",
  'Turn-based strategy (TBS)', 'Tactical', 'Card & Board Game', 'Quiz/Trivia',
  'Arcade', 'Pinball', 'MOBA'
];

const BASE_FIELDS = 'name, summary, storyline, rating, rating_count, first_release_date, cover.url, genres.name, platforms.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher';
const PAGE_SIZE = 500;

async function getAccessToken() {
  console.log('\x1b[35m[1/3]\x1b[0m Získavam OAuth token od Twitch autorizačného servera...');
  const url = `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Nepodarilo sa získať prístupový token: ${errorText}`);
  }
  const data = await res.json();
  return data.access_token;
}

// Fetch one page of games for a given genre at a given offset.
async function fetchPage(token, genre, offset) {
  // Escape single quotes in the genre name for the IGDB query string.
  const safeGenre = genre.replace(/'/g, "\\'");
  const query = `
    fields ${BASE_FIELDS};
    where cover != null & rating != null & rating_count > 10 & platforms = (6) & genres.name = "${safeGenre}";
    sort rating desc;
    limit ${PAGE_SIZE};
    offset ${offset};
  `;
  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain'
    },
    body: query
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Chyba IGDB dopytu (${genre}, offset ${offset}): ${errorText}`);
  }
  return res.json();
}

// Pull games across all genres, deduping by ID, until we hit TARGET_COUNT.
async function fetchAllGames(token) {
  console.log(`\x1b[35m[2/3]\x1b[0m Sťahujem hry z IGDB API (cieľ: ${TARGET_COUNT})...`);
  const seen = new Set();
  const games = [];
  let requestCount = 0;

  for (const genre of GENRES) {
    if (games.length >= TARGET_COUNT) break;
    for (let offset = 0; offset < 500; offset += PAGE_SIZE) {
      requestCount++;
      let page;
      try {
        page = await fetchPage(token, genre, offset);
      } catch (e) {
        console.error(`  ! chyba pri ${genre} offset ${offset}: ${e.message}`);
        break;
      }
      if (!Array.isArray(page) || page.length === 0) break; // genre exhausted

      let added = 0;
      for (const g of page) {
        if (!seen.has(g.id)) {
          seen.add(g.id);
          games.push(g);
          added++;
          if (games.length >= TARGET_COUNT) break;
        }
      }
      process.stdout.write(`\r  -> ${genre.padEnd(28)} | ${String(games.length).padStart(5)}/${TARGET_COUNT} hier | ${requestCount} requestov `);
      if (page.length < PAGE_SIZE) break;        // last page of this genre
      if (games.length >= TARGET_COUNT) break;
    }
    if (games.length >= TARGET_COUNT) break;
  }
  process.stdout.write('\n');
  console.log(` -> Celkom ${games.length} unikátnych hier z ${requestCount} requestov.`);
  return games;
}

function formatGame(g) {
  // Zmena rozlíšenia obrázku z thumb na 720p
  let imageUrl = '/images/game1.png';
  if (g.cover?.url) {
    imageUrl = g.cover.url.startsWith('http') ? g.cover.url : `https:${g.cover.url}`;
    imageUrl = imageUrl.replace('t_thumb', 't_720p');
  }

  const genresList = g.genres?.map(gen => gen.name) || ['Akčná'];
  const platformsList = g.platforms?.map(p => p.name) || ['PC (Windows)'];

  const isEpic = platformsList.includes('Epic Games Store') && !platformsList.includes('Steam');
  const primaryPlatform = isEpic ? 'Epic Games' : 'Steam';

  const year = g.first_release_date
    ? new Date(g.first_release_date * 1000).getFullYear()
    : 2023;

  let developer = 'Neznámy vývojár';
  let publisher = 'Neznámy vydavateľ';
  if (g.involved_companies) {
    const devCo = g.involved_companies.find(c => c.developer);
    if (devCo) developer = devCo.company.name;
    const pubCo = g.involved_companies.find(c => c.publisher);
    if (pubCo) publisher = pubCo.company.name;
  }

  const description = g.summary
    ? (g.summary.slice(0, 150) + (g.summary.length > 150 ? '...' : ''))
    : `${g.name} je oceňovaný titul z kategórie ${genresList[0]}.`;

  const longDescription = g.storyline || g.summary || 'K tejto hre nie je k dispozícii žiadny príbeh.';

  const sizeOptions = ['15 GB', '30 GB', '50 GB', '75 GB', '90 GB'];
  const size = sizeOptions[g.id % sizeOptions.length];

  const sysRequirementsMin = {
    os: 'Windows 10 64-bit',
    cpu: 'Intel Core i5-6600K / AMD Ryzen 5 1600',
    ram: '8 GB RAM',
    gpu: 'NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 580',
    storage: `${size} voľného miesta`
  };
  const sysRequirementsRec = {
    os: 'Windows 10/11 64-bit',
    cpu: 'Intel Core i7-8700K / AMD Ryzen 7 2700X',
    ram: '16 GB RAM',
    gpu: 'NVIDIA GeForce RTX 2060 / AMD Radeon RX 5700 XT',
    storage: `${size} (SSD odporúčané)`
  };

  const miniGameOptions = ['balatro', 'outerwilds', 'sekiro', 'hades'];
  const miniGameId = miniGameOptions[g.id % miniGameOptions.length];

  return {
    id: g.id,
    title: g.name,
    platform: primaryPlatform,
    available: true,
    image: imageUrl,
    genre: genresList[0],
    year,
    description,
    longDescription,
    features: [
      'Kompletne pohlcujúci zážitok z hry',
      'Vynikajúce vizuálne spracovanie a soundtrack',
      'Detailne navrhnutý herný svet',
      'Vysoké hodnotenia kritikov a hráčov'
    ],
    developer,
    publisher,
    rating: g.rating ? `${Math.round(g.rating)}%` : '90%',
    size,
    tags: [...genresList.slice(0, 3), primaryPlatform],
    sysRequirementsMin,
    sysRequirementsRec,
    miniGameId
  };
}

async function startSeeding() {
  try {
    const token = await getAccessToken();
    const igdbGames = await fetchAllGames(token);

    console.log(`\x1b[35m[3/3]\x1b[0m Spracovávam a zapisujem hry do src/data/games.ts...`);

    if (igdbGames.length === 0) {
      console.error('\x1b[31mChyba: IGDB vrátil 0 hier. Súbor games.ts nebol prepísaný, aby sa predišlo vymazaniu existujúcich dát.\x1b[0m');
      console.error('Skontrolujte query (filter "where"), platnosť tokenov alebo stav IGDB API.');
      process.exit(1);
    }

    const formattedGames = igdbGames.map(formatGame);

    const fileContent = `export interface Game {
  id: number;
  title: string;
  platform: string;
  available: boolean;
  image: string;
  genre: string;
  year: number;
  description: string;
  longDescription: string;
  features: string[];
  developer: string;
  publisher: string;
  rating: string;
  size: string;
  tags: string[];
  sysRequirementsMin: Record<string, string>;
  sysRequirementsRec: Record<string, string>;
  miniGameId: "balatro" | "outerwilds" | "sekiro" | "hades";
}

export const MOCK_GAMES: Game[] = ${JSON.stringify(formattedGames, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;

    const targetPath = path.resolve(process.cwd(), 'src/data/games.ts');
    fs.writeFileSync(targetPath, fileContent, 'utf-8');
    console.log(`\x1b[32m✔ Databáza hier bola úspešne aktualizovaná v: ${targetPath} (${formattedGames.length} hier)\x1b[0m\n`);

  } catch (error) {
    console.error('\x1b[31mChyba pri sťahovaní dát:\x1b[0m', error.message);
  }
}

startSeeding();
