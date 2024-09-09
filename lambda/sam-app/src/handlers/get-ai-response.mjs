import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const REGION = "us-east-1";
const MODELID = "amazon.titan-text-lite-v1";

const client = new BedrockRuntimeClient({ region: REGION });
const messageLambda = new LambdaClient({
  endpoint: `http://host.docker.internal:3001`,
  region: "us-west-2",
});

async function handleUploadConversation(userQuestion, aiAnswer) {
  // update user conversation with this new message
  let writeUserQuestion = new InvokeCommand({
    FunctionName: "writeMessageFunction",
    Payload: Buffer.from(
      JSON.stringify({
        pathParameters: {
          id: "1", // harded temporarliy
        },
        body: JSON.stringify({
          role: userQuestion.role,
          message: userQuestion.content[0].text,
        }),
      })
    ),
  });
  await messageLambda.send(writeUserQuestion);

  // update user conversation with AI response
  let writeAiAnswer = new InvokeCommand({
    FunctionName: "writeMessageFunction",
    Payload: Buffer.from(
      JSON.stringify({
        pathParameters: {
          id: "1", // harded temporarliy
        },
        body: JSON.stringify({
          role: aiAnswer.role,
          message: aiAnswer.content[0].text,
        }),
      })
    ),
  });
  // send AI message
  await messageLambda.send(writeAiAnswer);
}

async function handleGetConversation() {
  // get all the relevant messages for the conversation
  const getMessagesCommand = new InvokeCommand({
    FunctionName: "getMessagesFunction",
    Payload: Buffer.from(
      JSON.stringify({
        pathParameters: {
          id: "1", // hardcoded temporarily
        },
      })
    ),
  });
  const messagesResponse = await messageLambda.send(getMessagesCommand);
  let messages = JSON.parse(new TextDecoder("utf-8").decode(messagesResponse.Payload)).body
  messages = JSON.parse(messages);
  return messages;
}

export const getAiResponseHandler = async (event) => {
  const userMessage = event.body;

  if (!userMessage) {
    // empty message
    return {
      statusCode: 400,
      body: "User message should not be empty",
      headers: {
        "Content-Type": "application/text",
      },
    };
  }

  let messages = await handleGetConversation();
  messages = messages.map((message) => ({
    role: message.Role,
    content: [{ text: message.Message }],
  }));

  const userQuestion = {
    role: "user",
    content: [{ text: userMessage }],
  };

  // get AI response
  messages.push(userQuestion);
  const command = new ConverseCommand({
    modelId: MODELID,
    messages: messages,
    inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
  });

  try {
    const response = await client.send(command);
    const responseText = response.output.message.content[0].text;

    if (!responseText) {
      // empty response text
      throw new Error("Server unable to response to user question");
    }

    // update user conversation cache
    handleUploadConversation(userQuestion, response.output.message);

    return {
      statusCode: 200,
      body: responseText,
      headers: {
        "Content-Type": "application/text",
      },
    };
  } catch (error) {
    return {
      statusCode: 503, // service unavailable
      body: error.message,
      headers: {
        "Content-Type": "application/text",
      },
    };
  }
};
