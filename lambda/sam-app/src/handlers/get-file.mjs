import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";

const client = new S3Client({ region: "ap-southeast-1" });
const BUCKET_NAME = "3d-ai-avatar-project";
export const getFileHandler = async (event) => {
  const pathParameters = event.pathParameters;
  const id = pathParameters ? pathParameters.id : null;
  if (!id) {
    console.error("No valid ID given");
    return {
      statusCode: 400,
      body: "No valid ID given",
    };
  }

  const queryStringParams = event.queryStringParameters;
  const filename = queryStringParams ? queryStringParams.filename : null;
  if (!filename) {
    return {
      statusCode: 400,
      body: "Filename should not be empty",
    };
  }

  console.log(`UserID=${id}/${filename}`);
  const getObjectCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `UserID=${id}/${filename}`,
  });

  try {
    const file = await client.send(getObjectCommand);
    const fileArr = await file.Body.transformToByteArray();
    
    return {
      statusCode: 200,
      body: Buffer.from(fileArr).toString('base64')
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
