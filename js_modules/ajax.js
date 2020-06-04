let express = require('express');
let app = express();
const helpers = require("./helpers");
const methods = require("./methods");
const pdb = require("./postsdb");
const pcdb = require("./promocodesdb");
const tdb = require("./topdb");
const conf = require('../config.json');

app.get('/upromo/', async function (req, res) {
let type = req.query.type; // получили параметр type из url
let user = req.query.user; // получили параметр user из url
if (type === 'list') {
    const fs = require('fs')
try {
        const data = fs.readFileSync('turn.json')
       res.send(data);
           console.log(data)
} catch (err) {
  console.error(err)
} 
     } else if (type === 'promo_codes') {
let promocodes = await pcdb.findAllPromoCodes();
let pc_array = [];
for (let promocode of promocodes) {
pc_array.push({code: promocode.code, login: promocode.login, type: promocode.type, balance: promocode.balance + ' GBG', percent: promocode.percent, isSell: promocode.isSell});
}
res.send(JSON.stringify(pc_array));
     } else if (type === 'get_promocodes' && user) {
        let promocodes = await pcdb.getPromoCodes(user);
        let pc_array = [];
        for (let promocode of promocodes) {
        pc_array.push({code: promocode.code, login: promocode.login, type: promocode.type, balance: promocode.balance + ' GBG', percent: promocode.percent});
        }
        res.send(JSON.stringify(pc_array));
} else if (type === 'top') {
    let burners = await tdb.findAllTop();
    burners.sort(helpers.compareBurnAmount);
    let top_array = [];
        for (let user of burners) {
    top_array.push({login: user.login, amount: user.burn_amount});
    }
    res.send(JSON.stringify(top_array));
}
});
app.listen(3000, function () {
});