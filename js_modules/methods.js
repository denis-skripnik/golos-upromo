var conf = require('../config.json');
var golos = require('golos-js');
golos.config.set('websocket',conf.node);

async function getOpsInBlock(bn) {
    return await golos.api.getOpsInBlockAsync(bn, false);
  }

  async function getBlockHeader(block_num) {
  return await golos.api.getBlockHeaderAsync(block_num);
  }
  
  async function getTransaction(trxId) {
  return await golos.api.getTransactionAsync(trxId);
  }

  async function getProps() {
  return await golos.api.getDynamicGlobalPropertiesAsync();
  }
  
  async function getChainProps() {
    return await golos.api.getChainPropertiesAsync();
    }

  async function updateAccount(pk,test_user,new_round,max_bid) {
    let 					metadata={};
    metadata.profile={};
    metadata.profile.name = 'UPromo';
    if (max_bid && max_bid > 0) {
        metadata.profile.about= `Получите апвот за сжигание GBG к null. Ближайший раунд голосования состоится ${new_round} GMT. Апвот даёт примерно ${max_bid} GBG.`;
    } else {
        metadata.profile.about= `Получите апвот за сжигание GBG к null! Ближайший раунд голосования состоится ${new_round} GMT.`;
    }
    metadata.pinnedPosts = ["upromo/soglashenie-ob-ispolzovanii-upromo","upromo/upromo-instrukciya-dlya-szhigayushikh-dlya-prodvizheniya-ili-zadviganiya-postov","upromo/upromo-instrukciya-dlya-investorov"];
    let json_metadata=JSON.stringify(metadata);
    return await golos.broadcast.accountMetadataAsync(pk,test_user,json_metadata);
}

async function getAccount(login) {
    return await golos.api.getAccountsAsync([login]);
    }

    async function getTicker() {
        return await golos.api.getTickerAsync();
        }
        
        async function upvoteAmount() {
            let get_dynamic_global_properties = await getProps();
            let chain_props = await getChainProps();
            let account = [];
            let acc_info = await getAccount('upromo');
                let all_shares = parseFloat(acc_info[0].vesting_shares) - parseFloat(acc_info[0].delegated_vesting_shares) + parseFloat(acc_info[0].received_vesting_shares);
                let total_vesting_fund_steem = parseFloat(get_dynamic_global_properties.total_vesting_fund_steem);
                let total_vesting_shares = parseFloat(get_dynamic_global_properties.total_vesting_shares);
                let total_reward_fund_steem = parseFloat(get_dynamic_global_properties.total_reward_fund_steem);
                let total_reward_shares2 = parseInt(get_dynamic_global_properties.total_reward_shares2);
                let golos_per_vests = total_vesting_fund_steem / total_vesting_shares;
        
        account["voting_power"] = 10000;
        
            account["golos_power"] = (all_shares * golos_per_vests).toFixed(3);
            let vest_shares = parseInt(1000000 * account["golos_power"] / golos_per_vests);
        
        let max_vote_denom = chain_props.vote_regeneration_per_day * (5 * 60 * 60 * 24) / (60 * 60 * 24);    
            let used_power = parseInt((account["voting_power"] + max_vote_denom - 1) / max_vote_denom);
            let rshares = ((vest_shares * used_power) / 10000);
            account["rshares"] = rshares.toFixed();
            let ticker_method = await getTicker();
        let ticker_price = ticker_method['latest'];
            let value_golos = (account["rshares"] * total_reward_fund_steem / total_reward_shares2).toFixed(3);
        let value_gbg = (value_golos * ticker_price).toFixed(3);
        value_gbg = parseFloat(value_gbg);
        return value_gbg;
}

async function sendUpvote(author, permlink, transfers, slid, percent) {
    let now = new Date().getTime() + 18e5,
    expire = new Date(now).toISOString().split('.')[0];
    let newTx = [];
let parent_author = author;
let parent_permlink = permlink;
let weight = parseInt(percent * 100);
let transfers_list = '';
for (let transfer of transfers) {
transfers_list += `@${transfer}, `;
}
transfers_list = transfers_list.replace(/,\s*$/, "");
let slid_ru_text = '';
let slid_eng_text = '';
if (slid && slid.length > 0) {
    slid_ru_text = ' Задвигали там: ';
    slid_eng_text = ' drop post: ';
for (let one_slid of slid) {
    slid_ru_text += `@${one_slid}, `;
    slid_eng_text += `@${one_slid}, `;
}
slid_ru_text = slid_ru_text.replace(/,\s*$/, "");
slid_eng_text = slid_eng_text.replace(/,\s*$/, "");
}
let body = `Hello, @${author}. You received ${percent}% upvote from UPRomo for burned GBG. Promoted this post in the queue: ${transfers_list}.${slid_eng_text}

**[The instruction for burning, for promotion or a drop of posts](https://golos.id/upromo/@upromo/upromo-instrukciya-dlya-szhigayushikh-dlya-prodvizheniya-ili-zadviganiya-postov), [Invest in UPRomo](https://golos.id/upromo/@upromo/instructions-for-use-upromo-service-for-investors), [Agreement on the use of service](https://golos.id/upromo/@upromo/agreement-on-the-use-of-service-upromo).**

***

Здравствуйте, @${author}. Вы получили ${percent}% апвот от UPRomo за сожженные GBG. Продвигали этот пост в очереди: ${transfers_list}.${slid_ru_text}

**[Инструкция по сжиганию GBG для продвижения или задвигания постов](https://golos.id/upromo/@upromo/upromo-instrukciya-dlya-szhigayushikh-dlya-prodvizheniya-ili-zadviganiya-postov), [Для инвесторов](https://golos.id/upromo/@upromo/upromo-instrukciya-dlya-investorov), [Соглашение об использовании](https://golos.id/upromo/@upromo/soglashenie-ob-ispolzovanii-upromo).**`;
let comment_permlink = 'result-' + now;
let json_metadata = [];
json_metadata.app = "UPromo/2.0";
newTx.push(['vote', {voter: conf.login, author: parent_author, permlink: parent_permlink, weight}]);
newTx.push(['comment', {parent_author,parent_permlink,author:conf.login,permlink: comment_permlink, title: 'UPRomo: comment with results.', body, json_metadata: JSON.stringify(json_metadata)}]);
const current = await getProps();
var blockid = current.head_block_id;
n = [];
for (var i = 0; i < blockid.length; i += 2)
{
    n.push(blockid.substr(i, 2));
}
let hex = n[7] + n[6] + n[5] + n[4];
let refBlockNum = current.head_block_number & 0xffff;
let refBlockPrefix = parseInt(hex, 16)
let trx = {
    'expiration': expire,
    'extensions': [],
    'operations': newTx,
    'ref_block_num': refBlockNum,
    'ref_block_prefix': refBlockPrefix
};
let trxs = "";
try {
    trxs = await golos.auth.signTransaction(trx, {"posting": conf.posting_key});
} catch (error) {
    console.log("Не удалось подписать транзакцию: " + error.message);
}
try {
const broadcast_trx_sync = await golos.api.broadcastTransactionSynchronousAsync(trxs);
console.log(JSON.stringify(broadcast_trx_sync));
return broadcast_trx_sync.id;
} catch(e) {
console.log('Error: ' + e);
    return 0;
}
}

async function sendComment() {
    let now = new Date().getTime() + 18e5,
    expire = new Date(now).toISOString().split('.')[0];
    let newTx = [];
let parent_author = conf.login;
let parent_permlink = 'generate';
let weight = 10000;
let body = `Hello, world! Delegate to us for mining.

***

Здравствуйте, мир! Делегируйте нам для майнинга!`;
let comment_permlink = 'mine-' + now;
let json_metadata = [];
json_metadata.app = "UPromo/2.0";
const extensions = [];
// extensions.push([2,{percent:10000}]);
newTx.push(['comment', {parent_author,parent_permlink,author:conf.login,permlink: comment_permlink, title: 'UPRomo: generated comment.', body, json_metadata: JSON.stringify(json_metadata)}]);
newTx.push(['comment_options', {author:conf.login,permlink: comment_permlink, 'max_accepted_payout':'1000000.000 GBG','percent_steem_dollars':10000,'allow_votes':true,'allow_curation_rewards':true,extensions}]);
newTx.push(['vote', {voter: conf.login, author: parent_author, permlink: comment_permlink, weight}]);
const current = await getProps();
var blockid = current.head_block_id;
n = [];
for (var i = 0; i < blockid.length; i += 2)
{
    n.push(blockid.substr(i, 2));
}
let hex = n[7] + n[6] + n[5] + n[4];
let refBlockNum = current.head_block_number & 0xffff;
let refBlockPrefix = parseInt(hex, 16)
let trx = {
    'expiration': expire,
    'extensions': [],
    'operations': newTx,
    'ref_block_num': refBlockNum,
    'ref_block_prefix': refBlockPrefix
};
let trxs = "";
try {
    trxs = await golos.auth.signTransaction(trx, {"posting": conf.posting_key});
} catch (error) {
    console.log("Не удалось подписать транзакцию: " + error.message);
}
try {
const broadcast_trx_sync = await golos.api.broadcastTransactionSynchronousAsync(trxs);
console.log(JSON.stringify(broadcast_trx_sync));
return broadcast_trx_sync.id;
} catch(e) {
console.log('Error: ' + e);
    return 0;
}
}

async function notifyPosts(posts, leader_amount) {
    let now = new Date().getTime() + 18e5,
    expire = new Date(now).toISOString().split('.')[0];
    let newTx = [];
for (let post of posts) {
    let amount = post.amount;
    let add_amount = leader_amount - amount;
    add_amount *= 1000;
    add_amount = parseInt(add_amount);
    add_amount /= 1000;
        if (add_amount > 0) {
    let parent_author = post.author;
let parent_permlink = post.permlink;
let transfers_list = '';
for (let transfer of post.transfers) {
transfers_list += `@${transfer}, `;
}
transfers_list = transfers_list.replace(/,\s*$/, "");
if (add_amount < 5) {
    add_amount = 5 + ' (меньше добавлять нельзя)';
}
let body = `Hello, @${post.author}.
**We ask you to pay attention to what before removal of your post from list in connection with payment for a post remained <= 24 hours. Control a position [on this page] (https://dpos.space/upromo). Now the first post had ${leader_amount} GBG. To get to the first place and get upvote from the UPRomo service,> ${add_amount} GBG must be added.**

Your post supported: ${transfers_list}

**[Agreement on the use of service UPRomo](https://golos.id/upromo/@upromo/agreement-on-the-use-of-service-upromo).**

***

Здравствуйте, @${post.author}.
**Просим обратить внимание на то, что до удаления вашего поста из очереди в связи с выплатой осталось <= 24 часа. Контролируйте позицию на [соответствующей странице](https://dpos.space/upromo). В настоящее время первый пост имел ${leader_amount} GBG. Для попадания на первое место, а значит, получения апа надо добавить > ${add_amount} GBG.**

Ваш пост поддержали сжиганием: ${transfers_list}

**[Соглашение об использовании UPRomo](https://golos.id/upromo/@upromo/soglashenie-ob-ispolzovanii-upromo).**`;
let comment_permlink = 'worning-' + now;
let json_metadata = [];
json_metadata.app = "UPromo/2.0";
newTx.push(['comment', {parent_author,parent_permlink,author:conf.login,permlink: comment_permlink, title: 'UPRomo: Апвоты за сжигание GBG: ВНИМАНИЕ!', body, json_metadata: JSON.stringify(json_metadata)}]);
    }
}
const current = await getProps();
var blockid = current.head_block_id;
n = [];
for (var i = 0; i < blockid.length; i += 2)
{
    n.push(blockid.substr(i, 2));
}
let hex = n[7] + n[6] + n[5] + n[4];
let refBlockNum = current.head_block_number & 0xffff;
let refBlockPrefix = parseInt(hex, 16)
let trx = {
    'expiration': expire,
    'extensions': [],
    'operations': newTx,
    'ref_block_num': refBlockNum,
    'ref_block_prefix': refBlockPrefix
};
let trxs = "";
try {
    trxs = await golos.auth.signTransaction(trx, {"posting": conf.posting_key});
} catch (error) {
    console.log("Не удалось подписать транзакцию: " + error.message);
}
try {
const broadcast_trx_sync = await golos.api.broadcastTransactionSynchronousAsync(trxs);
console.log(JSON.stringify(broadcast_trx_sync));
return broadcast_trx_sync.id;
} catch(e) {
console.log('Error: ' + e);
    return 0;
}
}

async function getContent(author, permlink) {
try {
let post = await golos.api.getContentAsync(author, permlink, -1);
if (post.parent_author === '') {
let voters_count = 0;
for (let vote of post.active_votes) {
if (vote.voter === conf.login) {
voters_count += 1;
}
}
let created = post.created;
let curation_rewards_percent = post.curation_rewards_percent/100;
return {code: voters_count, created, curation_rewards_percent};
} else {
return {code: -2, error: 'This is a comment..'};
}
} catch(e) {
return {code: -1, error: e};
}
}

async function publickPost(burn_month_amount, body) {
    let wif = conf.posting_key;
    let parentAuthor = '';
    let parentPermlink = 'stats';
    let author = conf.login;
    let now = new Date();
    let month = now.getMonth();
    if (month === 0) {
    month = 12;
    }
    let permlink = 'top' + month + '-' + now.getFullYear();
    let title = 'Лучшие пользователи UPromo за предыдущий месяц, всего сожжено ' + burn_month_amount + ' GBG';
    let jsonMetadata = '{"app": "UPRomo/2.0"}';
    let post = await golos.broadcast.commentAsync(wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata);
return post;
}

function getDelegations() {
    return new Promise((resolve, reject) => {
        golos.api.getVestingDelegations(conf.login, -1, 1000, 'received', function(err, data) {
            if(err) {
                reject(err);
         } else {
                resolve(data);
         }
        });
    });
}

async function battery(user) {
    try {
        let acc = await getAccount(user);
    acc = acc[0];
    let mass3 = await getProps();
        let current_time = new Date(mass3['time']);
        current_time = current_time.getTime();
        let last_vote_datetime = new Date(acc.last_vote_time);
        let last_vote_time = last_vote_datetime.getTime();
        let last_vote_seconds = last_vote_time;
        let fastpower;
        fastpower = 10000/432000;
        fast_power = fastpower.toFixed(5);
        let volume_not = (acc['voting_power']+((current_time-last_vote_seconds)/1000)*fast_power)/100; //расчет текущей Voting Power
        let volume = volume_not.toFixed(2);
         
        let charge;
        if (volume>=100) {
        charge = 100;
        }
        else {
            charge=volume;
        }
        let volume_estimate = volume_not*100;
        let estimate = ((10000-volume_estimate)/fast_power)*1000;//время в секундах до полной регенерации Voting Power
    let estimate_time = new Date(estimate);//cоздание метки времени timestamp
    estimate_time = estimate_time.getTime();
    let now_datetime = new Date();
    let now_time = now_datetime.getTime();
    let ostalos_time = now_time+estimate_time;
    let ostalos_vremeni = new Date(ostalos_time);
    let month7 = ostalos_vremeni.getMonth()+1;
    let power_minus;
    let power_minus_chas;
    if (volume>=100) {
    power_minus = 'Сейчас';
    }
    else {
    power_minus_chas = ostalos_vremeni.getUTCHours();
        power_minus = ostalos_vremeni.getUTCDate() + ' ' + month7 + ' ' + ostalos_vremeni.getUTCFullYear() + '  Г. ' + power_minus_chas + ':' + ostalos_vremeni.getUTCMinutes() + ':' + ostalos_vremeni.getUTCSeconds();
    }
        return {percent: charge, percent100_will_be_view: power_minus, percent100_will_be_sec: estimate};
    } catch(e) {
    console.log(e);
    return await battery();
    }
    }

      module.exports.getOpsInBlock = getOpsInBlock;
module.exports.getBlockHeader = getBlockHeader;
module.exports.getTransaction = getTransaction;
      module.exports.getProps = getProps;
      module.exports.getChainProps = getChainProps;
      module.exports.notifyPosts = notifyPosts;
      module.exports.getContent = getContent;
module.exports.updateAccount = updateAccount;
module.exports.getAccount = getAccount;
module.exports.upvoteAmount = upvoteAmount;
module.exports.sendUpvote = sendUpvote;
module.exports.sendComment = sendComment;
module.exports.publickPost = publickPost;
module.exports.getDelegations = getDelegations;
module.exports.battery = battery;