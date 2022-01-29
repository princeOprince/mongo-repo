const { MongoClient } = require('mongodb');

function circulationRepo() {
  const url = "mongodb://localhost:27017";
  const dbName = "circulation";

  function loadData(data) {
    return new Promise(async (resolve, reject) => {
      const client = new MongoClient(url);
      try {
        await client.connect();
        const db = client.db(dbName);

        results = await db.collection('newspapers').insertMany(data);
        resolve(results);
      }
      catch {
        reject(error);
      }
    })
  }

  return { loadData }

}

module.exports = circulationRepo();