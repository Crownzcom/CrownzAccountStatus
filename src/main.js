import { Client, Databases } from "node-appwrite";

// This is your Appwrite function
// It's executed each time the function is triggered by an account deletion event
export default async ({ req, res, log, error }) => {
  try {
    // Assuming the account ID is passed in the request body (You need to confirm the actual structure)
    // This might change based on actual event data structure
    const accountData = {
      userId: req.query.$id,
      label: req.query.labels,
    };

    log(`AccountID: ${accountData.userId}`);

    // Initialize the Appwrite client
    const client = new Client()
      .setEndpoint("https://cloud.appwrite.io/v1") // Set your Appwrite endpoint
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    // Initialize the Appwrite database client
    const databases = new Databases(client); // Replace with your database ID

    // Update the document in the database
    await databases.updateDocument(
      "655f5a677fcf3b1d8b79",
      "65706739032c0962d0a9",
      "6582b68644efb522bb73",
      {
        accountStatus: "Deleted",
      }
    );
    log(`Account status updated for accountID: ${accountData.userId}`);

    // Send a response back
    return res.json({
      message: `Account status updated successfully for accountID: ${accountData.userId}`,
    });
  } catch (e) {
    // Log and return error
    error(`Error updating account status: ${e.message}`);
    return res.json({
      error: `Error updating account status: ${e.message}`,
    });
  }
};
