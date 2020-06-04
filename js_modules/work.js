const helpers = require("./helpers");
const methods = require("./methods");
const pdb = require("./postsdb");
const pcdb = require("./promocodesdb");
const tdb = require("./topdb");
const conf = require('../config.json');

async function processing(transfer_author, amount, url, promoCode_add, down) {
    let transfers = [];
let slid = [];
    const post = await pdb.getPost(url[0], url[1]);
if (post) {
if (amount >= 1) {
    let balance = post.amount;
    let get_top = await tdb.getTop(transfer_author);
    if (get_top) {
        let top_amount = get_top.burn_amount;
        let top_burn_count = get_top.burn_count;
        top_amount += amount;
        top_amount *= 1000;
        top_amount = parseInt(top_amount);
        top_amount /= 1000;
        top_amount = top_amount.toFixed(3);
        top_amount = parseFloat(top_amount);
        top_burn_count += 1;
        await tdb.updateTop(transfer_author, top_amount, top_burn_count);
    } else {
        let top_amount = amount;
        let top_burn_count = 1;
        await tdb.updateTop(transfer_author, top_amount, top_burn_count);
    }
    if (down === true) {
    amount = amount - amount*2;
amount = amount/2;
amount = Math.floor(amount);
console.log('Задвинуть на ' + amount)
transfers = post.transfers;
if (post.slid && post.slid.length > 0) {
slid = post.slid;
}
if (slid.indexOf(transfer_author) === -1) {
    slid.push(transfer_author);
}
} else {
    if (post.slid && post.slid.length > 0) {
        slid = post.slid;
        }
    transfers = post.transfers;
    if (transfers.indexOf(transfer_author) === -1) {
        transfers.push(transfer_author);
    }
}
amount += balance;
amount = Math.floor(amount);
promoCode_add += post.promoCode_add;
promoCode_add = promoCode_add.toFixed(3);
promoCode_add = parseFloat(promoCode_add);
try {
    await pdb.updatePost(url[0], url[1], transfers, slid, amount, promoCode_add, post.end_date, post.curation_rewards_percent);
    await helpers.jsonFileGenerate(pdb, methods);
    return {code: 1, msg: 'OK'};
    } catch(error) {
        return {code: 0, msg: error};
    }
} else {
    return {code: 1, msg: 'error'};
}
} else {
    try {
    let isVote = await methods.getContent(url[0], url[1]);
    if (isVote && isVote.code === 0) {
        let create_date = parseInt(new Date(isVote.created + '+0000').getTime()/1000);
        let end_date = create_date + 604800;
        let now_datetime = await helpers.unixTime();
        if (now_datetime <= end_date) {
            let get_top = await tdb.getTop(transfer_author);
            if (get_top) {
                let top_amount = get_top.burn_amount;
                let top_burn_count = get_top.burn_count;
                top_amount += amount;
                top_amount *= 1000;
                top_amount = parseInt(top_amount);
                top_amount /= 1000;
                top_amount = top_amount.toFixed(3);
                top_amount = parseFloat(top_amount);
                top_burn_count += 1;
                await tdb.updateTop(transfer_author, top_amount, top_burn_count);
            } else {
                let top_amount = amount;
                let top_burn_count = 1;
                await tdb.updateTop(transfer_author, top_amount, top_burn_count);
            }
                    if (down === true) {
        amount = amount - amount*2;
amount = amount/2;
amount *= 1000;
amount = parseInt(amount);
amount /= 1000;
amount = amount.toFixed(3);
amount = parseFloat(amount);
console.log('Задвинуть на ' + amount)
slid.push(transfer_author);
} else {
    transfers.push(transfer_author);
}
    try {
        await pdb.updatePost(url[0], url[1], transfers, slid, amount, promoCode_add, end_date, isVote.curation_rewards_percent);
        await helpers.jsonFileGenerate(pdb, methods);
        return {code: 1, msg: 'OK'};
        } catch(error) {
            return {code: 0, msg: error};
    }
} else {
    return {code: 1, msg: 'Post is finisht'};
}
}  else {
    return {code: 1, msg: 'Post is upvoted.'};
}
} catch(e) {
    return {code: 0, msg: e};
}
}
}

async function processBlock(bn) {
    console.log('Номер блока: ' + bn);
    const block = await methods.getOpsInBlock(bn);
let ok_ops_count = 0;
    for(let tr of block) {
        const [op, opbody] = tr.op;
        switch(op) {
                case "transfer":
                opbody.memo = opbody.memo.replace(/\s+/g, ' ').trim();
                try {
                let isJson = await helpers.isJsonString(opbody.memo);
if (isJson.approve === false && opbody.to === 'null') {
                if (opbody.to === 'null' && opbody.amount.indexOf('GBG') > -1) {
                    let amount = parseFloat(opbody.amount);
                    amount = Math.floor(amount);
                    let summ = 0;
                    let promocodes = await pcdb.getPromoCodes(opbody.from);
if (promocodes.length > 0) {
for (let  promocode of  promocodes) {
    if ( promocode.isSell.approve === false) {
summ = amount/100*promocode.percent;
summ = summ.toFixed(3);
summ = parseFloat(summ);
if (summ < promocode.balance) {
let ostatok = promocode.balance - summ;
ostatok = ostatok.toFixed(3);
ostatok = parseFloat(ostatok);
await pcdb.updatePromoCode(promocode.code, opbody.from, promocode.type, ostatok, promocode.percent, {approve: false});
} else if (summ === promocode.balance) {
    let ostatok = promocode.balance - summ;
    ostatok = ostatok.toFixed(3);
    ostatok = parseFloat(ostatok);
    if (ostatok === 0) {
await pcdb.removePromoCode(promocode.code);
    } else {
        await pcdb.updatePromoCode(promocode.code, opbody.from, promocode.type, ostatok, promocode.percent, {approve: false});
    }
} else {
        summ = promocode.balance;
    await pcdb.removePromoCode(promocode.code);
}
}
}
}
let filtered_memo = '';
let url = '';
if (opbody.memo.indexOf('@') > -1) {
filtered_memo = opbody.memo.split('@')[1];
url = filtered_memo.split('/');
} else if (opbody.memo.indexOf('https://mememe.io/card/') > -1) {
    filtered_memo = opbody.memo.split('card/')[1];
    url = filtered_memo.split('/');
} else if (opbody.memo.indexOf('show.html?') > -1) {
    filtered_memo = opbody.memo.split('?author=')[1];
    url = filtered_memo.split('&permlink=');
}
if (opbody.memo.charAt(0) === '-') {
    let ops_return = await processing(opbody.from, amount, url, summ, true);
    console.log('Сообщение: ' + ops_return.msg);
    ok_ops_count += ops_return['code'];
} else {
    let ops_return = await processing(opbody.from, amount, url, summ, false);
    console.log('Сообщение: ' + ops_return.msg);
    ok_ops_count += ops_return['code'];
}
} else {
ok_ops_count = 0;
}
} else {
    let arr = isJson.data;
    if (opbody.to === 'null' && opbody.amount.indexOf('GBG') > -1 && arr.contractName === 'upromo' && arr.contractAction === 'transfer' && arr.contractPayload && arr.contractPayload.from === opbody.from && arr.contractPayload.to && arr.contractPayload.code) {
    let isPromoCode = await pcdb.getPromoCodeWithCode(arr.contractPayload.code);
    if (isPromoCode && isPromoCode.login === opbody.from && isPromoCode.isSell.approve === false) {
    await pcdb.updatePromoCode(arr.contractPayload.code, arr.contractPayload.to, isPromoCode.type, isPromoCode.balance, isPromoCode.percent, isPromoCode.isSell);
    } else {
    console.log('Промокода такого нет или пытается перевести пользователь, который не имеет на это права.');
    } // transfer
    } // approved smart contract. Transfer
    else if (opbody.to === 'null' && opbody.amount.indexOf('GBG') > -1 && arr.contractName === 'upromo' && arr.contractAction === 'sell' && arr.contractPayload && arr.contractPayload.from === opbody.from && arr.contractPayload.code && arr.contractPayload.symbol && arr.contractPayload.price) {
        let isPromoCode = await pcdb.getPromoCodeWithCode(arr.contractPayload.code);
        if (isPromoCode && isPromoCode.login === opbody.from) {
            await pcdb.updatePromoCode(arr.contractPayload.code, arr.contractPayload.from, isPromoCode.type, isPromoCode.balance, isPromoCode.percent, {approve: true, symbol: arr.contractPayload.symbol.toUpperCase(), price: arr.contractPayload.price});
                } else {
        console.log('Промокода такого нет или пытается его продать пользователь, который не имеет на это права.');
        } // Sell
            } // approved smart contract. Sell.
            else if (opbody.to === 'null' && opbody.amount.indexOf('GBG') > -1 && arr.contractName === 'upromo' && arr.contractAction === 'cancelSale' && arr.contractPayload && arr.contractPayload.from === opbody.from && arr.contractPayload.code) {
                let isPromoCode = await pcdb.getPromoCodeWithCode(arr.contractPayload.code);
                if (isPromoCode && isPromoCode.login === opbody.from) {
                await pcdb.updatePromoCode(arr.contractPayload.code, arr.contractPayload.from, isPromoCode.type, isPromoCode.balance, isPromoCode.percent, {approve: false});
                } else {
                console.log('Промокода такого нет или пытается отменить его продажу пользователь, который не имеет на это права.');
                } // Sell
                    } // approved smart contract. cancel the sale.
                    else if (opbody.to === 'null' && opbody.amount.indexOf('GBG') > -1 && arr.contractName === 'upromo' && arr.contractAction === 'emission' && arr.contractPayload && arr.contractPayload.to) {
                        let code = await helpers.generatePromoCode(13);
                        await pcdb.updatePromoCode(code, arr.contractPayload.to, 'for_null_transfer', parseFloat(opbody.amount), 20, {approve: false});
                } // approved smart contract. emission.
                else if (arr && arr.contractName && arr.contractName === 'upromo' && arr.contractAction === 'buy' && arr.contractPayload && arr.contractPayload.code && arr.contractPayload.to) {
                    let isPromoCode = await pcdb.getPromoCodeWithCode(arr.contractPayload.code);
                    if (isPromoCode && isPromoCode.login === opbody.to && isPromoCode.isSell.approve === true && opbody.amount === isPromoCode.isSell.price.toFixed(3) + ' ' + isPromoCode.isSell.symbol) {
                    await pcdb.updatePromoCode(arr.contractPayload.code, arr.contractPayload.to, isPromoCode.type, isPromoCode.balance, isPromoCode.percent, {approve: false});
                    } else {
                    console.log('Промокода такого нет или пытается купить его пользователь, который не имеет на это права.');
                    } // buy
            } // approved smart contract. buy.
            }
        } catch(e) {
        console.log(e);
        }
            break;
    default:
                    //неизвестная команда
            }
        }
        return ok_ops_count;
    }

module.exports.processBlock = processBlock;