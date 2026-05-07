import { createServiceRoleClient } from "@/utils/supabase/service-role";

const BUCKET_NAME = "generation-results";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function inferExtension(url: string, contentType: string | null) {
  if (contentType?.includes("jpeg")) return "jpg";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("png")) return "png";

  const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  return match?.[1]?.toLowerCase() || "png";
}

async function ensureBucketExists() {
  const admin = createServiceRoleClient();
  const { data: bucket } = await admin.storage.getBucket(BUCKET_NAME);

  if (!bucket) {
    const { error } = await admin.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });

    if (error) {
      throw error;
    }
  } else {
    await admin.storage.updateBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
  }

  return admin;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs?: number) {
  if (!timeoutMs || timeoutMs <= 0) {
    return promise;
  }

  return await Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(`Image persistence timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

export async function persistGeneratedImagesToStorage({
  generationId,
  imageUrls,
  timeoutMs,
}: {
  generationId: string;
  imageUrls: string[];
  timeoutMs?: number;
}) {
  const admin = await ensureBucketExists();

  return await withTimeout((async () => {
    const storedUrls: string[] = [];

    for (let index = 0; index < imageUrls.length; index += 1) {
      const imageUrl = imageUrls[index];
      const response = await fetch(imageUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to download generated image: ${response.status}`);
      }

      const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
      const buffer = Buffer.from(await response.arrayBuffer());
      const objectPath = `${generationId}/${index + 1}-${crypto.randomUUID()}.${inferExtension(imageUrl, contentType)}`;

      const { error } = await admin.storage.from(BUCKET_NAME).upload(objectPath, buffer, {
        contentType,
        cacheControl: "31536000",
        upsert: true,
      });

      if (error) {
        throw error;
      }

      const { data } = admin.storage.from(BUCKET_NAME).getPublicUrl(objectPath);
      storedUrls.push(data.publicUrl);
    }

    return storedUrls;
  })(), timeoutMs);
}
