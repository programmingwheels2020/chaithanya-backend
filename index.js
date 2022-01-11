const TelegramBot = require('node-telegram-bot-api');
const phoneNoState = {};
const paymentState = {};
const paymentAmountState = {};
const dotenv = require("dotenv").config({});
const mongoose = require("mongoose");
// replace the value below with the Telegram token you receive from @BotFather
//const token = process.env.BOT_TOKEN;
const token = '5053585305:AAGsrcn1D96oPA4KUQ2IgXI19TMqT92R03A';
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const request = require('request');
require('dotenv').config();
const path = require('path');
const fetch = require('node-fetch');

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
    bot.sendMessage(chatId, resp);

})

bot.onText(/അരിയർ/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `നിങ്ങൾ അയച്ച പൈസ എത്ര ആണെന്ന് ടൈപ്പ് ചെയ്യുക`
    // send back the matched "whatever" to the chat
    paymentState[chatId] = true;
    bot.sendMessage(chatId, resp);

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

        } else {
            if (msg.text !== '/pay' && msg.text !== '/phone_no' && msg.text != 'മാസവരി' && msg.text != 'അരിയർ' && !msg.photo) {
                let user = await User.findOne({ chatId: chatId })
                if (user) {
                    let resp = `കുമ്പാരി ${user.name}.. രസീത് അപ്‌ലോഡ് ചെയ്യാനാണേൽ  ഇടതു വശത്തു കാണുന്ന മെനുവിൽ രണ്ടാമത്തെ ഓപ്ഷൻ ക്ലിക്ക് ചെയ് `
                    bot.sendMessage(chatId, resp);
                } else {
                    let resp = `കുമ്പാരി ആളെ മനസിലായില്ല .. മൊബൈൽ നമ്പർ ഒന്ന് അപ്ഡേറ്റ് ചെയ് .  മെനുവിലെ ആദ്യത്തെ ഓപ്ഷൻ ക്ലിക്ക് ചെയ്താൽ മതി `
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

/*


const { Telegraf } = require("telegraf");
const dotenv = require("dotenv").config({});
const token = `5053585305:AAGsrcn1D96oPA4KUQ2IgXI19TMqT92R03A`
const bot = new Telegraf(token);

bot.start(ctx => {
    ctx.reply(
        `Welcome to ${ctx.from.first_name}`
    );
});




bot.startPolling();

/*const express = require("express")
const dotenv = require("dotenv").config({});
const bodyParser = require("body-parser")
const axios = require("axios");

const app = express();



app.use(bodyParser.json());
const port = process.env.PORT;
const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI
const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data)
}

app.post(URI, async (req, res) => {
    console.log(req.body)

    const chatId = req.body.message.chat.id
    const text = req.body.message.text

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text
    })
    return res.send()
})

app.listen(port, async () => {
    console.log(`Server is listening on port ${port}`);
    await init()
})*/