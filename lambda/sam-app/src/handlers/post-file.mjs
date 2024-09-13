import { HeadBucketCommand, HeadObjectCommand, NotFound, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import parser from "lambda-multipart-parser";


/**
 * bucket name separated by prefix userID
 */
const client = new S3Client({region: "ap-southeast-1"});
const BUCKET_NAME = "3d-ai-avatar-project";
export const postFileHandler = async (event) => {
  // remember to create subdirectories within the s3 bucket based on user ID
  const pathParameters = event.pathParameters;
  const id = pathParameters ? pathParameters.id : null;
  if (!id) {
    console.error("No valid ID given");
    return {
      statusCode: 400,
      body: "No valid ID given",
    };
  }

  const formData = await parser.parse(event);
  const file = formData.files[0]; // possible to upload multiple files

  const headCommand = new HeadBucketCommand({
    Bucket: BUCKET_NAME
  })
  try {
    const response = await client.send(headCommand);
  } catch (error) {
    if (error instanceof NotFound) {
        console.log("NOT FOUND")
    } else {
        throw error;  // some other error 
    }
  }

  const headFileCommand = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `UserID=${id}/${file.filename}`
  })
  try {
    const response = await client.send(headFileCommand);
    // means file exists
    return {
      statusCode: 200,
      body: JSON.stringify({
        fileExists: true 
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }
  } catch (error) {
    if (error instanceof NotFound) {
        console.log("NOT FOUND")
    } else {
      throw error; // some other error
    }
  }

  // Display the key/value pairs
  const putFileCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `UserID=${id}/${file.filename}`, 
    Body: file.content 
  });
  
  try {
    const response = await client.send(putFileCommand); 
    return {
        statusCode: 200,
        body: JSON.stringify({}),
        headers: {
          "Content-Type": "application/json"
        }
    }
  } catch(error) {
    return {
        statusCode: 503,
        body: error.message
    }
  }
};
