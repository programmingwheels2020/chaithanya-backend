const TelegramBot = require('node-telegram-bot-api');
const phoneNoState = {};
const paymentState = {};
const paymentAmountState = {};
const eventStatus = {};
const eventDate = {};
const feeType = {};
const moment = require('moment');
const bodyParser = require("body-parser");
const { InlineKeyboard, ReplyKeyboard, ForceReply, Row, KeyboardButton, InlineKeyboardButton } = require("node-telegram-keyboard-wrapper");

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
const FeeType = require("./feetypes");

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

const downloadPromisfy = (url, path) => {
    return new Promise((resolve, reject) => {
        download(url, path, () => {
            return resolve();
        })
    })
}
const express = require("express");
const { Login } = require('./controllers');
const callbackQuery = require('./callbackquery');
const app = express();

app.use(bodyParser.json());

const cron = require('node-cron');
const { sendLevyReminder } = require('./cronjobfn');


app.get("/get-file/:fileName", (req, res) => {
    bucket.openDownloadStreamByName(req.params.fileName).
        pipe(res);
})

const getImageBuffer = (fileName) => {
    let data = "";
    return new Promise((resolve, reject) => {
        const readStream = bucket.openDownloadStreamByName(fileName)
        readStream.setEncoding('binary')
        readStream.once('error', err => {
            return cb(err)
        })
        readStream.on("data", (chunk) => {
            data += chunk
        })
        readStream.on("end", () => {
            return resolve(Buffer.from(data, 'binary'))

        })
    })

}

app.post("/login", Login)
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

function clearStatus(id) {

    phoneNoState[id] && delete phoneNoState[id]
    paymentState[id] && delete paymentState[id]
    paymentAmountState[id] && delete paymentAmountState[id]
    eventDate[id] && delete eventDate[id]
    eventStatus[id] && delete eventStatus[id]
}
/*
cron.schedule('15 17 31 * *', () => {
    sendLevyReminder(bot);
});*/

cron.schedule('15 17 1 * *', () => {
    sendLevyReminder(bot);
});



bot.onText(/\/events/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = "??????????????????????????? ?????????????????? ??????????????????????????? ??????????????? ?????????????????? ????????????????????? .  ???????????????. DD-MM-YYYY ???????????? ?????????????????????????????? ?????????????????????????????? ???????????????????????????????????? . ????????????????????? . ??????????????????????????? ?????????????????? ?????????????????????????????????   ??????????????????  8 , 2022 ??????????????????????????? ,   ???????????????.  8-12-2022 ??????????????? ?????????????????? ????????????????????? . "
    // send back the matched "whatever" to the chat
    clearStatus(chatId);
    eventStatus[chatId] = true;
    bot.sendMessage(chatId, resp);
})

bot.onText(/\/report/, async (msg, match) => {

    const chatId = msg.chat.id;
    clearStatus(chatId);
    const resp = "??????????????? ????????????????????????????????? ????????? ????????????????????? ??????????????? ????????????????????? ????????????????????? . "
    let userList = await User.find({}).sort({ "name": 1 });
    const inlineKeyboard = new InlineKeyboard();
    for (let i = 0; i < userList.length; i++) {
        if (i % 2 == 0 && i < userList.length - 1) {
            let myRow = new Row(
                new InlineKeyboardButton(userList[i].name, "callback_data", `report_${userList[i]._id}`),
                new InlineKeyboardButton(userList[i + 1].name, "callback_data", `report_${userList[i + 1]._id}`),
                // new InlineKeyboardButton(userList[i + 2].name, "callback_data", `report_${userList[i + 2]._id}`),
            )
            inlineKeyboard.push(myRow);
        }
        if (i == userList.length - 1) {
            let lastRow = new Row(
                new InlineKeyboardButton(userList[i].name, "callback_data", `report_${userList[i]._id}`)
            )
            inlineKeyboard.push(lastRow);
        }


    }
    const options = {
        reply_markup: inlineKeyboard.getMarkup()
    }

    //bot.sendMessage(msg.from.id, "This is a message with an inline keyboard.", options);
    bot.sendMessage(chatId, resp, options);
})
const getTypeOfPayment = (no) => {
    switch (no) {
        case 1:
            return "??????????????????";
            break;
        case 2:
            return "???????????????";
            break;
        case 3:
            return "?????????????????????????????????";
            break;
        case 4:
            return "?????????????????????";
            break;
        default:
            return "??????????????????"
            break;
    }
}
bot.onText(/\/pending_rp/, async (msg, match) => {

    const chatId = msg.chat.id;
    clearStatus(chatId);
    try {
        let paymentList = await Payment.find({ approveStatus: 0 });
        for (let paym of paymentList) {
            let resp = `-------------------------`
            await bot.sendMessage(chatId, resp)
            //let url = `http://104.211.13.180:3000/get-file/${paym.fileName}`

            //let url = `https://media.gettyimages.com/photos/lionel-messi-of-argentina-poses-for-a-portrait-during-the-official-picture-id972635442?s=612x612`
            let buf = await getImageBuffer(paym.fileName);
            await bot.sendPhoto(chatId, buf);
            let userDetails = await User.findById(paym.userId);
            resp = `Payment Details ---
               Type: ${getTypeOfPayment(paym.feeType)},
               Amount : ${paym.amount},
               Member : ${userDetails.name},
               DateOfPayment : ${paym.createdAt}
            `
            const inlineKeyboard = new InlineKeyboard();
            let myRow = new Row(
                new InlineKeyboardButton("Approve", "callback_data", `payment_approve_${paym._id}`),
                new InlineKeyboardButton("Reject", "callback_data", `payment_reject_${paym._id}`),
                // new InlineKeyboardButton(userList[i + 2].name, "callback_data", `report_${userList[i + 2]._id}`),
            )
            inlineKeyboard.push(myRow);
            const options = {
                reply_markup: inlineKeyboard.getMarkup()
            }

            //bot.sendMessage(msg.from.id, "This is a message with an inline keyboard.", options);
            await bot.sendMessage(chatId, resp, options);
        }
    } catch (err) {
        console.log(err.message);
    }

}

)

callbackQuery(bot, bucket);
/*
bot.on("callback_query", async (query) => {
    console.log(query);
    await bot.answerCallbackQuery(query.id, { text: "Action received!" })
    await bot.sendMessage(query.from.id, "Hey there! You clicked on an inline button! ;) So, as you saw, the support library works!");
});*/

bot.on("error", (err) => {
    console.log(err.message);
})
bot.on("polling_error", (err) => console.log(err));

bot.onText(/\/notice/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = "???????????????????????? ?????????????????? ?????????????????????????????????????????? ??????????????????????????? ????????????????????? ????????????????????????????????? ?????????????????? ????????????????????? . "
    // send back the matched "whatever" to the chat
    clearStatus(chatId);
    noticeState[chatId] = true;
    bot.sendMessage(chatId, resp);
    //bot.sendPhoto
})

bot.onText(/\/phone_no/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = "??????????????????????????? ??????????????? ???????????????(ISD ???????????? ????????????????????? ) ?????????????????? ?????????????????????. ?????????????????????  +919874112233 "
    // send back the matched "whatever" to the chat
    clearStatus(chatId);
    phoneNoState[chatId] = true;
    /*bucket.openDownloadStreamByName("AgACAgUAAxkBAAIBCWHdhcbV5zJrmVCmN68OriVuNgXbAALWsDEb_k3pVjgeWD3Al--iAQADAgADeQADIwQ.jpg").
        pipe(fs.createWriteStream('./outputFile.jpg'));*/
    bot.sendMessage(chatId, resp);
});

bot.onText(/\/pay/, async (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `?????????????????? ??????????????? ????????? ???????????? ????????????????????? ?????????????????? ?????????????????????`
    // send back the matched "whatever" to the chat
    //paymentState[chatId] = true;
    //bot.sendMessage(chatId, resp);
    clearStatus(chatId);
    try {
        const feeTypes = await FeeType.find({});
        let types = [];
        feeTypes.forEach(item => {
            types.push([item.name]);
        })
        console.log(types);
        bot.sendMessage(msg.chat.id, "?????????????????? ????????? ????????? ??????????????? ????????? ???", {
            "reply_markup": {
                //"keyboard": [["??????????????????"], ["???????????????"]]
                "keyboard": types
            }
        });
    } catch (err) {
        console.error(err);
    }

})

bot.onText(/??????????????????/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `?????????????????? ??????????????? ????????? ???????????? ????????????????????? ?????????????????? ?????????????????????`
    // send back the matched "whatever" to the chat
    paymentState[chatId] = true;
    feeType[chatId] = 1
    bot.sendMessage(chatId, resp, { reply_markup: { remove_keyboard: true } });

})

bot.onText(/???????????????/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `?????????????????? ??????????????? ????????? ???????????? ????????????????????? ?????????????????? ?????????????????????`
    // send back the matched "whatever" to the chat
    paymentState[chatId] = true;
    feeType[chatId] = 2
    bot.sendMessage(chatId, resp, { reply_markup: { remove_keyboard: true } });

})
bot.onText(/?????????????????????????????????/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `?????????????????? ??????????????? ????????? ???????????? ????????????????????? ?????????????????? ?????????????????????`
    // send back the matched "whatever" to the chat
    paymentState[chatId] = true;
    feeType[chatId] = 3
    bot.sendMessage(chatId, resp, { reply_markup: { remove_keyboard: true } });

})

bot.onText(/?????????????????????/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `?????????????????? ??????????????? ????????? ???????????? ????????????????????? ?????????????????? ?????????????????????`
    // send back the matched "whatever" to the chat
    paymentState[chatId] = true;
    feeType[chatId] = 4
    bot.sendMessage(chatId, resp, { reply_markup: { remove_keyboard: true } });

})

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    try {
        const cmdList = ["/phone_no", "/pay", "/notice", "/events", "/report", "/pending_rp"]
        console.log(msg.text)
        if (cmdList.indexOf("msg.text") != -1) {
            return;
        }
        if (phoneNoState[chatId]) {
            let user = await User.findOne({ "phone": msg.text })
            if (user) {
                user.chatId = chatId;
                user.activatedStatus = true;
                await user.save();
                delete phoneNoState[chatId]
                let resp = `????????????  ${user.name} , ??????????????????????????? ??????????????? ??????????????? ??????????????????????????? ???????????????????????????????????????????????? ??????????????????????????????????????? .`
                bot.sendMessage(chatId, resp);
            } else {
                let resp = `?????????????????? ????????????????????? ??????????????? ??????????????? ????????? ?????????????????????. ????????????????????? ?????????????????????????????? . `
                bot.sendMessage(chatId, resp);
            }
        } else if (paymentState[chatId]) {
            console.log(msg);
            parseInt(msg.text)
            if (isNaN(parseInt(msg.text))) {
                let resp = `?????????????????? ????????????????????? ????????? ????????? ?????????????????? ????????????????????? . ????????????????????? ?????????????????????????????? . `
                bot.sendMessage(chatId, resp);
            } else {
                paymentAmountState[chatId] = msg.text;
                let resp = `????????? ??????????????? ???????????????????????? ?????????????????????  `
                bot.sendMessage(chatId, resp);
                delete paymentState[chatId]

            }

        } else if (noticeState[chatId]) {
            let userList = await User.find({ "chatId": { "$ne": chatId }, activatedStatus: true })
            delete noticeState[chatId]
            let sender = await User.findOne({ "chatId": chatId })
            let respMsg = `???????????????????????? ${sender.name} ????????????????????? ????????? ??????????????????????????????????????? . 
            ---------------------------------------
            ${msg.text}
            `
            userList.forEach((item) => {
                bot.sendMessage(item.chatId, respMsg);
                //bot.sendMessage(chatId, respMsg);
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
                let resp = `??????????????????????????? ????????????????????? ????????????????????????????????? ???????????????????????????????????????????????????.  ??????????????????????????? ?????????????????? ??????????????????????????? ??????????????? ????????????????????????????????? ????????? ??????????????? ???????????? ???????????? ??????????????????????????? . ??????????????????????????? ???????????????????????? ??????????????? ????????? ???????????????????????? ??????????????????????????? ??????????????????????????????. `
                bot.sendMessage(chatId, resp);
                delete eventStatus[chatId]
                delete eventDate[chatId]

                let userList = await User.find({ "chatId": { "$ne": chatId }, activatedStatus: true })
                userList.forEach((item) => {
                    bot.sendMessage(item.chatId, msg.text);
                })
            } else if (validateDate(msg.text)) {
                eventDate[chatId] = msg.text;
                let resp = `??????????????????????????? ????????????????????? ?????????????????? ????????????????????? . `
                bot.sendMessage(chatId, resp);
            } else {
                let resp = `?????????????????? ?????????????????? ??????????????? ??????????????? ???????????????????????? ????????????.  ???????????????. DD-MM-YYYY ???????????? ?????????????????????????????? ?????????????????????????????? ???????????????????????????????????? . ????????????????????? . ??????????????????????????? ?????????????????? ?????????????????????????????????   ??????????????????  8 , 2022 ??????????????????????????? ,   ???????????????.  8-12-2022 ??????????????? ?????????????????? ????????????????????? . `
                bot.sendMessage(chatId, resp);
            }
        }
        else {
            if (msg.text !== '/pay' && msg.text !== '/report' && msg.text !== '/pending_rp' && msg.text !== '/phone_no' && msg.text !== '/notice' && msg.text !== '/events' && msg.text != '??????????????????' && msg.text != '???????????????' && msg.text != '?????????????????????????????????' && msg.text != '?????????????????????' && !msg.photo) {
                let user = await User.findOne({ chatId: chatId })
                if (user) {
                    let resp = ` ${user.name}.. ??????????????? ???????????????????????? ?????????????????????????????????  ???????????? ?????????????????? ????????????????????? ????????????????????? ?????????????????????????????? ??????????????? ???????????????????????? ???????????? `
                    bot.sendMessage(chatId, resp);
                } else {
                    let resp = `????????? ????????????????????????????????? .. ??????????????? ??????????????? ??????????????? ??????????????????????????? ???????????? .  ???????????????????????? ???????????????????????? ??????????????? ???????????????????????? ????????????????????? ????????? `
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
                amount: paymentAmountState[chatId],
                feeType: feeType[chatId]
            })
            await payment.save();
            console.log("))))))))))))))))))))))))")
            let result = await downloadPromisfy(downloadURL, `${fileId}.jpg`,);
            let resp = `?????????????????? ?????????????????????????????? ??????????????? ???????????????????????? ???????????????????????????????????????????????? . ????????????????????? ??????????????? ??????????????? . `
            bot.sendMessage(chatId, resp);

        }
    } catch (err) {

    }


});

module.exports = bucket