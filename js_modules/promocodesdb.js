const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

async function getPromoCodes(login) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });
  
    if (!client) {
        return;
    }
  
    try {
  
        const db = client.db("upromo");
  
        let collection = db.collection('promocodes');
  
        const res = [];
        let cursor = await collection.find({login}).limit(500);
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

  async function getPromoCode(login) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });
  
    if (!client) {
        return;
    }
  
    try {
  
        const db = client.db("upromo");
  
        let collection = db.collection('promocodes');
  
        let res = await collection.findOne({login}).limit(500);
    return res;
      } catch (err) {
  
        console.log(err);
    return err;
      } finally {
  
        client.close();
    }
  }

  async function getPromoCodeWithCode(code) {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });
  
    if (!client) {
        return;
    }
  
    try {
  
        const db = client.db("upromo");
  
        let collection = db.collection('promocodes');
  
        let res = await collection.findOne({code});
    return res;
      } catch (err) {
  
        console.log(err);
    return err;
      } finally {
  
        client.close();
    }
  }


async function updatePromoCode(code, login, type, balance, percent, isSell) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('promocodes');

      let res = await collection.updateOne({code}, {$set: {code, login, type, balance, percent, isSell}}, { upsert: true });

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function removePromoCode(code) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('promocodes');

      let res = await collection.deleteOne({code});

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function findAllPromoCodes() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('promocodes');

      const res = [];
      let cursor = await collection.find().limit(500);
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

module.exports.getPromoCodes = getPromoCodes;
module.exports.getPromoCode = getPromoCode;
module.exports.getPromoCodeWithCode = getPromoCodeWithCode;
module.exports.updatePromoCode = updatePromoCode;
module.exports.removePromoCode = removePromoCode;
module.exports.findAllPromoCodes = findAllPromoCodes;