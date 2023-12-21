import { Client, Databases } from "node-appwrite";

// This is your Appwrite function
// It's executed each time the function is triggered by an account deletion event
export default async ({ req, res, log, error }) => {
  try {
    //req params
    log("1. " + req.bodyRaw); // Raw request body, contains request data
    log("2. " + JSON.stringify(req.body)); // Object from parsed JSON request body, otherwise string
    log("3. " + JSON.stringify(req.headers)); // String key-value pairs of all request headers, keys are lowercase
    log("4. " + req.scheme); // Value of the x-forwarded-proto header, usually http or https
    log("5. " + req.method); // Request method, such as GET, POST, PUT, DELETE, PATCH, etc.
    log("6. " + req.url); // Full URL, for example: http://awesome.appwrite.io:8000/v1/hooks?limit=12&offset=50
    log("7. " + req.host); // Hostname from the host header, such as awesome.appwrite.io
    log("8. " + req.port); // Port from the host header, for example 8000
    log("9. " + req.path); // Path part of URL, for example /v1/hooks
    log("10. " + req.queryString); // Raw query params string. For example "limit=12&offset=50"
    log("11. " + JSON.stringify(req.query)); // Parsed query params. For example, req.query.limit

    log(req.bodyRaw); // Raw request body, contains request data
    log(JSON.stringify(req.body)); // Object from parsed JSON request body, otherwise string
    log(JSON.stringify(req.headers)); // String key-value pairs of all request headers, keys are lowercase
    log(req.scheme); // Value of the x-forwarded-proto header, usually http or https
    log(req.method); // Request method, such as GET, POST, PUT, DELETE, PATCH, etc.
    log(req.url); // Full URL, for example: http://awesome.appwrite.io:8000/v1/hooks?limit=12&offset=50
    log(req.host); // Hostname from the host header, such as awesome.appwrite.io
    log(req.port); // Port from the host header, for example 8000
    log(req.path); // Path part of URL, for example /v1/hooks
    log(req.queryString); // Raw query params string. For example "limit=12&offset=50"
    log(JSON.stringify(req.query)); // Parsed query params. For example, req.query.limit

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
