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

