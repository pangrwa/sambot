import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const getMessagesHandler = async(event) => {
    const pathParameters = event.pathParameters;
    const id = pathParameters ? pathParameters.id : null; 
    if (!id) {
        console.error("No valid ID given")
        return {
            statusCode: 400,
            body: "No valid ID given"
        };
    }

    const command = new QueryCommand({
        TableName: "Conversations",
        KeyConditionExpression:
            "UserID = :uid",
        ExpressionAttributeValues: {
            ":uid": id 
        },
    });

    try { 
        const response = await docClient.send(command);
        console.log(response.Items)
        return {
            statusCode: 200,
            body: JSON.stringify(response.Items),
            headers: {
                'Content-Type': 'application/json',
            }
        }
    } catch (error) {
        console.error("Failed to retrieve messages: ", error);
        return {
            statusCode: 503, // service unavailable
            body: error.message
        }
    }

}
