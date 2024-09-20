import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "3d-ai-avatar-project";
export const getFileInfoHandler = async (event) => {
  const pathParameters = event.pathParameters;
  const id = pathParameters ? pathParameters.id : null;
  if (!id) {
    console.error("No valid ID given");
    return {
      statusCode: 400,
      body: "No valid ID given",
    };
  }

  const listObjectsCommand = new ListObjectsCommand({
    Bucket: BUCKET_NAME,
  });
  try {
    const { Contents } = await client.send(listObjectsCommand);

    let fileInfo;
    if (!Contents) {
      fileInfo = []
    } else {
      fileInfo = Contents.map((c) => ({
          key: c.Key,
          lastModified: c.LastModified,
      }))
    }

    return {
        statusCode: 200, 
        body: JSON.stringify(fileInfo),
        headers: {
            "Content-Type": "application/json"
        }
    }
  } catch (error) {
    return {
        statusCode: 503,
        body: error.message
    }
  }
};
