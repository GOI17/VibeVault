import { cacheDirectory, documentDirectory, writeAsStringAsync, EncodingType } from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { IExportRepository } from "@/domain/repositories/IExportRepository";

export class ExpoExportRepository implements IExportRepository {
  async shareText(filename: string, mimeType: string, content: string): Promise<void> {
    const directory = cacheDirectory ?? documentDirectory;
    if (!directory) {
      throw new Error("No writable directory available");
    }

    const uri = `${directory}${filename}`;
    await writeAsStringAsync(uri, content, { encoding: EncodingType.UTF8 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename });
    } else {
      // Fallback for environments without native sharing.
      console.log("Sharing not available; exported content:", content);
    }
  }
}
