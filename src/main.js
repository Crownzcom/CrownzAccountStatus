import { Client, Databases } from "node-appwrite";

const PROJECT_ID = process.env.PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.DB_ID;
const KIN_COLLECTION_ID = process.env.KIN_COLLECTION_ID;
const STUD_COLLECTION_ID = process.env.STUD_COLLECTION_ID;

export default async ({ req, res, log, error }) => {
  try {
    // Initialize the Appwrite client
    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1")
      .setProject(PROJECT_ID)
      .setKey(APPWRITE_API_KEY);

    // Initialize the Appwrite database client
    const databases = new Databases(client); // Replace with your database ID

    // Extract the account ID from the request body
    const requestBody = JSON.parse(req.bodyRaw);
    const accountID = requestBody.$id;
    log(`Account ID extracted: ${accountID}`);

    // Update the document in the database
    await databases.updateDocument(DB_ID, "65706739032c0962d0a9", "6582b68644efb522bb73", {
      accountStatus: "Active",
    });
    log(`Account status updated for accountID: ${accountID}`);

    // Send a response back
    return res.json({
      message: `Account status updated successfully for accountID: ${accountID}`,
    });
  } catch (e) {
    // Log and return error
    error(`Error updating account status: ${e.message}`);
    return res.json({
      error: `Error updating account status: ${e.message}`,
    });
  }
};
