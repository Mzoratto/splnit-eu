import { del } from "@vercel/blob";

const BLOB_DELETE_BATCH_SIZE = 100;

export type BlobDeleteFn = (urls: string[]) => Promise<unknown>;

export type AuditedBlobDeleteResult = {
  requested: number;
  deleted: string[];
  skipped: { url: string; reason: string }[];
  failed: { url: string; error: string }[];
};

export function normalizeBlobUrls(urls: (null | string | undefined)[]) {
  return Array.from(
    new Set(
      urls
        .map((url) => url?.trim())
        .filter((url): url is string => Boolean(url)),
    ),
  );
}

export async function deleteBlobUrls(urls: (null | string | undefined)[]) {
  const result = await deleteBlobUrlsAudited(urls, {
    requireToken: true,
  });

  if (result.skipped.length > 0 || result.failed.length > 0) {
    throw new Error(
      `Failed to delete ${result.skipped.length + result.failed.length} stored file(s).`,
    );
  }

  return {
    deleted: result.deleted.length,
  };
}

export async function deleteBlobUrlsAudited(
  urls: (null | string | undefined)[],
  options: {
    deleteFn?: BlobDeleteFn;
    requireToken?: boolean;
  } = {},
): Promise<AuditedBlobDeleteResult> {
  const normalizedUrls = normalizeBlobUrls(urls);
  const result: AuditedBlobDeleteResult = {
    requested: normalizedUrls.length,
    deleted: [],
    skipped: [],
    failed: [],
  };

  if (normalizedUrls.length === 0) {
    return result;
  }

  const deleteFn = options.deleteFn ?? del;
  const requireToken = options.requireToken ?? true;

  if (!process.env.BLOB_READ_WRITE_TOKEN && requireToken) {
    result.skipped.push(
      ...normalizedUrls.map((url) => ({
        url,
        reason: "BLOB_READ_WRITE_TOKEN is required to delete stored files.",
      })),
    );
    return result;
  }

  for (let index = 0; index < normalizedUrls.length; index += BLOB_DELETE_BATCH_SIZE) {
    const batch = normalizedUrls.slice(index, index + BLOB_DELETE_BATCH_SIZE);

    try {
      await deleteFn(batch);
      result.deleted.push(...batch);
    } catch (error) {
      result.failed.push(
        ...batch.map((url) => ({
          url,
          error: error instanceof Error ? error.message : String(error),
        })),
      );
    }
  }

  return result;
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
