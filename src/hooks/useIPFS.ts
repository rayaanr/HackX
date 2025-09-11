"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { upload, download, resolveScheme } from "thirdweb/storage";
import { useWeb3 } from "@/providers/web3-provider";
import { 
  extractCID, 
  isIPFSUri, 
  isHTTPUri, 
  resolveIPFSToHttp 
} from "@/lib/helpers/ipfs";

/**
 * Optimized IPFS hook using proper React Query patterns
 * - useMutation for write operations (upload)
 * - useQuery for read operations (download, resolve) with caching
 */
export function useIPFS() {
  const { client } = useWeb3();

  // Upload mutation (write operation)
  const uploadMutation = useMutation({
    mutationFn: async ({
      files,
      type = "auto"
    }: {
      files: (File | string | { name: string; data: any })[];
      type?: "auto" | "json" | "file";
    }) => {
      if (!client) {
        throw new Error("Thirdweb client not initialized");
      }

      console.log(`📤 Uploading ${files.length} items to IPFS...`);
      
      const uris = await upload({
        client,
        files,
      });

      if (!uris || uris.length === 0) {
        throw new Error("No URIs returned from upload");
      }

      console.log("✅ Upload successful:", uris);
      return uris;
    },
    onError: (error) => {
      console.error("❌ Upload failed:", error);
    },
  });

  // Convenient wrapper functions for upload
  const uploadJSON = (data: Record<string, any>, name = "metadata.json") =>
    uploadMutation.mutateAsync({
      files: [{ name, data }],
      type: "json",
    }).then(uris => uris[0]);

  const uploadFile = (file: File) =>
    uploadMutation.mutateAsync({
      files: [file],
      type: "file",
    }).then(uris => uris[0]);

  const uploadFiles = (files: (File | string | { name: string; data: any })[]) =>
    uploadMutation.mutateAsync({ files });

  return {
    // Upload methods (write operations)
    uploadJSON,
    uploadFile,
    uploadFiles,
    uploadMutation,
    
    // Loading states
    isUploading: uploadMutation.isPending,
    
    // Error states
    uploadError: uploadMutation.error,
    
    // Utility functions (no network calls)
    extractCID,
    isIPFSUri,
    isHTTPUri,
    resolveIPFSToHttp,
  };
}

/**
 * Hook for downloading IPFS content with caching (read operation)
 * @param uri - IPFS URI to download
 * @param enabled - Whether to enable the query
 */
export function useIPFSDownload(uri: string | null, enabled: boolean = true) {
  const { client } = useWeb3();

  return useQuery({
    queryKey: ["ipfs-download", uri],
    queryFn: async () => {
      if (!client || !uri) {
        throw new Error("Client or URI not available");
      }

      console.log("📥 Downloading from IPFS:", uri);
      
      const file = await download({
        client,
        uri,
      });

      // Try to parse as JSON first, fallback to text
      try {
        const data = await file.json();
        console.log("✅ Downloaded JSON data");
        return data;
      } catch {
        const text = await file.text();
        console.log("✅ Downloaded text data");
        return text;
      }
    },
    enabled: enabled && !!client && !!uri,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for resolving IPFS URIs to HTTP URLs with caching (read operation)
 * @param ipfsUri - IPFS URI to resolve
 * @param enabled - Whether to enable the query
 */
export function useIPFSResolve(ipfsUri: string | null, enabled: boolean = true) {
  const { client } = useWeb3();

  return useQuery({
    queryKey: ["ipfs-resolve", ipfsUri],
    queryFn: async () => {
      if (!client || !ipfsUri) {
        throw new Error("Client or URI not available");
      }

      console.log("🔗 Resolving IPFS URI:", ipfsUri);
      
      const resolvedUri = await resolveScheme({ 
        client, 
        uri: ipfsUri 
      });
      
      console.log("✅ URI resolved:", resolvedUri);
      return resolvedUri;
    },
    enabled: enabled && !!client && !!ipfsUri && isIPFSUri(ipfsUri),
    staleTime: 10 * 60 * 1000, // 10 minutes (URLs don't change)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use useIPFS().uploadJSON instead */
export const useUploadJSON = () => {
  const { uploadJSON, isUploading, uploadError } = useIPFS();
  return { uploadJSON, isLoading: isUploading, error: uploadError };
};

/** @deprecated Use useIPFS().uploadFile instead */
export const useUploadFile = () => {
  const { uploadFile, isUploading, uploadError } = useIPFS();
  return { uploadFile, isLoading: isUploading, error: uploadError };
};

/** @deprecated Use useIPFS().uploadFiles instead */
export const useUploadFiles = () => {
  const { uploadFiles, isUploading, uploadError } = useIPFS();
  return { uploadFiles, isLoading: isUploading, error: uploadError };
};

/** @deprecated Use useIPFSDownload() instead */
export const useDownloadIPFS = () => {
  console.warn("useDownloadIPFS is deprecated. Use useIPFSDownload() instead");
  return { downloadIPFS: () => {}, isLoading: false, error: null };
};

/** @deprecated Use useIPFSResolve() instead */
export const useResolveIPFS = () => {
  console.warn("useResolveIPFS is deprecated. Use useIPFSResolve() instead");
  return { resolveIPFS: () => {}, isLoading: false, error: null };
};