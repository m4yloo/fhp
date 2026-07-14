import { MOCK_GAMES } from "@/data/games";
import type { Game } from "@/lib/types";

// Keep track of Supabase health in sessionStorage
let supabaseFailed = false;
try {
  supabaseFailed = sessionStorage.getItem("fhp_supabase_failed") === "1";
} catch (e) {}

export function markSupabaseFailed() {
  if (!supabaseFailed) {
    console.warn("Supabase connection issue detected. Switching to local mock database.");
    supabaseFailed = true;
    try {
      sessionStorage.setItem("fhp_supabase_failed", "1");
    } catch (e) {}
  }
}

export function isSupabaseHealthy() {
  return !supabaseFailed;
}

// Mappers
export function mapGameToFrontend(g: any): Game {
  if (!g) return g;
  return {
    id: g.id,
    title: g.title,
    platform: g.platform,
    available: g.available !== undefined ? g.available : true,
    image: g.image,
    genre: g.genre,
    year: g.year,
    description: g.description,
    long_description: g.longDescription || g.long_description || "",
    features: g.features || [],
    developer: g.developer,
    publisher: g.publisher,
    rating: g.rating,
    size: g.size,
    tags: g.tags || [],
    sys_requirements_min: g.sysRequirementsMin || g.sys_requirements_min || {},
    sys_requirements_rec: g.sysRequirementsRec || g.sys_requirements_rec || {},
  };
}

// Local Storage helpers
const USER_GAMES_KEY = "fhp_mock_user_games";
const PASSES_KEY = "fhp_mock_passes";
const PASS_REQUESTS_KEY = "fhp_mock_pass_requests";
const TRANSACTIONS_KEY = "fhp_mock_transactions";

export function getMockGames(): Game[] {
  return MOCK_GAMES.map(mapGameToFrontend);
}

export function getMockGame(id: number): Game | null {
  const g = MOCK_GAMES.find((game) => game.id === id);
  return g ? mapGameToFrontend(g) : null;
}

export function getMockUserGames(userId: string): any[] {
  try {
    const data = localStorage.getItem(USER_GAMES_KEY);
    if (!data) return [];
    const list = JSON.parse(data);
    return list
      .filter((item: any) => item.user_id === userId)
      .map((item: any) => ({
        ...item,
        game: getMockGame(item.game_id)
      }));
  } catch (e) {
    return [];
  }
}

export function getMockPasses(userId: string): any[] {
  try {
    const data = localStorage.getItem(PASSES_KEY);
    if (!data) {
      // Create a default active limited pass for testing
      const defaultPass = {
        id: "mock-pass-id",
        user_id: userId,
        pass_type: "limited",
        status: "active",
        games_allowed: 12,
        games_claimed: 0,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(PASSES_KEY, JSON.stringify([defaultPass]));
      return [defaultPass];
    }
    return JSON.parse(data).filter((item: any) => item.user_id === userId);
  } catch (e) {
    return [];
  }
}

export function getMockPassRequests(userId: string): any[] {
  try {
    const data = localStorage.getItem(PASS_REQUESTS_KEY);
    if (!data) return [];
    return JSON.parse(data).filter((item: any) => item.user_id === userId);
  } catch (e) {
    return [];
  }
}

export function getMockTransactions(userId: string): any[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    if (!data) {
      const defaultTx = {
        id: "mock-tx-1",
        user_id: userId,
        game_id: null,
        pass_id: "mock-pass-id",
        transaction_type: "pass_purchase",
        amount: 1,
        description: "Zakúpenie Limited Pass",
        metadata: {},
        created_at: new Date().toISOString()
      };
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([defaultTx]));
      return [defaultTx];
    }
    return JSON.parse(data).filter((item: any) => item.user_id === userId);
  } catch (e) {
    return [];
  }
}

export function mockClaimGame(userId: string, gameId: number): any {
  // Find active pass
  const passes = getMockPasses(userId);
  const activePass = passes.find(
    (p) =>
      p.status === "active" &&
      new Date(p.expires_at) > new Date() &&
      p.games_claimed < p.games_allowed
  );

  if (!activePass && !passes.some(p => p.pass_type === "unlimited" && p.status === "active")) {
    throw new Error("No active pass with available redemptions.");
  }

  // Check if already claimed
  const userGames = getMockUserGames(userId);
  if (userGames.some((ug) => ug.game_id === gameId)) {
    throw new Error("Game already in library");
  }

  // Get game info
  const game = getMockGame(gameId);
  if (!game) {
    throw new Error("Game not found");
  }

  // Claim
  const newUserGame = {
    id: Math.random().toString(36).substring(7),
    user_id: userId,
    game_id: gameId,
    license_key: "MOCK-KEY-" + Math.random().toString(36).substring(3).toUpperCase() + "-" + Math.random().toString(36).substring(3).toUpperCase(),
    acquired_at: new Date().toISOString(),
    status: "doručené",
  };

  const allUserGames = JSON.parse(localStorage.getItem(USER_GAMES_KEY) || "[]");
  allUserGames.push(newUserGame);
  localStorage.setItem(USER_GAMES_KEY, JSON.stringify(allUserGames));

  // Update pass
  if (activePass) {
    activePass.games_claimed += 1;
    const allPasses = JSON.parse(localStorage.getItem(PASSES_KEY) || "[]");
    const idx = allPasses.findIndex((p: any) => p.id === activePass.id);
    if (idx !== -1) {
      allPasses[idx] = activePass;
      localStorage.setItem(PASSES_KEY, JSON.stringify(allPasses));
    }
  }

  // Create transaction
  const newTx = {
    id: Math.random().toString(36).substring(7),
    user_id: userId,
    game_id: gameId,
    pass_id: activePass?.id || null,
    transaction_type: "game_claim",
    amount: -1,
    description: `Získanie hry: ${game.title}`,
    metadata: { game_title: game.title },
    created_at: new Date().toISOString()
  };

  const allTxs = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "[]");
  allTxs.push(newTx);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTxs));

  return newUserGame;
}

export function mockRequestPass(userId: string, passType: "limited" | "unlimited"): any {
  const newRequest = {
    id: Math.random().toString(36).substring(7),
    user_id: userId,
    pass_type: passType,
    status: "approved", // Auto-approved for simulation convenience
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const allRequests = JSON.parse(localStorage.getItem(PASS_REQUESTS_KEY) || "[]");
  allRequests.push(newRequest);
  localStorage.setItem(PASS_REQUESTS_KEY, JSON.stringify(allRequests));

  // Deactivate any existing active passes
  const allPasses = JSON.parse(localStorage.getItem(PASSES_KEY) || "[]");
  allPasses.forEach((p: any) => {
    if (p.user_id === userId && p.status === "active") {
      p.status = "expired";
    }
  });

  // Create new active pass
  const newPass = {
    id: Math.random().toString(36).substring(7),
    user_id: userId,
    pass_type: passType,
    status: "active",
    games_allowed: passType === "limited" ? 12 : 100,
    games_claimed: 0,
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months
    created_at: new Date().toISOString(),
  };
  allPasses.push(newPass);
  localStorage.setItem(PASSES_KEY, JSON.stringify(allPasses));

  // Create transaction
  const newTx = {
    id: Math.random().toString(36).substring(7),
    user_id: userId,
    game_id: null,
    pass_id: newPass.id,
    transaction_type: "pass_purchase",
    amount: passType === "limited" ? 10 : 15,
    description: `Zakúpenie ${passType === "limited" ? "Limited" : "Unlimited"} Pass`,
    metadata: {},
    created_at: new Date().toISOString()
  };

  const allTxs = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "[]");
  allTxs.push(newTx);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTxs));

  return newRequest;
}

export function mockCancelPassRequest(userId: string, requestId: string): void {
  const allRequests = JSON.parse(localStorage.getItem(PASS_REQUESTS_KEY) || "[]");
  const request = allRequests.find((r: any) => r.id === requestId && r.user_id === userId);
  if (request && request.status === "pending") {
    request.status = "cancelled";
    request.updated_at = new Date().toISOString();
    localStorage.setItem(PASS_REQUESTS_KEY, JSON.stringify(allRequests));
  }
}
