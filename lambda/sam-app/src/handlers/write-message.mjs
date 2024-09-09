import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"


const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client);

const getCurrentTimestamp = () => {
    return new Date().toISOString();
}
export const writeMessageHandler = async (event) => {
    const pathParameters = event.pathParameters;
    const id = pathParameters ? pathParameters.id : null; 
    if (!id) {
        console.error("No valid ID given")
        return {
            statusCode: 400,
            body: "No valid ID given"
        };
    }

    const message = JSON.parse(event.body);
    const command = new PutCommand({
        TableName: "Conversations",
        Item: {
            UserID: id, 
            Timestamp: getCurrentTimestamp(),
            Role: message.role,
            Message: message.message, 
        }
    });

    try {
        const response = await docClient.send(command);
        return {
            statusCode: 200,
            body: "Successful"
        }
    } catch (error) {
        console.error("Failed to upload message: ", error) 
        return {
            statusCode: 503, // service unavailable,
            body: error.message
        };
    }

}