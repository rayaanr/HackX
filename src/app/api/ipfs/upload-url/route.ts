import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "bronze-tired-rooster-930.mypinata.cloud",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log("Uploading image from URL:", body.url);

    // Prepare keyvalues with a maximum of 9 keys to respect Pinata's limit
    const defaultKeys = {
      uploadedBy: "hackx-platform",
      type: "hackathon-visual",
      timestamp: new Date().toISOString(),
    };

    const customKeys = body.keyValues || {};
    const allKeys = { ...defaultKeys, ...customKeys };

    // Limit to 9 keys maximum and ensure all values are strings
    const keyEntries = Object.entries(allKeys);
    const limitedKeys: Record<string, string> = Object.fromEntries(
      keyEntries.slice(0, 9).map(([key, value]) => [key, String(value)])
    );

    // Upload URL to IPFS using Pinata
    const upload = await pinata.upload.public
      .url(body.url)
      .keyvalues(limitedKeys);

    console.log("Uploaded to IPFS:", upload);

    // Return the IPFS URI
    return NextResponse.json({
      success: true,
      ipfsUri: `ipfs://${upload.cid}`,
      cid: upload.cid,
      size: upload.size,
      originalUrl: body.url,
    });
  } catch (error) {
    console.error("IPFS URL Upload Error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload URL to IPFS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
