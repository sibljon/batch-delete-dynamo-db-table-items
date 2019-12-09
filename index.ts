import * as AWS from "aws-sdk";

import { AttributeMap } from "aws-sdk/clients/dynamodb";

// Based on https://stackoverflow.com/a/57598497/670400

// Customization 1: choose your region
const DynamoDb = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1"
});

// Customiation 2: specify the table name
const tableName = "dev-invite";

// Customization 3: specify the hash key for your table
const hashKey = "InviteToken";

// Customization 4: add logic to determine which (return true if you want to delete the respective item)
// If you don't want to filter anything out, then just return true in this function (or remove the filter step below, where this filter is used)
const shouldDeleteItem = (item: any): boolean => {
  return item.Type === "SECURE_MESSAGE" || item.Type === "PATIENT";
};

export const getAllItemsFromTable = async (lastEvaluatedKey?: {
  [hashKey]: string;
}) => {
  const res = await DynamoDb.scan({
    TableName: tableName,
    ExclusiveStartKey: lastEvaluatedKey
  }).promise();
  return { items: res.Items, lastEvaluatedKey: res.LastEvaluatedKey };
};

export const deleteAllItemsFromTable = async (
  items: AttributeMap[]
): Promise<{ numItemsDeleted: number }> => {
  var numItemsDeleted = 0;
  // Split items into patches of 25
  // 25 items is max for batchWrite
  await asyncForEach(split(items, 25), async (patch, i) => {
    const requestItems = {
      [tableName]: patch.filter(shouldDeleteItem).map(item => {
        numItemsDeleted++;
        return {
          DeleteRequest: {
            Key: {
              [hashKey]: item[hashKey]
            }
          }
        };
      })
    };
    if (requestItems[tableName].length > 0) {
      await DynamoDb.batchWrite({ RequestItems: requestItems }).promise();
      console.log(`finished deleting ${numItemsDeleted} items this batch`);
    }
  });

  return { numItemsDeleted };
};

function split(arr, n) {
  var res = [];
  while (arr.length) {
    res.push(arr.splice(0, n));
  }
  return res;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function letsGo() {
  let lastEvaluatedKey: { [hashKey]: string } | undefined;
  let totalItemsFetched = 0;
  let totalItemsDeleted = 0;

  console.log(`------ Deleting from table ${tableName}`);

  do {
    const { items, lastEvaluatedKey: lek } = await getAllItemsFromTable(
      lastEvaluatedKey
    );
    totalItemsFetched += items.length;
    console.log(`--- a group of ${items.length} was fetched`);

    const { numItemsDeleted } = await deleteAllItemsFromTable(items);
    totalItemsDeleted += numItemsDeleted;
    console.log(`--- ${numItemsDeleted} items deleted`);

    lastEvaluatedKey = lek as { [hashKey]: string };
  } while (!!lastEvaluatedKey);

  console.log("Done!");
  console.log(`${totalItemsFetched} items total fetched`);
  console.log(`${totalItemsDeleted} items total deleted`);
}

letsGo();
