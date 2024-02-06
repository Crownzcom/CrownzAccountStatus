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
    if (labels.includes("kin")) {
      log(`Querying kin table/collection ...`);
      await queryCollectionAndDeleteDoc(KIN_COLLECTION_ID, accountID, "kinID");
      await setKinIdNull(accountID);
    } else if (labels.includes("student")) {
      log(`Querying student table/collection ...`);
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

    return context.res.empty();
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

      log(`Query Respons: ${JSON.stringify(response)}`);

      if (response.documents.length > 0) {
        // Returns first document in query given that it's always one document related to the account ID that's returned
        const documentID = response.documents[0].$id;
        log(
          `Document id to be deleted from ${IdType} collection: ${documentID}`
        );

        const promise = await databases.deleteDocument(
          DB_ID,
          collection_id,
          documentID
        );
        log(`Account/User Document deleted`);
      } else {
        log(`Account does not exist in collection. Exting the function...`);
        return context.res.empty();
      }
    } catch (error) {
      log(`Error deleting account document in collection: ${error}`);
      throw error;
    }
  }

  //Function to set kinID in student table to null on kin account deletion
  async function setKinIdNull(kinId) {
    /*
    - query table with the given value
    - if the query returns results, retrieve the documents ids which are saved in an array or variable
    - update the attribute values to null for all the returned documents by looping through all the ids returned from the query
    */
    try {
      let query = [];
      query.push(Query.equal("kinID", kinId));

      const response = await databases.listDocuments(
        DB_ID,
        STUD_COLLECTION_ID,
        query
      );

      log(
        `Accounts to alter kinID to null Query Response: ${JSON.stringify(
          response
        )}`
      );

      const documents = response.documents;

      if (documents.length === 0) {
        log("No documents found with the given attribute value.");
        return;
      }

      // Extract document IDs
      const documentIds = documents.map((doc) => doc.$id);

      // Update each document
      for (const id of documentIds) {
        await database.updateDocument(DB_ID, STUD_COLLECTION_ID, id, {
          kinID: "null",
        });
        log(`Document with ID ${id} updated.`);
      }

      // if (response.documents.length > 0) {
      //   const documentIds = documents.documents.map((doc) => doc.$id);

      //   // Update the attribute value to null for each document
      //   for (const documentId of documentIds) {
      //     const updateData = {
      //       kinID: null, // Replace with the actual attribute key
      //     };

      //     await databases.updateDocument(
      //       DB_ID,
      //       STUD_COLLECTION_ID,
      //       documentId,
      //       updateData
      //     );
      //   }

      //   log("Attributes updated successfully!");
      // } else {
      //   log(`Account does not exist in collection. Exting the function...`);
      //   return context.res.empty();
      // }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};
