const { MongoClient } = require('mongodb');

function circulationRepo() {
  const url = "mongodb://localhost:27017";
  const dbName = "circulation";

  function get() {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        const items = await db.collection('newspapers').find();

        resolve(await items.toArray());
        client.close();
      }
      catch {
        reject(error);
      }
    })
  }

  function loadData(data) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        const results = await db.collection('newspapers').insertMany(data);
        resolve(results);
        client.close();
      }
      catch {
        reject(error);
      }
    })
  }

  return { loadData, get }

}

module.exports = circulationRepo();