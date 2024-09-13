import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "ap-southeast-1" });
const BUCKET_NAME = "3d-ai-avatar-project";
export const deleteFileHandler = async (event) => {
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

  // ideally we should check whether or not the file exists
  // in the S3 bucket first

  console.log(`UserID=${id}/${filename}`);
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `UserID=${id}/${filename}`,
  });

  try {
    const data = await client.send(deleteObjectCommand);
    return {
      statusCode: 200,
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
