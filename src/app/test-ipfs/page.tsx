import { IPFSUploadDemo } from "@/components/ipfs/ipfs-upload-demo"

export default function TestIPFSPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">IPFS Upload Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the new IPFS JSON upload functionality using Thirdweb Storage
        </p>
      </div>
      
      <IPFSUploadDemo />
    </div>
  )
}