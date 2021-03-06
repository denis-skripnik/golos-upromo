const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

async function getBlock(bn) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("upromo");

        let collection = db.collection('blocks');

        let query = {}

        let res = await collection.findOne(query);

        if (res) {
return res;
} else {
  res = {};
  res.last_block = bn;
  return res;
}
    } catch (err) {

return err;
    } finally {

        client.close();
    }
}

async function updateBlock(id) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("upromo");

        let collection = db.collection('blocks');

        let res = await collection.updateOne({}, {$set: {last_block: id}}, { upsert: true });

return res;
    } catch (err) {

        console.log(err);
    return err;
      } finally {

        client.close();
    }
}

module.exports.getBlock = getBlock;
module.exports.updateBlock = updateBlock;