import { Client, Databases, Query } from "node-appwrite";

const PROJECT_ID = process.env.PROJECT_ID; //.env
const DB_ID = process.env.DB_ID; //.env
const STUD_COLLECTION_ID = process.env.STUD_COLLECTION_ID; //.env
const KIN_COLLECTION_ID = process.env.KIN_COLLECTION_ID; //.env
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; //.env

export default async ({ req, res, log, error }) => {

  // Initialize the Appwrite client
  const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  // Initialize the Appwrite database client
  const databases = new Databases(client);

  try {
    // Parse the request body and extract the account ID and labels
    const requestBody = JSON.parse(req.bodyRaw);
    const accountID = requestBody.$id;
    const labels = requestBody.labels || [];

    // Extract 'student' or 'kin' label
    let userLabel = labels.includes("student")
      ? "student"
      : labels.includes("kin")
      ? "kin"
      : "none";
    log(`User label determined: ${userLabel}`);
    log(`User ID: ${accountID}`);

    //Delete account document and determine the collection depending on label type (student or kin)
    if ( labels.includes("kin")) {
      log( `Querying kin table/collection ...`)
      await queryCollectionAndDeleteDoc(
        KIN_COLLECTION_ID,
        accountID,
        "kinID"
      );
    } else if (labels.includes("student")) {
      log(`Querying student table/collection ...`)
      await queryCollectionAndDeleteDoc(
        STUD_COLLECTION_ID,
        accountID,
        "studID"
      );
    } else {
      log(`Account document not found`);
      return;
    }
    log(`Account document deleted successfully`);
  } catch (e) {
    //return error
    return res.json({
      error: `Error while deleting document: ${e.message}`,
    });
  }

  /**------FUNCTIONS-----**/
  // Checking for existing kin account
  async function queryCollectionAndDeleteDoc(
    collection_id,
    account_id,
    IdType
  ) {
    //IdType: Is either 'studID' or 'kinID'
    try {
      let query = [];
      query.push(Query.equal(IdType, account_id));

      const response = await databases.listDocuments(
        DB_ID,
        collection_id,
        query
      );

      log(`Query Respons: ${JSON.parse(response)}`);

      if (response.documents.length > 0) {
        // Returns first document in query given that it's always one document related to the account ID that's returned
        const documentID = response.documents[0].$id;
        log(`Document id to be deleted from ${IdType} collection: ${documentID}`);

        const promise = await databases.deleteDocument(DB_ID, collection_id, documentID);
        log(`Account/User Document deleted`);
        return promise;

      } else {
        log(`Account does not exist in collection. Exting the function...`);
        return context.res.empty();
      }
    } catch (error) {
      log(`rror deleting account document in collection: ${error}`);
      throw error;
    }
  }
};