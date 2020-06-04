require("./js_modules/ajax");
const work = require("./js_modules/work");
const helpers = require("./js_modules/helpers");
const methods = require("./js_modules/methods");
const pdb = require("./js_modules/postsdb");
const pcdb = require("./js_modules/promocodesdb");
const tdb = require("./js_modules/topdb");
const uadb = require("./js_modules/uadb");
const trxdb =                  require("./js_modules/transactionsdb");
const conf = require('./config.json');
const CronJob = require('cron').CronJob;
const bdb = require("./js_modules/blocksdb");
const LONG_DELAY = 12000;
const SHORT_DELAY = 3000;
const SUPER_LONG_DELAY = 1000 * 60 * 15;

let PROPS = null;

let bn = 0;
let last_bn = 0;
let delay = SHORT_DELAY;

async function getNullTransfers() {
    PROPS = await methods.getProps();
            const block_n = await bdb.getBlock(PROPS.last_irreversible_block_num);
bn = block_n.last_block;

delay = SHORT_DELAY;
while (true) {
    try {
        if (bn > PROPS.last_irreversible_block_num) {
            // console.log("wait for next blocks" + delay / 1000);
            await helpers.sleep(delay);
            PROPS = await methods.getProps();
        } else {
            if(0 < await work.processBlock(bn)) {
                delay = SHORT_DELAY;
            } else {
                delay = LONG_DELAY;
            }
            bn++;
            await bdb.updateBlock(bn);
        }
    } catch (e) {
        console.log("error in work loop" + e);
        await helpers.sleep(1000);
        }
    }
}

setInterval(() => {
    if(last_bn == bn) {

        try {
                process.exit(1);
        } catch(e) {
            process.exit(1);
        }
    }
    last_bn = bn;
}, SUPER_LONG_DELAY);

getNullTransfers()
helpers.jsonFileGenerate(pdb, methods);

async function workingTrx() {
    const time = await helpers.unixTime();
    const trx_time = time-90;
const trx_list = await trxdb.findTransactions(trx_time);
for (let trx of trx_list) {
    try {
    const get_trx = await methods.getTransaction(trx.trx_id);
    const block = await methods.getProps();
    const block_data = await methods.getBlockHeader(block.last_irreversible_block_num);
    const lest_block_time = Date.parse(block_data.timestamp);
if (lest_block_time >= trx.time) {
    await trxdb.removeTransaction(trx._id);
}    
} catch(e) {
    if(e 
          && e.payload 
          && e.payload.error 
          && e.payload.error.data 
          && e.payload.error.data.code 
         && e.payload.error.data.code == 1020200) {
            const sendVote = await methods.sendUpvote(trx.author, trx.permlink, trx.transfers, trx.slid, trx.percent);
            if (sendVote !== 0) {
                const send_time = await helpers.unixTime();
                await trxdb.updateTransaction(trx._id, sendVote, trx.author, trx.permlink, trx.transfers, trx.slid, trx.percent, send_time);
            }
     }
}}
}

async function sendVote(postAuthor, postPermlink, postTransfers, post_slid, post_percent) {
            const upvote = await methods.sendUpvote(postAuthor, postPermlink, postTransfers, post_slid, post_percent);
            console.log(upvote);
    if (upvote !== 0) {
        const time = await helpers.unixTime();
        await trxdb.addTransaction(upvote, postAuthor, postPermlink, postTransfers, post_slid, post_percent, time);
        return 1;
        } else {
        return 0;
        }
    }

async function actions(up_amount) {
    let posts = await pdb.findAllPosts();
    let approvePosts = true;
    if (posts.length > 0) {
        let worning_posts = [];
        let now_datetime = await helpers.unixTime();
        for (let post of posts) {
            let ok_time = post.end_date - now_datetime;
            if (now_datetime > post.end_date) {
                let test = await pdb.removePost(post._id);
            console.log('Удалено: ' + test);
} else if (ok_time <= 86400 && ok_time >= 84000) {
worning_posts.push({author: post.author, permlink: post.permlink, amount: post.amount, transfers: post.transfers})
}
        }

        posts.sort(helpers.compareDate);
        let post = posts[0];
                if (post.amount >= conf.minimum) {
let add_profit = 1.2;
if (post.curation_rewards_percent >= 50 && post.curation_rewards_percent < 75) {
add_profit = 1.5;
} else if (post.curation_rewards_percent >= 75) {
add_profit = 1.8;
}
let max_amount = up_amount * (1 - post.curation_rewards_percent / 100);
console.log('Максимальная сумма: ' + max_amount)                    
let promoCode_add = post.promoCode_add.toFixed(3);
promoCode_add = parseFloat(promoCode_add);
let all_amounts = +post.amount+ +promoCode_add;
let percentOfUpAmount = all_amounts / max_amount * 100;
console.log('Сумма промокода: ' + promoCode_add + ', Тип: ' + typeof promoCode_add);
console.log('Общая сумма: ' +  all_amounts);
console.log('Процент без прибавки профита: ' + percentOfUpAmount);
                    let percent = percentOfUpAmount * add_profit;
percent = percent.toFixed(2);
percent = parseFloat(percent);
console.log('Итоговый процент: ' +  percent);
if (percent >= 100) {
percent = 100;
}
let sended = await sendVote(post.author, post.permlink, post.transfers, post.slid, percent);
console.log('Статус отправления: ' + sended + JSON.stringify(post));
            if (sended === 1) {
    let removeSended = await pdb.removePost(post._id);
    await helpers.jsonFileGenerate(pdb, methods);
    console.log('Удалено после проверки отправления: ' + removeSended);
}
} else {
    approvePosts = false;
}
if (worning_posts.length > 0) {
await helpers.sleep(300000);
await methods.notifyPosts(worning_posts, post.amount);
}
} else {
    approvePosts = false;
}
if (approvePosts === false) {
await methods.sendComment();
}
    }

    async function timedCount() { 
        try {
            let up_amount = 0.001;
            if (up_amount === 0) {
                up_amount = await uadb.getValue();
            up_amount = up_amount.upvote_amount;
        } else {
                up_amount *= 1000;
                up_amount = parseInt(up_amount);
                up_amount /= 1000;
                up_amount = up_amount.toFixed(3);
            await uadb.setValue(up_amount);
            }
            console.log('Стоимость апвота: ' + up_amount);
            let energy = await methods.battery(conf.login);
            if (energy && energy.percent === 100) {
await actions(up_amount);
   await helpers.sleep(3000);       
    await methods.updateAccount(conf.posting_key, conf.login, energy.percent100_will_be_view, up_amount);
          setTimeout(() => timedCount(), 60000);
} else {
    await methods.updateAccount(conf.posting_key, conf.login, energy.percent100_will_be_view, up_amount);
    setTimeout(() => timedCount(), energy.percent100_will_be_sec);
}
} catch(e) {
console.log('ошибка таймера: ' + e);
await helpers.sleep(3000);
        await timedCount();
    }
    }

async function MonthlyTopPost() {
    let now_time = await helpers.unixTime();
    let delegators = await methods.getDelegations();
if (delegators.length > 0) {
let approve_delegators = [];
for (let delegator of delegators) {
    let delegation_time = parseInt(new Date(delegator.min_delegation_time).getTime()/1000)
let time_in_delegation = now_time - delegation_time;
if (time_in_delegation >= 2592000) {
    let vests = parseFloat(delegator.vesting_shares) * (1-parseFloat(delegator.interest_rate/10000));
    vests = vests.toFixed(6);
    vests = parseFloat(vests);
    approve_delegators.push({delegator: delegator.delegator, shares: vests});
}
}
let all_delegators_gp = approve_delegators.reduce(function(p,c){return p+c.shares;},0);
let all_balance = 500;
for (let approve_delegator of approve_delegators) {
let percent = approve_delegator.shares / all_delegators_gp;
let delegator_balance = (all_balance*percent).toFixed(3);
let code = await helpers.generatePromoCode(13);
delegator_balance = parseFloat(delegator_balance);
await pcdb.updatePromoCode(code, approve_delegator.delegator, 'for_delegators', delegator_balance, 10, {approve: false});
}
} // end if delegators.

let get_tops = await tdb.findAllTop();
    if (get_tops) {
        let burn_amount_month = 0;
        let text = `## Боги Ярило!
Суммы округлены в меньшую сторону, как при учёте в очереди.
`;
        get_tops.sort(helpers.compareBurnAmount);
        text += `| Место | Логин | Сумма за месяц |
| --- | --- | --- |
`;
let top_number = 0;        
for (let top of get_tops) {
top_number += 1;
    text += `| ${top_number} | @${top.login}  | ${top.burn_amount} GBG |
`;
if (top_number === 1) {
    let code = await helpers.generatePromoCode(13);
    await pcdb.updatePromoCode(code, top.login, 'for_burn_leaders', top.burn_amount, 20, {approve: false});
} else if (top_number === 2) {
    let tn2_amount = (top.burn_amount/5).toFixed(3);
    tn2_amount = parseFloat(tn2_amount)
    let code = await helpers.generatePromoCode(13);
    await pcdb.updatePromoCode(code, top.login, 'for_burn_leaders', tn2_amount, 15, {approve: false});
} else if (top_number === 3) {
    let tn3_amount = (top.burn_amount/10).toFixed(3);
    tn3_amount = parseFloat(tn3_amount)
    let code = await helpers.generatePromoCode(13);
    await pcdb.updatePromoCode(code, top.login, 'for_burn_leaders', tn3_amount, 10, {approve: false});
} else if (top_number === 4) {
    let tn4_amount = (top.burn_amount/10).toFixed(3);
    tn4_amount = parseFloat(tn4_amount)
    let code = await helpers.generatePromoCode(13);
    await pcdb.updatePromoCode(code, top.login, 'for_burn_leaders', tn4_amount, 5, {approve: false});
} else if (top_number === 5) {
    let tn5_amount = (top.burn_amount/20).toFixed(3);
    tn5_amount = parseFloat(tn5_amount)
    let code = await helpers.generatePromoCode(13);
    await pcdb.updatePromoCode(code, top.login, 'for_burn_leaders', tn5_amount, 5, {approve: false});
}
    burn_amount_month += top.burn_amount;
}
    
    text += `## Победителям вознаграждение:
    - 5 место - промокод с балансом 5% от суммы сжигания, прибавляет 5% к сумме сожженного;
    - Четвёртое место - промокод с балансом 10% от суммы сжигания, прибавляет 5% к сумме сожженного;
    - 3 место - промокод с балансом 10% от суммы сжигания, прибавляет 10% к сумме сожженного;
- Второе - промокод на 20% от суммы сжигания с прибавлением 15% от сумм сжигания;
- Первое место - промокод на сумму сожженного, прибавляет 20% к сумме сжиганий.

***

Напоминаем, что вы можете делегировать СГ @upromo, получая 80% кураторских либо добавить аккаунт в кураторы бота от @vik, поддержав проект. Также, если вы автор, можете сжигать от 1 GBG к @null, получая ап.`;
burn_amount_month *= 1000;
burn_amount_month = parseInt(burn_amount_month);
burn_amount_month /= 1000;
burn_amount_month = burn_amount_month.toFixed(3);
try {
await methods.publickPost(burn_amount_month, text);
} catch(e) {
    await helpers.sleep(300000);
    await methods.publickPost(burn_amount_month, text);
}
}
}

new CronJob('0 0 0 1 * *', MonthlyTopPost, null, true);
    setInterval(() => workingTrx(), 90000);
timedCount()