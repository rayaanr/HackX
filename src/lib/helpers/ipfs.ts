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
    return `https://ipfs.io/ipfs/${cid}`;
  }

  return uri;
}

/**
 * Extract CID from IPFS URI
 * @param uri - IPFS URI
 * @returns CID string or empty string
 */
export function extractCID(uri: string): string {
  return uri.replace("ipfs://", "");
}

/**
 * Check if URI is an IPFS URI
 * @param uri - URI to check
 * @returns boolean
 */
export function isIPFSUri(uri: string): boolean {
  return uri.startsWith("ipfs://");
}

/**
 * Check if URI is an HTTP/HTTPS URI
 * @param uri - URI to check
 * @returns boolean
 */
export function isHTTPUri(uri: string): boolean {
  return uri.startsWith("http://") || uri.startsWith("https://");
}
