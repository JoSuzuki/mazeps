import type { GameState } from './santorini'

declare global {
  namespace PrismaJson {
    type SantoriniGameState = GameState
  }
}

// This file must be a module.
export {}
