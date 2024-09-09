import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
export const deleteMessagesHandler = async (event) => {
  // can't batch delete everything, need to specify the key of a table item
  const params = {
    RequestItems: {
      Conversations: [
        {
          DeleteRequest: {
            Key: {
              UserID: "1", // hardcoded
            },
          },
        },
      ],
    },
  };
  const command = new BatchWriteCommand(params);
  const test = await docClient.send(command);
};
