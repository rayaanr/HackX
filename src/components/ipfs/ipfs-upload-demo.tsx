"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIPFSUploadSync, useIPFSViewSync } from "@/hooks/useIPFS"
import { toast } from "sonner"

export function IPFSUploadDemo() {
  const [jsonData, setJsonData] = useState(`{
  "title": "Sample Project",
  "description": "This is a demo project uploaded to IPFS",
  "tags": ["blockchain", "web3", "ipfs"],
  "metadata": {
    "version": "1.0.0",
    "timestamp": "${new Date().toISOString()}"
  }
}`)
  const [fileName, setFileName] = useState("demo-project.json")
  const [uploadResult, setUploadResult] = useState<string>("")
  const [viewUri, setViewUri] = useState<string>("")
  const [viewResult, setViewResult] = useState<any>(null)

  const { uploadData, isLoading: isUploading, error: uploadError } = useIPFSUploadSync()
  const { viewData, isLoading: isViewing, error: viewError } = useIPFSViewSync()

  const handleUpload = async () => {
    try {
      // Parse and validate JSON
      const parsedData = JSON.parse(jsonData)
      
      const result = await uploadData({
        data: parsedData,
        name: fileName,
      })

      setUploadResult(result.ipfsUri)
      setViewUri(result.cid) // Auto-fill with CID for viewing
      toast.success("Successfully uploaded to IPFS!")
    } catch (err) {
      console.error("Upload failed:", err)
      toast.error(err instanceof Error ? err.message : "Upload failed")
    }
  }

  const handleView = async () => {
    try {
      if (!viewUri.trim()) {
        toast.error("Please enter an IPFS URI")
        return
      }

      const result = await viewData(viewUri)
      setViewResult(result)
      toast.success("Successfully retrieved from IPFS!")
    } catch (err) {
      console.error("View failed:", err)
      toast.error(err instanceof Error ? err.message : "Failed to retrieve data")
      setViewResult(null)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>IPFS Storage Demo</CardTitle>
        <CardDescription>
          Upload and view JSON data using Thirdweb IPFS Storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload to IPFS</TabsTrigger>
            <TabsTrigger value="view">View from IPFS</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="example.json"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jsonData">JSON Data</Label>
              <Textarea
                id="jsonData"
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Enter your JSON data here..."
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !jsonData.trim()}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload to IPFS"}
            </Button>

            {uploadError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                <strong>Error:</strong> {uploadError.message}
              </div>
            )}

            {uploadResult && (
              <div className="space-y-2">
                <Label>Upload Result</Label>
                <div className="p-3 text-sm bg-green-50 rounded border border-green-200">
                  <div className="font-semibold text-green-800">Success!</div>
                  <div className="mt-1">
                    <strong>IPFS URI:</strong>{" "}
                    <code className="px-1 py-0.5 bg-green-100 rounded text-green-700">
                      {uploadResult}
                    </code>
                  </div>
                  <div className="mt-2">
                    <a
                      href={`https://ipfs.io/ipfs/${uploadResult.replace("ipfs://", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on IPFS Gateway →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="view" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="viewUri">IPFS CID</Label>
              <Input
                id="viewUri"
                value={viewUri}
                onChange={(e) => setViewUri(e.target.value)}
                placeholder="Qm... or baf..."
              />
            </div>

            <Button 
              onClick={handleView} 
              disabled={isViewing || !viewUri.trim()}
              className="w-full"
            >
              {isViewing ? "Retrieving..." : "View from IPFS"}
            </Button>

            {viewError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">
                <strong>Error:</strong> {viewError.message}
              </div>
            )}

            {viewResult && (
              <div className="space-y-2">
                <Label>Retrieved Data</Label>
                <div className="p-3 text-sm bg-blue-50 rounded border border-blue-200">
                  <div className="font-semibold text-blue-800 mb-2">
                    Success! Retrieved from IPFS
                  </div>
                  <div className="bg-white rounded border p-3">
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(viewResult.data, null, 2)}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    <div><strong>CID:</strong> {viewResult.cid}</div>
                    <div>
                      <strong>Gateway URL:</strong>{" "}
                      <a
                        href={viewResult.gatewayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {viewResult.gatewayUrl}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}