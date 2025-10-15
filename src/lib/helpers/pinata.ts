import { PinataSDK } from "pinata";

/**
 * Pinata IPFS utility functions for uploading and retrieving content
 * Uses custom Pinata gateway: rose-magnificent-capybara-641.mypinata.cloud
 */

// Custom Pinata Gateway
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  "rose-magnificent-capybara-641.mypinata.cloud";

// Initialize Pinata client
let pinataClient: PinataSDK | null = null;

function getPinataClient(): PinataSDK {
  if (!pinataClient) {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!jwt) {
      throw new Error("NEXT_PUBLIC_PINATA_JWT is not configured");
    }
    pinataClient = new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: PINATA_GATEWAY,
    });
  }
  return pinataClient;
}

/**
 * Upload a file to IPFS via Pinata
 * @param file - File object or Blob to upload
 * @param fileName - Optional custom file name
 * @returns IPFS CID (hash)
 */
export async function uploadFileToPinata(
  file: File | Blob,
  fileName?: string,
): Promise<string> {
  try {
    const pinata = getPinataClient();

    // Convert Blob to File if needed
    const fileToUpload =
      file instanceof File
        ? file
        : new File([file], fileName || `file-${Date.now()}`, {
            type: file.type,
          });

    console.log("📤 Uploading file to Pinata:", fileToUpload.name);

    // Use public upload for files
    const upload = await pinata.upload.public.file(fileToUpload);

    console.log("✅ File uploaded to Pinata, CID:", upload.cid);
    return upload.cid;
  } catch (error) {
    console.error("❌ Failed to upload file to Pinata:", error);
    throw error;
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param data - JSON object to upload
 * @param fileName - Optional custom file name
 * @returns IPFS CID (hash)
 */
export async function uploadJSONToPinata(
  data: any,
  fileName?: string,
): Promise<string> {
  try {
    const pinata = getPinataClient();

    console.log("📤 Uploading JSON to Pinata:", fileName || "metadata");

    // Use public upload for JSON with builder pattern
    const upload = await pinata.upload.public
      .json(data)
      .name(fileName || `metadata-${Date.now()}.json`);

    console.log("✅ JSON uploaded to Pinata, CID:", upload.cid);
    return upload.cid;
  } catch (error) {
    console.error("❌ Failed to upload JSON to Pinata:", error);
    throw error;
  }
}

/**
 * Download and parse JSON metadata from IPFS via Pinata Gateway
 * @param cid - IPFS CID (hash)
 * @returns Parsed JSON object
 */
export async function downloadJSONFromPinata(cid: string): Promise<any> {
  try {
    const pinata = getPinataClient();

    console.log("📥 Downloading JSON from Pinata, CID:", cid);

    // Use Pinata's public gateway to fetch the data
    const data = await pinata.gateways.public.get(cid);

    console.log("✅ JSON downloaded from Pinata");
    return data.data;
  } catch (error) {
    console.error("❌ Failed to download from Pinata:", error);
    // throw error;
  }
}

/**
 * Get Pinata gateway URL for a CID
 * @param cid - IPFS CID (hash)
 * @returns Gateway URL
 */
export function getPinataGatewayUrl(cid: string): string {
  return `https://${PINATA_GATEWAY}/ipfs/${cid}`;
}

/**
 * Convert IPFS URI to Pinata gateway URL
 * @param uri - IPFS URI (ipfs://...) or CID
 * @returns Gateway URL
 */
export function resolvePinataUri(uri: string): string {
  if (!uri) return "";

  if (uri.startsWith("ipfs://")) {
    const cid = uri.replace("ipfs://", "");
    return getPinataGatewayUrl(cid);
  }

  // If it's already a URL, return as-is
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  // Assume it's a CID
  return getPinataGatewayUrl(uri);
}
