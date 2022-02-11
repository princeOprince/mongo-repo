const { MongoClient, ObjectID } = require('mongodb');

function circulationRepo() {
    const url = "mongodb://localhost:27017";
    const dbName = "circulation";

    function get(query, limit) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                let items = await db.collection('newspapers').find(query);
                // collection.find({}).project({ a: 1 })                             // Create a projection of field a
                // collection.find({}).skip(1).limit(10)                          // Skip 1 and limit 10
                // collection.find({}).batchSize(5)                               // Set batchSize on cursor to 5
                // collection.find({}).filter({ a: 1 })                              // Set query on the cursor
                // collection.find({}).comment('add a comment')                   // Add a comment to the query, allowing to correlate queries
                // collection.find({}).addCursorFlag('tailable', true)            // Set cursor as tailable
                // collection.find({}).addCursorFlag('oplogReplay', true)         // Set cursor as oplogReplay
                // collection.find({}).addCursorFlag('noCursorTimeout', true)     // Set cursor as noCursorTimeout
                // collection.find({}).addCursorFlag('awaitData', true)           // Set cursor as awaitData
                // collection.find({}).addCursorFlag('exhaust', true)             // Set cursor as exhaust
                // collection.find({}).addCursorFlag('partial', true)             // Set cursor as partial
                // collection.find({}).addQueryModifier('$orderby', { a: 1 })        // Set $orderby {a:1}
                // collection.find({}).max(10)                                    // Set the cursor max
                // collection.find({}).maxTimeMS(1000)                            // Set the cursor maxTimeMS
                // collection.find({}).min(100)                                   // Set the cursor min
                // collection.find({}).returnKey(10)                              // Set the cursor returnKey
                // collection.find({}).setReadPreference(ReadPreference.PRIMARY)  // Set the cursor readPreference
                // collection.find({}).showRecordId(true)                         // Set the cursor showRecordId
                // collection.find({}).sort([['a', 1]])                           // Sets the sort order of the cursor query
                // collection.find({}).hint('a_1')                                // Set the cursor hint
                if (limit > 0) {
                    items = items.limit(limit);
                }

                resolve(await items.toArray());
                client.close();
            } catch (error) {
                reject(error);
            }
        })
    }

    function getById(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const item = await db.collection('newspapers').findOne({ _id: ObjectID(id) });
                resolve(item);

                client.close();
            }
            catch(error) {
                reject(error);
            }
        })
    }

    function add(item) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const addedItem = await db.collection('newspapers').insertOne(item);
                resolve(addedItem.ops[0]);
                client.close();
            }
            catch (error) {
                reject(error);
            }
        });
    }

    function update(id, newItem) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const updatedItem = await db.collection('newspapers').findOneAndReplace({ _id: ObjectID(id) }, newItem, { returnOriginal: false });
                resolve(updatedItem.value);
                client.close();
            }
            catch (error) {
                reject(error);
            }
        });
    }

    function remove(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const removed = await db.collection('newspapers').deleteOne({ _id: ObjectID(id) });
                resolve(removed.deletedCount === 1);
                client.close();
            }
            catch (error) {
                reject(error);
            }
        });
    }

    function averageFinalists() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const average = await db.collection('newspapers').aggregate([
                    {
                        $group:
                        {
                            _id: null,
                            avgFinalists: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014" }
                        }
                    }
                ]).toArray();
                resolve(average[0].avgFinalists);
                client.close();
            }
            catch(error) {
                reject(error);
            }
        });
    }

    function averageFinalistsByChange() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);

                const average = await db.collection('newspapers').aggregate([
                    {
                        $project: {
                            "Newspaper": 1,
                            "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                            "Change in Daily Circulation, 2004-2013": 1,
                            overallChange: {
                                $cond: {
                                    if: {
                                        $gte: ["$Change in Daily Circulation, 2004-2013", 0]
                                    },
                                    then: "positive", 
                                    else: "negative"
                                }
                            }
                        }
                    },
                    {
                        $group:
                        {
                            _id: "$overallChange",
                            avgFinalists: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014" }
                        }
                    }
                ]).toArray();
                resolve(average);
                client.close();
            }
            catch(error) {
                reject(error);
            }
        });
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
            catch(error) {
                reject(error);
            }
        });
    }

    return { loadData, get, getById, add, update, remove, averageFinalists, averageFinalistsByChange }

}

module.exports = circulationRepo();