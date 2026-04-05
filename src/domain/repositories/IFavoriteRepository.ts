import { Favorite, FavoriteInput, MediaType } from "@/domain/entities/Favorite";

/**
 * Repository interface for Favorite operations
 * Abstracts the storage mechanism (AsyncStorage, API, etc.)
 */
export interface IFavoriteRepository {
  /**
   * Get all favorites, optionally filtered by media type
   * @param mediaType - Optional filter for movie or series
   */
  getByMediaType(mediaType?: MediaType): Promise<Favorite[]>;

  /**
   * Get all favorites
   */
  getAll(): Promise<Favorite[]>;

  /**
   * Add a new favorite
   * @throws Error if favorite with same id already exists
   */
  add(favorite: FavoriteInput): Promise<Favorite>;

  /**
   * Remove a favorite by id
   */
  remove(id: string): Promise<void>;

  /**
   * Update a favorite
   * @throws Error if favorite not found
   */
  update(id: string, favorite: Partial<FavoriteInput>): Promise<Favorite>;

  /**
   * Check if a favorite exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get a single favorite by id
   * Returns null if not found
   */
  getById(id: string): Promise<Favorite | null>;
}
