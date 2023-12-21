import { Client, Databases } from "node-appwrite";

const PROJECT_ID = process.env.PROJECT_ID; //.env
const DB_ID = process.env.DB_ID; //.env
const STUD_COLLECTION_ID = process.env.STUD_COLLECTION_ID; //.env
const KIN_COLLECTION_ID = process.env.KIN_COLLECTION_ID; //.env
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; //.env

export default async ({ req, res, log, error }) => {
  try {
    // Initialize the Appwrite client
    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject(PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    // Initialize the Appwrite database client
    const databases = new Databases(client); // Replace with your database ID

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

    //Update account status depending on label type (student or kin)
    if (userLabel === "kin") {
      await queryCollectionAndUpdate(KIN_COLLECTION_ID, accountID, "kinID");
    } else if (userLabel == "student") {
      await queryCollectionAndUpdate(STUD_COLLECTION_ID, accountID, "studID");
    } else {
      return;
    }
    log("Account status changed successfully");
  } catch (e) {
    // Log and return error
    error(`Error updating account status: ${e.message}`);
    return res.json({
      error: `Error updating account status: ${e.message}`,
    });
  }
};

// Checking for existing kin account
async function queryCollectionAndUpdate(collection_id, account_id, IdType) {
  //IdType: Is either 'studID' or 'kinID'
  try {
    let query = [];
    query.push(Query.equal(IdType, account_id));

    const response = await databases.listDocuments(DB_ID, collection_id, query);

    if (response.documents.length > 0) {
      // Returns first document in query given that it's always one document related to the account ID that's returned
      log("Account exists in collection. Proceeding to update status ...");
      const documentID = response.documents[0].$id;

      return await updateStatus(collection_id, documentID);
    } else {
      log("Account does not exist in collection. Exting the fucntion...");
    }
    return;
  } catch (error) {
    // log("Error Updating Account Status:", error);
    error("Error Updating Account Status:", error);
    throw error;
  }
}

async function updateStatus(accountCollection_id, document_id) {
  try {
    // Update the document in the database
    await databases.updateDocument(DB_ID, accountCollection_id, document_id, {
      accountStatus: "Deleted",
    });
  } catch (error) {
    error("Error Updating Account Status:", error);
    throw error;
  }
}
