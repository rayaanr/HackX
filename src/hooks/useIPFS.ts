import { useMutation } from "@tanstack/react-query"
import { uploadToIPFS, viewFromIPFS, type IPFSUploadOptions } from "@/lib/ipfs"

export function useIPFSUpload() {
  return useMutation({
    mutationFn: uploadToIPFS,
    onError: (error) => {
      console.error("IPFS upload failed:", error)
    },
  })
}

export function useIPFSView() {
  return useMutation({
    mutationFn: viewFromIPFS,
    onError: (error) => {
      console.error("IPFS view failed:", error)
    },
  })
}

export function useIPFSUploadSync() {
  const mutation = useIPFSUpload()

  const uploadData = async (options: IPFSUploadOptions) => {
    return mutation.mutateAsync(options)
  }

  return {
    uploadData,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}

export function useIPFSViewSync() {
  const mutation = useIPFSView()

  const viewData = async (uri: string) => {
    return mutation.mutateAsync(uri)
  }

  return {
    viewData,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}