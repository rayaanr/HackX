export interface IPFSUploadOptions {
  data: Record<string, any>
  name?: string
}

export interface IPFSUploadResponse {
  success: boolean
  ipfsUri: string
  cid: string
  fileName: string
  data: Record<string, any>
  size: number
}

export interface IPFSUploadError {
  error: string
  details?: string
}

export interface IPFSViewResponse {
  success: boolean
  cid: string
  data: Record<string, any>
  gatewayUrl: string
}

const PINATA_GATEWAY = "bronze-tired-rooster-930.mypinata.cloud"

export async function uploadToIPFS(
  options: IPFSUploadOptions
): Promise<IPFSUploadResponse> {
  const response = await fetch("/api/ipfs/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  })

  if (!response.ok) {
    const error: IPFSUploadError = await response.json()
    throw new Error(error.details || error.error || "Failed to upload to IPFS")
  }

  return response.json()
}

export async function viewFromIPFS(uri: string): Promise<IPFSViewResponse> {
  // Extract CID from IPFS URI
  let cid = uri
  if (uri.startsWith("ipfs://")) {
    cid = uri.replace("ipfs://", "")
  }

  // Use Pinata gateway directly
  const gatewayUrl = `https://${PINATA_GATEWAY}/ipfs/${cid}`
  
  const response = await fetch(gatewayUrl)
  
  if (!response.ok) {
    throw new Error(`Failed to retrieve from IPFS: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    success: true,
    cid,
    data,
    gatewayUrl,
  }
}