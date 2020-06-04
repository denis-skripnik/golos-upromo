const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

async function getTop(login) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("upromo");

        let collection = db.collection('top');

        let query = {login}

        let res = await collection.findOne(query);

return res;

    } catch (err) {

        console.log(err);
    return err;
      } finally {

        client.close();
    }
}

async function updateTop(login, burn_amount, burn_count) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('top');

      let res = await collection.updateOne({login}, {$set: {login, burn_amount, burn_count}}, { upsert: true });

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function removeTop(db_id) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('top');

      let res = await collection.deleteOne({_id: db_id});

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function findAllTop() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('top');

      const res = [];
      let cursor = await collection.find({}).limit(500);
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

module.exports.getTop = getTop;
module.exports.updateTop = updateTop;
module.exports.removeTop = removeTop;
module.exports.findAllTop = findAllTop;