const mongoose = require("mongoose")

const EventSchema = new mongoose.Schema({
    eventDate: { type: Date, required: true },
    eventText: { type: String, required: true },
    chatId: { type: Number, required: true },
})

module.exports = mongoose.model("Event", EventSchema);