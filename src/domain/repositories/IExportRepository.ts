export interface IExportRepository {
  /**
   * Share a plain-text payload (CSV, JSON, etc.) through the native share sheet.
   *
   * @param filename Suggested file name, including extension.
   * @param mimeType MIME type of the payload.
   * @param content Raw content to share.
   */
  shareText(filename: string, mimeType: string, content: string): Promise<void>;
}
