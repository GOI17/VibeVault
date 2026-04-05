import type { Favorite } from "@/domain/entities/Favorite";
import type { IBackupRepository } from "@/domain/repositories/IBackupRepository";

export const uploadToDrive = async (
  backupRepository: IBackupRepository<Favorite>,
  data: Favorite[],
): Promise<void> => {
  await backupRepository.upload(data);
};

export const downloadFromDrive = async (
  backupRepository: IBackupRepository<Favorite>,
): Promise<Favorite[]> => {
  return await backupRepository.download();
};
