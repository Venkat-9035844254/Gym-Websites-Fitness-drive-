import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary server-side using environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== "demo" &&
  cloudName !== "your_cloud_name"
);

cloudinary.config({
  cloud_name: cloudName || "demo",
  api_key: apiKey || "",
  api_secret: apiSecret || "",
  secure: true,
});

export { cloudinary };

/**
 * Builds an optimized HTTPS Cloudinary image delivery URL with automatic format and quality (f_auto, q_auto).
 */
export function buildOptimizedImageUrl(
  publicIdOrUrl: string,
  cloudNameOverride?: string
): string {
  const currentCloud = cloudNameOverride || cloudName || "demo";

  // If already a full URL
  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    // If it's a Cloudinary URL without f_auto,q_auto, insert transformations
    if (publicIdOrUrl.includes("res.cloudinary.com") && !publicIdOrUrl.includes("/f_auto,q_auto/")) {
      return publicIdOrUrl.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    // Ensure HTTPS
    return publicIdOrUrl.replace("http://", "https://");
  }

  // Clean leading slashes
  const cleanPublicId = publicIdOrUrl.replace(/^\/+/, "");

  return `https://res.cloudinary.com/${currentCloud}/image/upload/f_auto,q_auto/${cleanPublicId}`;
}
