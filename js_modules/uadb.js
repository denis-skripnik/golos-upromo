const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

async function getValue() {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("upromo");

        let collection = db.collection('upvoteAmount');

        let query = {}

        let res = await collection.findOne(query);

return res;
    } catch (err) {

return err;
    } finally {

        client.close();
    }
}

async function setValue(upvote_amount) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("upromo");

        let collection = db.collection('upvoteAmount');

        let res = await collection.updateOne({}, {$set: {upvote_amount}}, { upsert: true });

return res;
    } catch (err) {

        console.log(err);
    return err;
      } finally {

        client.close();
    }
}

module.exports.getValue = getValue;
module.exports.setValue = setValue;