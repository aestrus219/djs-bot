/**
 * const vDB = require("./database/vDB");
 * const db = new vDB({ instance: "type of instance" });
 * 
 * db.write(['ID', 'values', 'in array'])
 * db.read(ID, key)
 * db.update(ID, key, newValue)
 */

require("dotenv").config();

const { google } = require('googleapis');
const sheets = google.sheets({ version: 'v4' });
const creds = "./database/credentials.json";

async function getValue(spreadsheetId, range) {
  const auth = await google.auth.getClient({
    keyFile: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  return response.data.values;
}

async function searchIdAndKey(spreadsheetId, id, key, instance) {
  const values = await getValue(spreadsheetId, `${instance}!A:Z`);
  const headers = values[0];
  const idIndex = headers.indexOf('id');
  const keyIndex = headers.indexOf(key);

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[idIndex] === id) {
      return row[keyIndex];
    }
  }

  return null;
}


async function writeValues(spreadsheetId, range, values) {
  const auth = await google.auth.getClient({
    keyFile: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const resource = {
    values: [values],
  };

  await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource,
  });
}

async function setValues(spreadsheetId, data, instance) {
  const range = `${instance}!A:Z`;
  const values = data;

  await writeValues(spreadsheetId, range, values);
}


async function updateValue(spreadsheetId, ID, key, newValue, instance) {
  const auth = await google.auth.getClient({
    keyFile: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  try {
    const findRowRequest = {
      spreadsheetId,
      range: `${instance}!A:Z`,
      auth,
    };
    const findRowResponse = await sheets.spreadsheets.values.get(findRowRequest);
    const rows = findRowResponse.data.values;
    const rowIndex = rows.findIndex(row => row[0] === ID);

    if (rowIndex === -1) {
      return `No entry found by the ID ${ID}`;
    }

    const keyIndex = rows[0].indexOf(key)
    if (keyIndex === -1) {
      return `No column found by the name ${keyIndex}`;
    }
    const column = String.fromCharCode(keyIndex + 65);
    const range = `${instance}!${column}${rowIndex + 1}`;

    const updateRequest = {
      auth,
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        range,
        values: [[newValue]],
      },
    };
    await sheets.spreadsheets.values.update(updateRequest)
    console.log(`Updated value of ${key} to ${newValue} for guild ID ${ID}.`)
  } catch (e) {
    console.log(e.message)
  }
}


class vDB {
  constructor(options) {
    this.instance = options.instance;
    if(!this.instance) console.log("vDB Error: No instance specified in options")
  }
  read(ID, key) {
    return searchIdAndKey(process.env.GDRIVE_DB_ID, ID, key, this.instance)
  }
  write(data) {
    return setValues(process.env.GDRIVE_DB_ID, data, this.instance)
  }
  update(ID, key, newValue) {
    return updateValue(process.env.GDRIVE_DB_ID, ID, key, newValue, this.instance);
  }
}

module.exports = vDB;