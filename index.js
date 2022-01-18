const TelegramBot = require('node-telegram-bot-api');
const phoneNoState = {};
const paymentState = {};
const paymentAmountState = {};
const eventStatus = {};
const eventDate = {};
const moment = require('moment');

const noticeState = {};
const dotenv = require("dotenv").config({});
const mongoose = require("mongoose");
// replace the value below with the Telegram token you receive from @BotFather
//const token = process.env.BOT_TOKEN;
const token = '5053585305:AAGsrcn1D96oPA4KUQ2IgXI19TMqT92R03A';
//const token = '5043568396:AAGyAG_L-k3ek4lYR7qW1sD1Z_CXICd77i0';
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const request = require('request');
require('dotenv').config();
const path = require('path');
const fetch = require('node-fetch');
const Event = require('./events');

// this is used to download the file from the link


console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI);

const User = require("./user");
const Payment = require("./payments");
const https = require("https");
const fs = require("fs");

const { MongoClient, GridFSBucket } = require("mongodb");
/// Create a new MongoClient
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("chaithanyadb");
const bucket = new GridFSBucket(db);
client.connect();

const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url).pipe(bucket.openUploadStream(path, {
            chunkSizeBytes: 1048576,
            metadata: { field: `${path}_field`, value: path }
        })).on('close', callback);
    });
};
const express = require("express");
const app = express();
app.listen(process.env.PORT, () => {
    console.log(`App is running on port ${process.env.PORT}`);
})

function convertToISO(dt) {

    darr = dt.split("-");    // ["29", "1", "2016"]
    var dobj = new Date(parseInt(darr[2]), parseInt(darr[1]) - 1, parseInt(darr[0]));
    console.log(dobj.toISOString());
    return dobj.toISOString();
    //2016-01-28T18:30:00.000Z
}
//bot.sendInvoice()

function validateDate(dt) {
    /* var date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
     console.log(testDate)
     console.log(date_regex.test(testDate))
     if (!(date_regex.test(testDate))) {
         return false;
     }*/
    // var reGoodDate = /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})*$/;
    var reGoodDate = /^(?:(0[1-9]|[12][0-9]|3[01])[\-.](0[1-9]|1[012])[\-.](19|20)[0-9]{2})$/;

    return reGoodDate.test(dt);
}

bot.onText(/\/events/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = "നിങ്ങളുടെ ഇവന്റ് നടക്കുന്ന തിയതി ടൈപ്പ് ചെയ്യുക .  തിയതി. DD-MM-YYYY എന്ന ഫോർമാറ്റിൽ ആയിരിക്കാൻ ശ്രദ്ധിക്കണം . ഉദാഹരണം . നിങ്ങളുടെ ഇവന്റ് നടക്കുന്നത്   ഡിസംബർ  8 , 2022 നാണെങ്കിൽ ,   തിയതി.  8-12-2022 എന്ന് ടൈപ്പ് ചെയ്യുക . "
    // send back the matched "whatever" to the chat
    eventStatus[chatId] = true;
    bot.sendMessage(chatId, resp);
})

bot.onText(/\/notice/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = "നിങ്ങൾക് ചൈതന്യ മെമ്പേഴ്സിനോട് പറയാനുള്ള അറിയിപ് എന്താണെന്നു ടൈപ്പ് ചെയ്യുക . "
    // send back the matched "whatever" to the chat
    noticeState[chatId] = true;
    bot.sendMessage(chatId, resp);
})

bot.onText(/\/phone_no/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = "നിങ്ങളുടെ മൊബൈൽ നമ്പർ(ISD കോഡ് ഉൾപ്പടെ ) ടൈപ്പ് ചെയ്യുക. ഉദാഹരണം  +919874112233 "
    // send back the matched "whatever" to the chat
    phoneNoState[chatId] = true;
    /*bucket.openDownloadStreamByName("AgACAgUAAxkBAAIBCWHdhcbV5zJrmVCmN68OriVuNgXbAALWsDEb_k3pVjgeWD3Al--iAQADAgADeQADIwQ.jpg").
        pipe(fs.createWriteStream('./outputFile.jpg'));*/
    bot.sendMessage(chatId, resp);
});

bot.onText(/\/pay/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `നിങ്ങൾ അയച്ച പൈസ എത്ര ആണെന്ന് ടൈപ്പ് ചെയ്യുക`
    // send back the matched "whatever" to the chat
    //paymentState[chatId] = true;
    //bot.sendMessage(chatId, resp);
    bot.sendMessage(msg.chat.id, "മാസവരി ആണോ അതോ അരിയർ ആണോ ???", {
        "reply_markup": {
            "keyboard": [["മാസവരി"], ["അരിയർ"]]
        }
    });
})

bot.onText(/മാസവരി/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `നിങ്ങൾ അയച്ച പൈസ എത്ര ആണെന്ന് ടൈപ്പ് ചെയ്യുക`
    // send back the matched "whatever" to the chat
    paymentState[chatId] = true;
    bot.sendMessage(chatId, resp, { reply_markup: { remove_keyboard: true } });

})

bot.onText(/അരിയർ/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `നിങ്ങൾ അയച്ച പൈസ എത്ര ആണെന്ന് ടൈപ്പ് ചെയ്യുക`
    // send back the matched "whatever" to the chat
    paymentState[chatId] = true;
    bot.sendMessage(chatId, resp, { reply_markup: { remove_keyboard: true } });

})

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    try {
        console.log(paymentState);
        if (phoneNoState[chatId]) {
            let user = await User.findOne({ "phone": msg.text })
            if (user) {
                user.chatId = chatId;
                await user.save();
                delete phoneNoState[chatId]
                let resp = `ഹായ്  ${user.name} , നിങ്ങളുടെ മൊബൈൽ നമ്പർ അപ്ഡേറ്റ് ആയിരിക്കുന്നതായി അറിയിക്കുന്നു .`
                bot.sendMessage(chatId, resp);
            } else {
                let resp = `നിങ്ങൾ തെറ്റായ മൊബൈൽ നമ്പർ ആണ് നൽകിയത്. വീണ്ടും ശ്രമിക്കുക . `
                bot.sendMessage(chatId, resp);
            }
        } else if (paymentState[chatId]) {
            console.log(msg);
            parseInt(msg.text)
            if (isNaN(parseInt(msg.text))) {
                let resp = `നിങ്ങൾ തെറ്റായ തുക ആണ് ടൈപ്പ് ചെയ്തത് . വീണ്ടും ശ്രമിക്കുക . `
                bot.sendMessage(chatId, resp);
            } else {
                paymentAmountState[chatId] = msg.text;
                let resp = `ഇനി രസീത് അപ്‌ലോഡ് ചെയ്യുക  `
                bot.sendMessage(chatId, resp);
                delete paymentState[chatId]

            }

        } else if (noticeState[chatId]) {
            let userList = await User.find({ "chatId": { "$ne": chatId } })
            delete noticeState[chatId]
            userList.forEach((item) => {
                bot.sendMessage(item.chatId, msg.text);
            })
        } else if (eventStatus[chatId]) {
            console.log(eventDate);
            if (eventDate[chatId]) {
                const event = new Event({
                    chatId: chatId,
                    eventDate: convertToISO(eventDate[chatId]),
                    eventText: msg.text
                })
                await event.save();
                let resp = `നിങ്ങളുടെ അറിയിപ് എല്ലാവരെയും അറിയിച്ചിട്ടുണ്ട്.  നിങ്ങളുടെ ഇവന്റ് നടക്കുന്ന ദിവസം എല്ലാവരെയും ഞാൻ ഒന്ന് കൂടി ഓര്മ പെടുത്താം . നിങ്ങളുടെ ഇവന്റിന് എല്ലാ വിധ ആശംസകളും അറിയിച്ചു കൊള്ളുന്നു. `
                bot.sendMessage(chatId, resp);
                delete eventStatus[chatId]
                delete eventDate[chatId]

                let userList = await User.find({ "chatId": { "$ne": chatId } })
                userList.forEach((item) => {
                    bot.sendMessage(item.chatId, msg.text);
                })
            } else if (validateDate(msg.text)) {
                eventDate[chatId] = msg.text;
                let resp = `നിങ്ങളുടെ അറിയിപ് ടൈപ്പ് ചെയ്യുക . `
                bot.sendMessage(chatId, resp);
            } else {
                let resp = `നിങ്ങൾ ടൈപ്പ് ചെയ്ത തിയതി കറക്റ്റ് അല്ല.  തിയതി. DD-MM-YYYY എന്ന ഫോർമാറ്റിൽ ആയിരിക്കാൻ ശ്രദ്ധിക്കണം . ഉദാഹരണം . നിങ്ങളുടെ ഇവന്റ് നടക്കുന്നത്   ഡിസംബർ  8 , 2022 നാണെങ്കിൽ ,   തിയതി.  8-12-2022 എന്ന് ടൈപ്പ് ചെയ്യുക . `
                bot.sendMessage(chatId, resp);
            }
        }
        else {
            if (msg.text !== '/pay' && msg.text !== '/phone_no' && msg.text !== '/notice' && msg.text !== '/events' && msg.text != 'മാസവരി' && msg.text != 'അരിയർ' && !msg.photo) {
                let user = await User.findOne({ chatId: chatId })
                if (user) {
                    let resp = ` ${user.name}.. രസീത് അപ്‌ലോഡ് ചെയ്യാനാണേൽ  ഇടതു വശത്തു കാണുന്ന മെനുവിൽ രണ്ടാമത്തെ ഓപ്ഷൻ ക്ലിക്ക് ചെയ് `
                    bot.sendMessage(chatId, resp);
                } else {
                    let resp = `ആളെ മനസിലായില്ല .. മൊബൈൽ നമ്പർ ഒന്ന് അപ്ഡേറ്റ് ചെയ് .  മെനുവിലെ ആദ്യത്തെ ഓപ്ഷൻ ക്ലിക്ക് ചെയ്താൽ മതി `
                    bot.sendMessage(chatId, resp);
                }
            }

        }
    } catch (err) {
        console.error(err);
    }

    /*
      bot.sendMessage(msg.chat.id, "Welcome", {
    "reply_markup": {
        "keyboard": [["Sample text", "Second sample"],   ["Keyboard"], ["I'm robot"]]
        }
    });*/
});

bot.on('photo', async (doc) => {
    const chatId = doc.chat.id;
    try {
        if (paymentAmountState[chatId]) {
            const fileId = doc.photo[2].file_id;

            // an api request to get the "file directory" (file path)
            const res = await fetch(
                `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getFile?file_id=${fileId}`
            );
            // extract the file path
            const res2 = await res.json();
            const filePath = res2.result.file_path;

            // now that we've "file path" we can generate the download link
            const downloadURL =
                `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;

            let user = await User.findOne({ chatId: chatId });
            let payment = new Payment({
                userId: user.id,
                fileName: `${fileId}.jpg`,
                chatId: chatId,
                amount: paymentAmountState[chatId]
            })
            await payment.save();
            download(downloadURL, `${fileId}.jpg`, () => {
                let resp = `നിങ്ങൾ വിജയകരമായി രസീത് അപ്‌ലോഡ് ചെയ്തിരിക്കുന്നു . വീണ്ടും കാണാം നന്ദി . `
                bot.sendMessage(chatId, resp);
            }

            );

        }
    } catch (err) {

    }


});
