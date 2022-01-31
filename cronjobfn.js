const User = require("./user");
const Payment = require("./payments");
const mongoose = require('mongoose');
const { calculateObjectSize } = require("bson");

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
const sendLevyReminder = async (bot) => {
    let userList = await User.find({ activatedStatus: true })
    const d = new Date();
    let month = d.getMonth();
    //month = month + 1;
    for (let user of userList) {

        let levy = await CalculateTotalLevy(2022, user._id);
        let levyAr = ((month * 300) - levy) > 0 ? ((month * 300) - levy) : 0

        let resp = ``;
        if (levyAr !== 0) {
            resp = `ഹലോ ${user.name},  ഈ വര്ഷം നാളിതുവരെ ${month * 300} രൂപയാണ് മാസവാരിയായി നൽകേണ്ടത് . നിങ്ങൾ ആകെ ഈ വര്ഷം ${levy} രൂപ മാസവാരിയായി നൽകിയിട്ടുണ്ട് . ബാക്കി ${levyAr} മാസവാരി എത്രയും പെട്ടെന്നു അടച്ചു തീർക്കണമെന്നു അഭ്യർത്ഥിക്കുന്നു . `
        } else {
            resp = `ഹാലോ ${user.name}.. ഈ വര്ഷം ഇതുവരെ മാസവരി കൃത്യമായി അടച്ചതിനു അഭിനന്ദനങ്ങൾ അറിയിച്ചുകൊള്ളുന്നു . നന്ദി `
        }
        await bot.sendMessage(user.chatId, resp);
    }
}

module.exports = {
    sendLevyReminder
}