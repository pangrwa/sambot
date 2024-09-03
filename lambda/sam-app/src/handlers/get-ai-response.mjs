
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"

const REGION = "us-east-1";
const MODELID = "amazon.titan-text-lite-v1";

const client = new BedrockRuntimeClient({ region: REGION })
export const getAiResponseHandler = async(event) => {

    const userMessage = event.body;
    console.log(userMessage)
    const conversation = [
        {
            role: "user",
            content: [{ text: userMessage }]
        },
    ]
    
    const command = new ConverseCommand({
        modelId: MODELID,
        messages: conversation,
        inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9},
    })

    try {
        const response = await client.send(command);
        const responseText = response.output.message.content[0].text;

        return {
            statusCode: 200,
            body: responseText,
            headers: {
                'Content-Type': 'application/text'
            },
        }
    } catch (error) {
        return {
            statusCode: 503, // service unavailable
            body: error.message,
            headers: {
                'Content-Type': 'application/text'
            }
        }
    }
};