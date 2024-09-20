import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { BedrockAgentRuntimeClient, InvokeAgentCommand, RetrieveAndGenerateCommand, RetrieveCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import {
  BedrockAgentClient,
  GetAgentCommand,
} from "@aws-sdk/client-bedrock-agent";

import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const REGION = "us-east-1";
const MODELID = "anthropic.claude-3-haiku-20240307-v1:0";
const KNOWLEDGE_BASE_ID = "ICFGBRQHPI";
const AGENT_ID = "IFOSNUYPJD";
let sessionId = undefined;

const client = new BedrockRuntimeClient({ region: REGION });
const agentRuntime = new BedrockAgentRuntimeClient({ region: REGION });
const agentClient = new BedrockAgentClient({ region: REGION });
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

async function retrieveKnowledge(query) {
  // don't really know how to use next token
  const retrieveCommand = new RetrieveCommand({
    knowledgeBaseId: KNOWLEDGE_BASE_ID,
    retrievalQuery: {
      text: query
    }
  })
  const response = await agentRuntime.send(retrieveCommand);
  const relatedContent = response.retrievalResults.map((o) => o.content);
  return relatedContent;
}

async function handleAgent(query) {
  // const getAgent = new GetAgentCommand({ agentId: AGENT_ID });
  // const response = await agentClient.send(getAgent);
  // console.log(response.agent);
  const invokeAgent = new InvokeAgentCommand({ 
    agentId: AGENT_ID,
    agentAliasId: "W1LYO0QB4W",
    sessionId: "1234",
    inputText: query
  })
  const response = await agentRuntime.send(invokeAgent);
  if (response.completion === undefined) {
    throw new Error("Completion is undefined");
  }

  let completion = "";
  for await (let chunkEvent of response.completion) {
    const chunk = chunkEvent.chunk;
    const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
    completion += decodedResponse;
  }

  return { sessionId: sessionId, completion };
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

  // // retrieve knowledge base
  // const knowledges = await retrieveKnowledge(userMessage);
  // // do some prompt engineering
  // modifyPrompt(userMessage, knowledges);

  const { sessionId, completion } =  await handleAgent(userMessage);

  // test RAG
  // retrieveAndGenerate(userMessage);

  const prompt = `
  You are a chatbot agent that will be used by users to ask basic information about the Central Provident Fund. You should be
  nice and polite. You should sound very welcoming and open. You don't have to input text to let the user know about your emotion or expressions.\n
  These are some information retrieved from your knowledge base data source for you to use it help answer
  the user question\n
  ${completion}\n
  When you are answering the question to the user, do not mention that you retrieve these data from a private data source,
  treat it as if you own the data\n
  Follow these steps when you craft your output.\n
  1. Keep you answer short, sweet and concised, just get to the point. \n
  2. If you have multiple bullet points for the answer, choose only the top 3, you can
    send more if the user asks for more.\n
  3. If possible, provide more URLs for the user to read up more\n
  This is the user question: \n
  ${userMessage}
  `

  const userQuestion = {
    role: "user",
    content: [{ text: prompt}],
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
    console.log(responseText);

    // update user conversation cache
    // change content to remove hard-coded prompt
    userQuestion.content[0].text = userMessage;
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
