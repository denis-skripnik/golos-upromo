const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

async function getPost(author, permlink) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("upromo");

        let collection = db.collection('posts');

        let query = {author, permlink}

        let res = await collection.findOne(query);

return res;

    } catch (err) {

        console.log(err);
    return err;
      } finally {

        client.close();
    }
}

async function updatePost(author, permlink, transfers, slid, amount, promoCode_add, end_date, curation_rewards_percent) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('posts');

      let res = await collection.updateOne({author, permlink}, {$set: {author, permlink, transfers, slid, amount, promoCode_add, end_date, curation_rewards_percent}}, { upsert: true });

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function removePost(db_id) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('posts');

      let res = await collection.deleteOne({_id: db_id});

return res;

  } catch (err) {

      console.log(err);
  return err;
    } finally {

      client.close();
  }
}

async function findAllPosts() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
      .catch(err => { console.log(err); });

  if (!client) {
      return;
  }

  try {

      const db = client.db("upromo");

      let collection = db.collection('posts');

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

module.exports.getPost = getPost;
module.exports.updatePost = updatePost;
module.exports.removePost = removePost;
module.exports.findAllPosts = findAllPosts;