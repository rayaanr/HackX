import type { ThirdwebClient } from "thirdweb";
import { upload } from "thirdweb/storage";

/**
 * IPFS utility functions for resolving URIs and handling IPFS content
 */

/**
 * Convert IPFS URI to HTTP URL using a public gateway
 * @param uri - IPFS URI (ipfs://...) or regular URL
 * @returns HTTP URL or original URL if not IPFS
 */
export function resolveIPFSToHttp(uri: string | undefined | null): string {
  if (!uri) return "/placeholder.svg";

  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return `https://dweb.link/ipfs/${cid}`;
  }

  return uri;
}

/**
 * Check if a URL is a blob URL or data URL that needs to be uploaded to IPFS
 * @param url - The URL to check
 * @returns true if the URL needs to be uploaded to IPFS
 */
export function needsIPFSUpload(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith("blob:") || url.startsWith("data:");
}

/**
 * Upload an image to IPFS from a blob URL or data URL
 * @param client - Thirdweb client
 * @param url - The blob URL or data URL to upload
 * @returns IPFS hash (CID) or null if upload fails
 */
export async function uploadImageToIPFS(
  client: ThirdwebClient,
  url: string,
): Promise<string | null> {
  try {
    // Fetch blob data (this works for blob: and data: URLs)
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Create a File object from the blob
    const fileName = `image-${Date.now()}.${blob.type.split("/")[1] || "png"}`;
    const file = new File([blob], fileName, { type: blob.type });

    // Upload to IPFS using thirdweb
    const uris = await upload({
      client,
      files: [file],
    });

    if (!uris) {
      throw new Error("Failed to upload image to IPFS");
    }

    // Extract CID from IPFS URI
    const cid = uris.replace("ipfs://", "");

    return cid;
  } catch (error) {
    console.error("❌ Failed to upload image to IPFS:", error);
    return null;
  }
}

/**
 * Process an image URL - upload to IPFS if needed, otherwise return as-is
 * @param client - Thirdweb client
 * @param url - The image URL to process
 * @returns IPFS URI (ipfs://...) if uploaded, original URL if already hosted, or null
 */
export async function processImageForIPFS(
  client: ThirdwebClient,
  url: string | undefined | null,
): Promise<string | null> {
  if (!url) return null;

  // If it's already an IPFS URI, return as-is
  if (url.startsWith("ipfs://")) {
    console.log("📌 Image already on IPFS:", url.substring(0, 50) + "...");
    return url;
  }

  // If it's an HTTP/HTTPS URL (external URL like DropOver, Unsplash, etc.)
  // Keep it as-is to avoid CORS issues
  if (url.startsWith("http://") || url.startsWith("https://")) {
    console.log(
      "🔗 External URL detected, keeping as-is:",
      url.substring(0, 80) + "...",
    );
    return url;
  }

  // Only upload blob/data URLs (from actual file uploads) to IPFS
  if (needsIPFSUpload(url)) {
    const urlPreview = url.length > 100 ? url.substring(0, 100) + "..." : url;
    console.log("🔄 Uploading local file to IPFS...");
    const cid = await uploadImageToIPFS(client, url);
    if (cid) {
      console.log(`✅ Image uploaded to IPFS successfully!`);
      console.log(`   IPFS URI: ipfs://${cid}`);
      console.log(`   Gateway URL: https://dweb.link/ipfs/${cid}`);
      return `ipfs://${cid}`;
    } else {
      console.warn("⚠️ Failed to upload image to IPFS");
      return null;
    }
  }

  return url;
}
