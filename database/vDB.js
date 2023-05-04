/**
 * const vDB = require("./client/database/vDB");
 * const db = new vDB();
 * 
 * db.write(['guildID', 'values', 'in array'])
 * db.read(guildID, key)
 * db.update(guildID, key, newValue)
 */

require("dotenv").config();

const { google } = require('googleapis');
const sheets = google.sheets({ version: 'v4' });


async function getValue(spreadsheetId, range) {
  const auth = await google.auth.getClient({
    keyFile: "./client/database/credentials.json",
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const response = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  return response.data.values;
}

async function searchIdAndKey(spreadsheetId, id, key) {
  const values = await getValue(spreadsheetId, 'A:Z');
  const headers = values[0];
  const idIndex = headers.indexOf('guild_id');
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
    keyFile: "./client/database/credentials.json",
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

async function setValues(spreadsheetId, data) {
  const range = 'A:Z';
  const values = data;

  await writeValues(spreadsheetId, range, values);
}


async function updateValue(spreadsheetId, guildID, key, newValue) {
  const auth = await google.auth.getClient({
    keyFile: "./client/database/credentials.json",
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  try {
    const findRowRequest = {
      spreadsheetId,
      range: `Sheet1!A:E`,
      auth,
    };
    const findRowResponse = await sheets.spreadsheets.values.get(findRowRequest);
    const rows = findRowResponse.data.values;
    const rowIndex = rows.findIndex(row => row[0] === guildID);

    if (rowIndex === -1) {
      return `No entry found by the ID ${guildID}`;
    }

    const keyIndex = rows[0].indexOf(key)
    if (keyIndex === -1) {
      return `No column found by the name ${keyIndex}`;
    }
    const column = String.fromCharCode(keyIndex + 65);
    const range = `Sheet1!${column}${rowIndex + 1}`;

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
    console.log(`Updated value of ${key} to ${newValue} for guild ID ${guildID}.`)
  } catch (e) {
    console.log(e.message)
  }
}


class vDB {
  read(guildID, key) {
    return searchIdAndKey(process.env.GDRIVE_DB_ID, guildID, key)
  }
  write(data) {
    return setValues(process.env.GDRIVE_DB_ID, data)
  }
  update(guildID, key, newValue) {
    return updateValue(process.env.GDRIVE_DB_ID, guildID, key, newValue);
  }
}

module.exports = vDB;