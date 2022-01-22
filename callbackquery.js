const User = require("./user");
const fs = require("fs");
const mongoose = require("mongoose");
const nodeHtmlToImage = require('node-html-to-image');
const Payment = require("./payments");

const CalculateTotalLevy = (year, userId) => {
    console.log(new Date(year, 7, 1));
    console.log(userId);
    return Payment.find({
        "feeType": 1, userId: new mongoose.Types.ObjectId(userId), createdAt: {
            $gte: new Date(year - 1, 1, 1),
            $lt: new Date(year, 12, 31)
        }
    })
        .then(payments => {
            let sum = 0;
            payments.forEach(item => {
                sum += item.amount
            })
            return sum;
        })
}

const createReportImage = (imageName, totalLevy, totalArrier, userName) => {
    let wor = fs.readFileSync('./individual_report.html').toString()
    wor = wor.replace('$name', userName);
    wor = wor.replace('$arrier', totalArrier ? totalArrier : 0);
    wor = wor.replace('$totalLevy', totalLevy);
    let barData = ``;
    let noOfMonths = Math.ceil(totalLevy / 300);
    for (i = 0; i < noOfMonths; i++) {
        if (i == noOfMonths - 1) {
            barData += `<td>
                        <span class="label">${totalLevy % 300}</span>
                        <div class="bar" style="height:${Math.round((totalLevy % 300) / 300 * 100)}%"></div>
                    </td>`
        } else {
            barData += `<td>
                        <span class="label">300</span>
                        <div class="bar" style="height:100%"></div>
                    </td>`
        }
    }
    wor = wor.replace('$chartData', barData);
    const d = new Date();
    let month = d.getMonth();
    let per = Math.floor((totalLevy / (300 * (month + 1))) * 100)
    let complaince = per > 100 ? 100 : per
    console.log(complaince)
    wor = wor.replace('$complaince', complaince);
    return nodeHtmlToImage({
        output: `./public/${imageName}.jpg`,
        html: wor.toString()
    })
}

const callbackQuery = async (bot) => {
    bot.on("callback_query", async (query) => {
        console.log("----------")
        //console.log(query);
        let queryDataStr = query.data.split('_');
        console.log(queryDataStr);
        await bot.answerCallbackQuery(query.id, { text: "Action received!" })
        if (queryDataStr[0] == 'report') {
            console.log(query.data);
            let user = await User.findById(queryDataStr[1]);

            let totalLevy = await CalculateTotalLevy(2022, queryDataStr[1]);
            await createReportImage(query.data, totalLevy, user.openingArrier, user.name);
            const buf = fs.readFileSync(`./public/${query.data}.jpg`);
            await bot.sendPhoto(query.from.id, buf);
            //await bot.sendPhoto(query.from.id, fs.readFileSync("./public/" + query.data + ".jpg"))
            //await bot.sendMessage(query.from.id, response);
        }

    });
}

module.exports = callbackQuery