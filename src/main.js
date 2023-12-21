import { Client, Databases } from "node-appwrite";

// This is your Appwrite function
// It's executed each time the function is triggered by an account deletion event
export default async ({ req, res, log, error }) => {
  try {
    // Initialize the Appwrite client
    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1") // Set your Appwrite endpoint
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    // Initialize the Appwrite database client
    const databases = new Databases(client, process.env.APPWRITE_API_KEY.DATABASE_ID); // Replace with your database ID

    // Assuming the account ID is passed in the request body (You need to confirm the actual structure)
    const accountID = req.payload.$id; // This might change based on actual event data structure

    // Update the document in the database
    await databases.updateDocument("65706739032c0962d0a9", accountID, {
      accountStatus: "Deleted",
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
