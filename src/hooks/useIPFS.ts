"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { download, resolveScheme, upload } from "thirdweb/storage";
import {
  extractCID,
  isHTTPUri,
  isIPFSUri,
  resolveIPFSToHttp,
} from "@/lib/helpers/ipfs";
import { useWeb3 } from "@/providers/web3-provider";

/**
 * Optimized IPFS hook using native React state and Thirdweb storage functions
 * - Efficient upload operations with proper error handling
 * - Built-in caching for downloads and URI resolution
 * - Native React state management without external dependencies
 */
export function useIPFS() {
  const { client } = useWeb3();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  // Core upload function with error handling and loading states
  const uploadFiles = useCallback(
    async (
      files: (File | string | { name: string; data: unknown })[],
    ): Promise<string[]> => {
      if (!client) {
        throw new Error("Thirdweb client not initialized");
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        console.log(`📤 Uploading ${files.length} items to IPFS...`);

        const uris = await upload({ client, files });

        if (!uris || uris.length === 0) {
          throw new Error("No URIs returned from upload");
        }

        console.log("✅ Upload successful:", uris);
        return uris;
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Unknown upload error");
        setUploadError(err);
        console.error("❌ Upload failed:", err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [client],
  );

  // Convenient wrapper functions with optimized signatures
  const uploadJSON = useCallback(
    async (
      data: Record<string, unknown>,
      name = "metadata.json",
    ): Promise<string> => {
      const uris = await uploadFiles([{ name, data }]);
      return uris[0];
    },
    [uploadFiles],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      const uris = await uploadFiles([file]);
      return uris[0];
    },
    [uploadFiles],
  );

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Upload methods
      uploadJSON,
      uploadFile,
      uploadFiles,

      // Loading states
      isUploading,

      // Error states
      uploadError,

      // Utility functions (no network calls)
      extractCID,
      isIPFSUri,
      isHTTPUri,
      resolveIPFSToHttp,
    }),
    [uploadJSON, uploadFile, uploadFiles, isUploading, uploadError],
  );
}

/**
 * Hook for downloading IPFS content with native caching
 * @param uri - IPFS URI to download
 * @param enabled - Whether to enable automatic fetching
 */
export function useIPFSDownload(uri: string | null, enabled: boolean = true) {
  const { client } = useWeb3();
  const [data, setData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Simple cache to avoid re-downloading same URIs
  const cache = useMemo(() => new Map<string, unknown>(), []);

  const downloadData = useCallback(
    async (targetUri: string) => {
      if (!client) {
        throw new Error("Thirdweb client not initialized");
      }

      // Check cache first
      if (cache.has(targetUri)) {
        const cachedData = cache.get(targetUri);
        setData(cachedData);
        return cachedData;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("📥 Downloading from IPFS:", targetUri);

        const file = await download({ client, uri: targetUri });

        // Try to parse as JSON first, fallback to text
        let result: unknown;
        try {
          result = await file.json();
          console.log("✅ Downloaded JSON data");
        } catch {
          result = await file.text();
          console.log("✅ Downloaded text data");
        }

        // Cache the result
        cache.set(targetUri, result);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Download failed");
        setError(error);
        console.error("❌ Download failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, cache],
  );

  // Auto-fetch when enabled and URI is available
  useEffect(() => {
    if (enabled && uri && client) {
      downloadData(uri).catch(() => {
        // Error is already handled in downloadData
      });
    }
  }, [enabled, uri, client, downloadData]);

  return useMemo(
    () => ({
      data,
      isLoading,
      error,
      downloadData,
      refetch: () => (uri ? downloadData(uri) : Promise.resolve(null)),
    }),
    [data, isLoading, error, downloadData, uri],
  );
}

/**
 * Hook for resolving IPFS URIs to HTTP URLs with native caching
 * @param ipfsUri - IPFS URI to resolve
 * @param enabled - Whether to enable automatic resolution
 */
export function useIPFSResolve(
  ipfsUri: string | null,
  enabled: boolean = true,
) {
  const { client } = useWeb3();
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache for resolved URIs (they don't change)
  const resolveCache = useMemo(() => new Map<string, string>(), []);

  const resolveUri = useCallback(
    async (targetUri: string) => {
      if (!client) {
        throw new Error("Thirdweb client not initialized");
      }

      // Check cache first
      if (resolveCache.has(targetUri)) {
        const cached = resolveCache.get(targetUri);
        if (cached) {
          setResolvedUri(cached);
          return cached;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔗 Resolving IPFS URI:", targetUri);

        const resolved = await resolveScheme({
          client,
          uri: targetUri,
        });

        console.log("✅ URI resolved:", resolved);

        // Cache the result
        resolveCache.set(targetUri, resolved);
        setResolvedUri(resolved);
        return resolved;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Resolution failed");
        setError(error);
        console.error("❌ URI resolution failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, resolveCache],
  );

  // Auto-resolve when enabled and URI is a valid IPFS URI
  useEffect(() => {
    if (enabled && ipfsUri && client && isIPFSUri(ipfsUri)) {
      resolveUri(ipfsUri).catch(() => {
        // Error is already handled in resolveUri
      });
    }
  }, [enabled, ipfsUri, client, resolveUri]);

  return useMemo(
    () => ({
      data: resolvedUri,
      isLoading,
      error,
      resolveUri,
      refetch: () => (ipfsUri ? resolveUri(ipfsUri) : Promise.resolve(null)),
    }),
    [resolvedUri, isLoading, error, resolveUri, ipfsUri],
  );
}

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use useIPFS().uploadJSON instead */
export const useUploadJSON = () => {
  console.warn("useUploadJSON is deprecated. Use useIPFS().uploadJSON instead");
  const { uploadJSON, isUploading, uploadError } = useIPFS();
  return { uploadJSON, isLoading: isUploading, error: uploadError };
};

/** @deprecated Use useIPFS().uploadFile instead */
export const useUploadFile = () => {
  console.warn("useUploadFile is deprecated. Use useIPFS().uploadFile instead");
  const { uploadFile, isUploading, uploadError } = useIPFS();
  return { uploadFile, isLoading: isUploading, error: uploadError };
};

/** @deprecated Use useIPFS().uploadFiles instead */
export const useUploadFiles = () => {
  console.warn(
    "useUploadFiles is deprecated. Use useIPFS().uploadFiles instead",
  );
  const { uploadFiles, isUploading, uploadError } = useIPFS();
  return { uploadFiles, isLoading: isUploading, error: uploadError };
};

/** @deprecated Use useIPFSDownload() instead */
export const useDownloadIPFS = () => {
  console.warn("useDownloadIPFS is deprecated. Use useIPFSDownload() instead");
  return {
    downloadIPFS: () => Promise.resolve(null),
    isLoading: false,
    error: null,
  };
};

/** @deprecated Use useIPFSResolve() instead */
export const useResolveIPFS = () => {
  console.warn("useResolveIPFS is deprecated. Use useIPFSResolve() instead");
  return {
    resolveIPFS: () => Promise.resolve(null),
    isLoading: false,
    error: null,
  };
};
