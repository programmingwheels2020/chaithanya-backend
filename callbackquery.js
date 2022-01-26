const User = require("./user");
const fs = require("fs");
const mongoose = require("mongoose");
const nodeHtmlToImage = require('node-html-to-image');
const Payment = require("./payments");

const CalculateTotalLevy = (year, userId) => {
    console.log(new Date(year, 7, 1));
    console.log(userId);
    return Payment.find({
        "feeType": 1, approveStatus: 1, userId: new mongoose.Types.ObjectId(userId), createdAt: {
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

const CalculateTotalArrearPaid = (year, userId) => {
    console.log(new Date(year, 7, 1));
    console.log(userId);
    return Payment.find({
        "feeType": 2, approveStatus: 1, userId: new mongoose.Types.ObjectId(userId), createdAt: {
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
            let lev = totalLevy % 300 == 0 ? 300 : totalLevy % 300
            barData += `<td>
                        <span class="label">${lev}</span>
                        <div class="bar" style="height:${Math.round(lev / 300 * 100)}%"></div>
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

const getTypeOfPayment = (no) => {
    switch (no) {
        case 1:
            return "മാസവരി";
            break;
        case 2:
            return "അരിയർ";
            break;
        case 3:
            return "ടെന്റ്ഫണ്ട്";
            break;
        case 4:
            return "ജേഴ്‌സി";
            break;
        default:
            return "മാസവരി"
            break;
    }
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
            let arrearPaid = await CalculateTotalArrearPaid(2022, queryDataStr[1]);
            console.log("arrear paid", arrearPaid)
            let currentArrear = user.openingArrier - arrearPaid
            await createReportImage(query.data, totalLevy, currentArrear, user.name);
            const buf = fs.readFileSync(`./public/${query.data}.jpg`);
            await bot.sendPhoto(query.from.id, buf);
            //await bot.sendPhoto(query.from.id, fs.readFileSync("./public/" + query.data + ".jpg"))
            //await bot.sendMessage(query.from.id, response);
        }
        if (queryDataStr[0] == 'payment') {
            let payment = await Payment.findById(queryDataStr[2]);
            payment.approveStatus = queryDataStr[1] == "approve" ? 1 : 2
            await payment.save();
            let resp = '';
            if (queryDataStr[1] == "reject") {
                resp = `നിങ്ങൾ അപ്‌ലോഡ് ചെയ്ത രസീത്  ട്രഷറി നിരസിച്ചിരിക്കുന്നു .  കൂടുതൽ വിവരങ്ങൾക് ട്രെഷററെ ബന്ധപെടുക . `
            }
            if (queryDataStr[1] == "approve") {
                resp = `നിങ്ങൾ അയച്ച  ${payment.amount} രൂപ,   ട്രഷറി  ${getTypeOfPayment(payment.feeType)} ലേക്  വരവ് വച്ചതായി അറിയിക്കുന്നു. നന്ദി . കൂടുതൽ വിവരങ്ങൾക് മാസവാരി റിപ്പോർട്ട് നോക്കുക .   `
            }
            await bot.sendMessage(payment.chatId, resp);
            let url = `http://104.211.13.180:3000/get-file/${payment.fileName}`
            //let url = `https://media.gettyimages.com/photos/lionel-messi-of-argentina-poses-for-a-portrait-during-the-official-picture-id972635442?s=612x612`
            await bot.sendPhoto(payment.chatId, url);
        }

    });
}

module.exports = callbackQuery