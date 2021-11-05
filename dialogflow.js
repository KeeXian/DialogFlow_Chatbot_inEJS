
/**
 * TODO(developer): UPDATE these variables before running the sample.
 */
// projectId: ID of the GCP project where Dialogflow agent is deployed
// const projectId = 'PROJECT_ID';
// sessionId: String representing a random number or hashed user identifier
// const sessionId = '123456';
// queries: A set of sequential queries to be send to Dialogflow agent for Intent Detection
// const queries = [
//   'Reserve a meeting room in Toronto office, there will be 5 of us',
//   'Next monday at 3pm for 1 hour, please', // Tell the bot when the meeting is taking place
//   'B'  // Rooms are defined on the Dialogflow agent, default options are A, B, or C
// ]
// languageCode: Indicates the language Dialogflow agent should use to detect intents
// const languageCode = 'en';

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');
const config = require('./config');

// Import Credentials from Config file
const projectId = config.CREDENTIALS.project_id;
const credentials = {
  client_email: config.CREDENTIALS.client_email,
  private_key: config.CREDENTIALS.private_key
}

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient(
    {
      projectId: projectId,
      credentials
    }
  );

  async function detectIntent(sessionId, query, contexts) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: config.DF_LANGUAGE_CODE,
        },
      },
    };
  
    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts: contexts,
      };
    }
  
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0];
    return result;
  
  }

  async function executeQueries(sessionId, queries) {
    // Keeping the context across queries let's us simulate an ongoing conversation with the bot
    let context;
    let intentResponse;
    for (const query of queries) {
      try {
        console.log(`Sending Query: ${query}`);
        intentResponse = await detectIntent(
          sessionId,
          query,
          context
        );
        console.log(`Detected intent: ${intentResponse.queryResult.action}`);
        console.log(
          `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
        );
        // Use the context from this response for next queries
        context = intentResponse.queryResult.outputContexts;
        return intentResponse.queryResult;
      } catch (error) {
        console.log(error);
      }
    }
  }

  module.exports = {executeQueries};