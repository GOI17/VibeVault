export interface IBackupRepository<T> {
  upload(data: T[]): Promise<void>;
  download(): Promise<T[]>;
  isAuthenticated(): Promise<boolean>;
}
