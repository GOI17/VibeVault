import type { IFavoriteRepository } from "@/domain/repositories/IFavoriteRepository";
import type { Favorite, FavoriteInput, MediaType } from "@/domain/entities/Favorite";

/**
 * Mock implementation of IFavoriteRepository for testing
 * Uses in-memory Map instead of AsyncStorage
 */
export class MockFavoriteRepository implements IFavoriteRepository {
  private favorites: Map<string, Favorite> = new Map();

  async getByMediaType(mediaType?: MediaType): Promise<Favorite[]> {
    const allFavorites = Array.from(this.favorites.values());

    if (!mediaType) {
      return allFavorites;
    }

    return allFavorites.filter((f) => f.mediaType === mediaType);
  }

  async getAll(): Promise<Favorite[]> {
    return Array.from(this.favorites.values());
  }

  async add(favorite: FavoriteInput): Promise<Favorite> {
    const newFavorite: Favorite = {
      ...favorite,
      addedAt: new Date().toISOString(),
    };
    this.favorites.set(favorite.id, newFavorite);
    return newFavorite;
  }

  async remove(id: string): Promise<void> {
    this.favorites.delete(id);
  }

  async update(
    id: string,
    favoriteUpdate: Partial<FavoriteInput>
  ): Promise<Favorite> {
    const existing = this.favorites.get(id);
    if (!existing) {
      throw new Error(`Favorite with id ${id} not found`);
    }
    const updated: Favorite = {
      ...existing,
      ...favoriteUpdate,
      id, // Ensure id doesn't change
      addedAt: existing.addedAt, // Preserve original timestamp
    };
    this.favorites.set(id, updated);
    return updated;
  }

  async exists(id: string): Promise<boolean> {
    return this.favorites.has(id);
  }

  async getById(id: string): Promise<Favorite | null> {
    return this.favorites.get(id) || null;
  }

  // Helper for testing
  clear(): void {
    this.favorites.clear();
  }

  // Helper for testing
  seed(favorites: Favorite[]): void {
    favorites.forEach((favorite) => this.favorites.set(favorite.id, favorite));
  }
}
