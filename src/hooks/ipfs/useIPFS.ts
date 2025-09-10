"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadToIPFS, viewFromIPFS } from "@/lib/ipfs";
import type { IPFSUploadOptions, IPFSUploadResponse, IPFSViewResponse } from "@/lib/ipfs";

// Hook for uploading data to IPFS
export function useIPFSUpload() {
  return useMutation({
    mutationFn: async (options: IPFSUploadOptions): Promise<IPFSUploadResponse> => {
      console.log("Uploading to IPFS:", options.name || "unnamed");
      
      try {
        const result = await uploadToIPFS(options);
        console.log("IPFS upload successful:", result);
        return result;
      } catch (error) {
        console.error("IPFS upload failed:", error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes("network")) {
            throw new Error("Network error while uploading to IPFS. Please check your internet connection and try again.");
          }
          if (error.message.includes("timeout")) {
            throw new Error("Upload timeout. The file may be too large or the network is slow. Please try again.");
          }
          if (error.message.includes("unauthorized") || error.message.includes("401")) {
            throw new Error("IPFS authorization failed. Please check your Pinata JWT configuration.");
          }
          if (error.message.includes("quota") || error.message.includes("limit")) {
            throw new Error("IPFS storage quota exceeded. Please upgrade your Pinata plan or contact support.");
          }
        }
        
        throw new Error(
          error instanceof Error ? error.message : "Failed to upload to IPFS. Please try again."
        );
      }
    },
    onSuccess: (data) => {
      console.log("IPFS upload completed:", {
        cid: data.cid,
        size: data.size,
        fileName: data.fileName,
      });
    },
    onError: (error) => {
      console.error("IPFS upload hook error:", error);
    },
  });
}

// Hook for retrieving data from IPFS
export function useIPFSView() {
  return useMutation({
    mutationFn: async (uri: string): Promise<IPFSViewResponse> => {
      console.log("Retrieving from IPFS:", uri);
      
      try {
        const result = await viewFromIPFS(uri);
        console.log("IPFS retrieval successful:", result.cid);
        return result;
      } catch (error) {
        console.error("IPFS retrieval failed:", error);
        
        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes("not found") || error.message.includes("404")) {
            throw new Error("Content not found on IPFS. The hash may be invalid or the content may have been removed.");
          }
          if (error.message.includes("network")) {
            throw new Error("Network error while retrieving from IPFS. Please check your internet connection and try again.");
          }
          if (error.message.includes("timeout")) {
            throw new Error("Retrieval timeout. The IPFS network may be slow. Please try again.");
          }
        }
        
        throw new Error(
          error instanceof Error ? error.message : "Failed to retrieve from IPFS. Please try again."
        );
      }
    },
    onSuccess: (data) => {
      console.log("IPFS retrieval completed:", {
        cid: data.cid,
        gatewayUrl: data.gatewayUrl,
      });
    },
    onError: (error) => {
      console.error("IPFS retrieval hook error:", error);
    },
  });
}

// Combined IPFS hook with both upload and view functionality
export function useIPFS() {
  const upload = useIPFSUpload();
  const view = useIPFSView();

  return {
    // Upload functionality
    upload: upload.mutate,
    uploadAsync: upload.mutateAsync,
    isUploading: upload.isPending,
    uploadError: upload.error,
    uploadData: upload.data,
    
    // View functionality  
    view: view.mutate,
    viewAsync: view.mutateAsync,
    isViewing: view.isPending,
    viewError: view.error,
    viewData: view.data,
    
    // Combined states
    isLoading: upload.isPending || view.isPending,
    error: upload.error || view.error,
  };
}

// Helper function to create filtering key-values for Pinata
function createFilteringKeyValues(metadata: Record<string, any>) {
  const keyValues: Record<string, string> = {};
  
  // Add techStack filters (convert array to comma-separated string)
  if (metadata.techStack && Array.isArray(metadata.techStack) && metadata.techStack.length > 0) {
    keyValues.techStack = metadata.techStack.join(',');
  }
  
  // Add experienceLevel filter
  if (metadata.experienceLevel) {
    keyValues.experienceLevel = metadata.experienceLevel;
  }
  
  // Add location filter
  if (metadata.location) {
    keyValues.location = metadata.location.toLowerCase();
  }
  
  // Add date range filters for easy filtering
  if (metadata.registrationPeriod?.registrationStartDate) {
    keyValues.registrationStart = metadata.registrationPeriod.registrationStartDate;
  }
  if (metadata.registrationPeriod?.registrationEndDate) {
    keyValues.registrationEnd = metadata.registrationPeriod.registrationEndDate;
  }
  if (metadata.hackathonPeriod?.hackathonStartDate) {
    keyValues.hackathonStart = metadata.hackathonPeriod.hackathonStartDate;
  }
  if (metadata.hackathonPeriod?.hackathonEndDate) {
    keyValues.hackathonEnd = metadata.hackathonPeriod.hackathonEndDate;
  }
  
  // Add prizeCohorts information for filtering
  if (metadata.prizeCohorts && Array.isArray(metadata.prizeCohorts) && metadata.prizeCohorts.length > 0) {
    // Extract all unique prize cohort names
    const cohortNames = metadata.prizeCohorts.map((cohort: any) => cohort.name).join(',');
    keyValues.prizeCohorts = cohortNames;
    
    // Add total prize pool for filtering
    const totalPrizePool = metadata.prizeCohorts.reduce((sum: number, cohort: any) => {
      const amount = typeof cohort.prizeAmount === 'string' ? parseInt(cohort.prizeAmount) : cohort.prizeAmount;
      return sum + (amount || 0);
    }, 0);
    keyValues.totalPrizePool = totalPrizePool.toString();
  }
  
  // Add hackathon status for filtering
  const now = new Date().toISOString();
  let status = 'upcoming';
  
  if (metadata.registrationPeriod?.registrationEndDate && now > metadata.registrationPeriod.registrationEndDate) {
    if (metadata.hackathonPeriod?.hackathonEndDate && now > metadata.hackathonPeriod.hackathonEndDate) {
      if (metadata.votingPeriod?.votingEndDate && now > metadata.votingPeriod.votingEndDate) {
        status = 'completed';
      } else {
        status = 'judging';
      }
    } else {
      status = 'active';
    }
  } else if (metadata.registrationPeriod?.registrationStartDate && now > metadata.registrationPeriod.registrationStartDate) {
    status = 'registration_open';
  }
  
  keyValues.status = status;
  
  return keyValues;
}

// Specialized hook for hackathon metadata upload
export function useHackathonIPFSUpload() {
  const upload = useIPFSUpload();

  const uploadHackathonMetadata = async (metadata: Record<string, any>, hackathonName: string) => {
    const fileName = `hackathon-${hackathonName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Create filtering key-values for Pinata
    const filteringKeyValues = createFilteringKeyValues(metadata);
    
    return upload.mutateAsync({
      data: {
        ...metadata,
        // Add metadata versioning and timestamps
        version: "1.0.0",
        uploadedAt: new Date().toISOString(),
        type: "hackathon-metadata",
      },
      name: fileName,
      keyValues: filteringKeyValues, // Add key-values for filtering
    });
  };

  return {
    uploadHackathonMetadata,
    isUploading: upload.isPending,
    error: upload.error,
    data: upload.data,
  };
}