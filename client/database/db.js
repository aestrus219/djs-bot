require("dotenv").config();

const { google } = require('googleapis');

const serviceAccountKeyFile = "./client/database/credentials.json";
const sheetId = process.env.GDRIVE_DB_ID
const tabName = 'TestTab1'
const range = 'A:E'

main().then(() => {
    console.log('Completed')
})

async function main() {
    const googleSheetClient = await _getGoogleSheetClient();
    const data = await _readGoogleSheet(googleSheetClient, sheetId, tabName, range);
    console.log(data);
    const dataToBeInserted = [
        ['1', 'test']
    ]
    await _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, dataToBeInserted);
}

async function _getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountKeyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    return google.sheets({
        version: 'v4',
        auth: authClient,
    });
}

async function _readGoogleSheet(googleSheetClient, sheetId, tabName, range) {
    const res = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    });

    return res.data.values;
}

async function _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, data) {
    await googleSheetClient.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            "majorDimension": "ROWS",
            "values": data
        },
    })
}