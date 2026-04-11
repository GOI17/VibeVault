import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IFavoriteRepository } from "@/domain/repositories/IFavoriteRepository";
import {
  validateAndMigrateFavorites,
  validateFavorite,
} from "@/domain/entities/Favorite";
import type { Favorite, FavoriteInput, MediaType } from "@/domain/entities/Favorite";

const STORAGE_KEY = "favorite_movies";
const MIGRATION_FLAG = "favorite_movies_migrated";

/**
 * AsyncStorage implementation of IFavoriteRepository
 * Validates all data with Zod on read/write
 */
export class AsyncStorageFavoriteRepository implements IFavoriteRepository {
  /**
   * Get favorites filtered by media type
   * Implements lazy migration on first read
   */
  async getByMediaType(mediaType?: MediaType): Promise<Favorite[]> {
    // Run lazy migration check on first read
    await this.runLazyMigration();

    const favorites = await this.getAll();

    if (!mediaType) {
      return favorites;
    }

    return favorites.filter((f) => f.mediaType === mediaType);
  }

  /**
   * Lazy migration - runs only once on first access
   * Transforms legacy data to new schema
   */
  private async runLazyMigration(): Promise<void> {
    const isMigrated = await AsyncStorage.getItem(MIGRATION_FLAG);

    if (isMigrated === "true") {
      return; // Already migrated
    }

    try {
      const storage = await AsyncStorage.getItem(STORAGE_KEY);

      if (!storage) {
        // No data to migrate - just set flag
        await AsyncStorage.setItem(MIGRATION_FLAG, "true");
        return;
      }

      const parsed: unknown = JSON.parse(storage);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        await AsyncStorage.setItem(MIGRATION_FLAG, "true");
        return;
      }

      // Migrate data - add mediaType to legacy items
      const migratedData = validateAndMigrateFavorites(parsed);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migratedData));
      await AsyncStorage.setItem(MIGRATION_FLAG, "true");

      console.log("Favorites migration completed:", migratedData.length, "items");
    } catch (error) {
      console.error("Favorites migration failed:", error);
      // Don't throw - let app continue with legacy data
    }
  }

  async getAll(): Promise<Favorite[]> {
    const storage = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storage) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(storage);

      // Validate and migrate data (handles old formats)
      if (Array.isArray(parsed)) {
        return validateAndMigrateFavorites(parsed);
      }

      console.warn("Invalid favorites data format, returning empty array");
      return [];
    } catch (error) {
      console.error("Failed to parse favorites from storage:", error);
      // Return empty array on parse error (data corruption)
      return [];
    }
  }

  async add(favorite: FavoriteInput): Promise<Favorite> {
    // Validate input
    const validatedInput = validateFavorite({
      ...favorite,
      addedAt: new Date().toISOString(),
    });

    const favorites = await this.getAll();

    // Check for duplicates
    if (favorites.find((f) => f.id === validatedInput.id)) {
      throw new Error(`Favorite with id ${validatedInput.id} already exists`);
    }

    const newFavorite: Favorite = {
      ...validatedInput,
      addedAt: new Date().toISOString(),
    };

    favorites.push(newFavorite);

    // Validate entire array before saving
    const validatedFavorites = validateAndMigrateFavorites(favorites);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(validatedFavorites)
    );

    return newFavorite;
  }

  async remove(id: string): Promise<void> {
    const favorites = await this.getAll();
    const updated = favorites.filter((f) => f.id !== id);

    // Validate before saving
    const validatedFavorites = validateAndMigrateFavorites(updated);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(validatedFavorites)
    );
  }

  async update(
    id: string,
    favoriteUpdate: Partial<FavoriteInput>
  ): Promise<Favorite> {
    const favorites = await this.getAll();
    const index = favorites.findIndex((f) => f.id === id);

    if (index === -1) {
      throw new Error(`Favorite with id ${id} not found`);
    }

    // Merge and validate
    const updatedFavorite: Favorite = {
      ...favorites[index],
      ...favoriteUpdate,
      id, // Ensure id doesn't change
      addedAt: favorites[index].addedAt, // Preserve original timestamp
    };

    // Validate the updated favorite
    const validated = validateFavorite(updatedFavorite);

    favorites[index] = validated;

    // Validate entire array before saving
    const validatedFavorites = validateAndMigrateFavorites(favorites);

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(validatedFavorites)
    );

    return validated;
  }

  async exists(id: string): Promise<boolean> {
    const favorites = await this.getAll();
    return favorites.some((f) => f.id === id);
  }

  async getById(id: string): Promise<Favorite | null> {
    const favorites = await this.getAll();
    return favorites.find((f) => f.id === id) || null;
  }

  /**
   * Utility method to clear all favorites (for testing)
   */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Export favorites to JSON string (for backup)
   */
  async exportToJSON(): Promise<string> {
    const favorites = await this.getAll();
    return JSON.stringify(favorites, null, 2);
  }

  /**
   * Import favorites from JSON string (for restore)
   * Validates all data before import
   */
  async importFromJSON(json: string): Promise<Favorite[]> {
    try {
      const parsed: unknown = JSON.parse(json);

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid import format: expected array");
      }

      const validated = validateAndMigrateFavorites(parsed);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validated));

      return validated;
    } catch (error) {
      throw new Error(
        `Failed to import favorites: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
