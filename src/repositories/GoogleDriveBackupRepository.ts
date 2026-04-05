import { z } from "zod";
import type { IBackupRepository } from "@/domain/repositories/IBackupRepository";
import { validateBackupFavorites } from "@/domain/entities/Favorite";
import type { Favorite } from "@/domain/entities/Favorite";

interface GoogleAuthService {
  signInWithGoogle(): Promise<unknown | null>;
  getStoredToken(): Promise<string | null>;
}

const GoogleDriveFileSchema = z.object({
  id: z.string(),
});

const GoogleDriveListResponseSchema = z.object({
  files: z.array(GoogleDriveFileSchema).optional(),
});

export class GoogleDriveBackupRepository implements IBackupRepository<Favorite> {
  constructor(private readonly auth: GoogleAuthService) {}

  private async getToken(): Promise<string | null> {
    return this.auth.getStoredToken();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  private async ensureAuthenticated(): Promise<string> {
    const auth = await this.auth.signInWithGoogle();
    if (!auth) {
      throw new Error("Authentication failed");
    }
    const token = await this.getToken();
    if (!token) {
      throw new Error("Token not found after authentication");
    }
    return token;
  }

  async upload(data: Favorite[]): Promise<void> {
    const token = await this.ensureAuthenticated();

    const fileMetadata = {
      name: "favorites_backup.json",
      mimeType: "application/json",
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
    );
    form.append(
      "file",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }
  }

  async download(): Promise<Favorite[]> {
    const token = await this.ensureAuthenticated();

    // First, list files to find the backup
    const listResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=name="favorites_backup.json"',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!listResponse.ok) {
      throw new Error("List backup files failed");
    }

    const listData: unknown = await listResponse.json();
    const validatedList = GoogleDriveListResponseSchema.parse(listData);
    if (!validatedList.files || validatedList.files.length === 0) {
      throw new Error("No backup found");
    }

    const fileId = validatedList.files[0].id;

    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!downloadResponse.ok) {
      throw new Error("Download failed");
    }

    const data: unknown = await downloadResponse.json();
    const validatedData = validateBackupFavorites(data);

    return validatedData;
  }
}
