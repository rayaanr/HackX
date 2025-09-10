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
    if (!body.data) {
      return NextResponse.json(
        { error: "JSON data is required" },
        { status: 400 }
      );
    }

    const fileName = body.name || "data.json";

    // Create a File object from JSON data
    const jsonString = JSON.stringify(body.data, null, 2);
    const file = new File([jsonString], fileName, { type: "application/json" });

    // Upload file to IPFS using Pinata
    const upload = await pinata.upload.public.file(file);

    console.log("Uploaded to IPFS:", upload);

    // Return the IPFS URI
    return NextResponse.json({
      success: true,
      ipfsUri: `ipfs://${upload.cid}`,
      cid: upload.cid,
      fileName,
      data: body.data,
      size: upload.size,
    });
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload to IPFS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
