import { del } from "@vercel/blob";

const BLOB_DELETE_BATCH_SIZE = 100;

export function normalizeBlobUrls(urls: (null | string | undefined)[]) {
  return Array.from(
    new Set(urls.filter((url): url is string => Boolean(url?.trim()))),
  );
}

export async function deleteBlobUrls(urls: (null | string | undefined)[]) {
  const normalizedUrls = normalizeBlobUrls(urls);

  if (normalizedUrls.length === 0) {
    return {
      deleted: 0,
    };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to delete stored files.");
  }

  for (let index = 0; index < normalizedUrls.length; index += BLOB_DELETE_BATCH_SIZE) {
    await del(normalizedUrls.slice(index, index + BLOB_DELETE_BATCH_SIZE));
  }

  return {
    deleted: normalizedUrls.length,
  };
}

export async function deleteBlobUrlsAfterFailedSave(
  urls: (null | string | undefined)[],
  saveError: unknown,
): Promise<never> {
  try {
    await deleteBlobUrls(urls);
  } catch (deleteError) {
    throw new AggregateError(
      [saveError, deleteError],
      "Failed to save database record and clean up uploaded file.",
    );
  }

  throw saveError;
}
