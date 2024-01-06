const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf-8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH, "utf-8");
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web || undefined;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key && key.client_id,
      client_secret: key && key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload, "utf-8");
  } catch (error) {
    console.log("saveCredentials function", JSON.stringify(error, null, 2));
  }
}

async function authorize() {
  try {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  } catch (error) {
    console.log("authorize function", JSON.stringify(error, null, 2));
  }
}

async function listMajors(auth) {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: "1UEBvyL5rEBUzcqk7_83Z5Q8kYEVadBnpVEiy3CTp6x8",
      range: "Sheet1!A1:D38",
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return;
    }
    const camps = [];
    rows.forEach((row) => {
      camps.push({
        id: row[0],
        state: row[1],
        address: row[2],
        status: row[3],
      });
    });
    return camps;
  } catch (error) {
    console.log("listMajors function", JSON.stringify(error, null, 2));
    throw error; // Rethrow the error to propagate it
  }
}

async function fetchAndListMajors() {
  try {
    const auth = await authorize();
    const result = await listMajors(auth);
    return result;
  } catch (error) {
    console.log("fetchAndListMajors function", JSON.stringify(error, null, 2));
  }
}

module.exports = {
  fetchAndListMajors,
};
