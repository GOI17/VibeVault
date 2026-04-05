import type { IBackupRepository } from "@/domain/repositories/IBackupRepository";

export class MockBackupRepository<T> implements IBackupRepository<T> {
  private data: T[] = [];
  private authenticated = false;

  setAuthenticated(value: boolean): void {
    this.authenticated = value;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.authenticated;
  }

  async upload(data: T[]): Promise<void> {
    if (!this.authenticated) {
      throw new Error("Not authenticated");
    }
    this.data = [...data];
  }

  async download(): Promise<T[]> {
    if (!this.authenticated) {
      throw new Error("Not authenticated");
    }
    return [...this.data];
  }

  // Helper for testing
  clear(): void {
    this.data = [];
    this.authenticated = false;
  }

  // Helper for testing - seed data
  seed(data: T[]): void {
    this.data = [...data];
  }
}
