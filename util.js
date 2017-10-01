'use strict';

var me = {};

me.createRandomId = () => {
    return Date.now() // it should be ok
}


me.typeofPeer = (id) => {
    var _id = id
    if (id instanceof String && !isNaN(id)) _id = parseInt(id)
    if (_id > 0)
        return 'User'
    else if (_id < -(Math.pow(10, 12)))
        return 'Channel'
    else if (_id < 0)
        return 'Chat'
}


me.createInputPeer = (id) => {
    var _id = id
    if (id instanceof String && !isNaN(id)) _id = parseInt(id)
    if (_id > 0)
        return {'_': 'inputPeerUser', user_id: _id}
    else if (_id < -(Math.pow(10, 12)))
        return {'_': 'inputPeerChannel', channel_id: -(_id + Math.pow(10, 12))}
    else if (_id < 0)
        return {'_': 'inputPeerChat', chat_id: -_id}
}

me.createReplyMarkup = (reply_markup) => {
    if (reply_markup.remove_keyboard) 
        return {
            _: 'replyKeyboardHide',
            selective: reply_markup.selective?true:false
        }
    else if (reply_markup.force_reply)
        return {
            _: 'replyKeyboardForceReply',
            single_use: reply_markup.single_use?true:false,
            selective: reply_markup.selective?true:false
        }
    else if (reply_markup.keyboard) {
        var rows = []
        reply_markup.keyboard.forEach((row) => {
            var buttons = []
            row.forEach((button) => {
                if (button.request_contact) 
                    buttons.push({
                        _: 'keyboardButtonRequestPhone',
                        text: button.text
                    })
                else if (button.request_location)
                    buttons.push({
                        _: 'keyboardButtonRequestGeoLocation',
                        text: button.text
                    })
                else 
                    button.push({
                        _: 'keyboardButton',
                        text: button.text
                    })
            })
            rows.push({buttons})
        })
        return {
            _: 'replyKeyboardMarkup',
            resize: reply_markup.resize_keyboard?true:false,
            selective: reply_markup.selective?true:false,
            single_use: reply_markup.one_time_keyboard?true:false,
            rows: rows
        }
    } else if (reply_markup.inline_keyboard) {
                var rows = []
        reply_markup.inline_keyboard.forEach((row) => {
            var buttons = []
            row.forEach((button) => {
                if (button.callback_game) 
                    buttons.push({
                        _: 'keyboardButtonGame',
                        text: button.text
                    })
                else if (button.switch_inline_query_current_chat)
                    buttons.push({
                        _: 'keyboardButtonSwitchInline',
                        same_peer: true,
                        query: button.switch_inline_query_current_chat,
                        text: button.text
                    })
                else if (button.switch_inline_query) 
                    buttons.push({
                        _: 'keyboardButtonSwitchInline',
                        same_peer: false,
                        query: button.switch_inline_query,
                        text: button.text
                    })
                else if (button.callback_data) 
                    buttons.push({
                        _: 'keyboardButtonCallback',
                        data: Buffer.from(button.callback_data),
                        text: button.text
                    })
                else if (button.url)
                    buttons.push({
                        _: 'keyboardButtonUrl',
                        data: Buffer.from(button.url),
                        text: button.text
                    })
                else 
                    button.push({
                        _: 'keyboardButton',
                        text: button.text
                    })
            })
            rows.push({buttons})
        })
        return {
            _: 'replyInlineMarkup',
            rows: rows
        }
    }
}

me.isAdministrator = (participant) => {
    switch (participant._){
        case 'chatParticipantCreator': 
        case 'chatParticipantAdmin':
            return true
        default: 
            return false
    }
}

me.parseEntities = (message) => {
    if (!Array.isArray(message)) return { message, entities:false }
    var text = ''
    var entities = {}
    message.forEach(shard => {
        let offset = text.length, length = shard.text.length
        text += shard.text
        if (shard.type) {
            entities.push({
                _: '', //?
                offset,
                length,
            })
        }
    })
    return { message: text, entities }
}
    
module.exports = exports = me