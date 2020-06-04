const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

async function addTransaction(transaction_id, author, permlink, transfers, slid, percent, time) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("upromo");

        let collection = db.collection('transactions');

        let res = await collection.insertOne({trx_id: transaction_id, author, permlink, transfers, slid, percent, time});

return res;

    } catch (err) {

        console.log(err);
    return err;
      } finally {

        client.close();
    }
}

async function updateTransaction(db_id, new_trx, author, permlink, transfers, slid, percent, time) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('transactions');

      let res = await collection.updateOne({_id: db_id}, {$set: {trx_id: new_trx, author, permlink, transfers, slid, percent, time}}, { upsert: true });

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function removeTransaction(db_id) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('transactions');

      let res = await collection.deleteOne({_id: db_id});

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function findTransactions(trx_time) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('transactions');

      const res = [];
      let cursor = await collection.find({time: {"$lt":trx_time}}).limit(500);
      let doc = null;
      while(null != (doc = await cursor.next())) {
          res.push(doc);
      }
  return res;
    } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

module.exports.addTransaction = addTransaction;
module.exports.updateTransaction = updateTransaction;
module.exports.removeTransaction = removeTransaction;
module.exports.findTransactions = findTransactions;