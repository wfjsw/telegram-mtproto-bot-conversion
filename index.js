// var client, token // is it necessary?
const _util = require('./util')

// main

var BotConversion = (client, options) => {
    this.client = client
    this.options = options
    if (options.api_id instanceof String) 
        this.options.api_id = parseInt(options.api_id)
}

BotConversion.prototype.start = () => {
    return this.client('auth.importBotAuthorization', {
        api_id: this.options.api_id,
        api_hash: this.options.api_hash,
        bot_auth_token: this.options.token
    }).then((auth) => {
        return auth.user
    })
}

BotConversion.prototype.getMe = () => {
    return this.client('users.getFullUser', {
        id: { _: 'inputUserSelf' } 
    })
    .then((userfull) => {
        //this.me = userfull.user // update Cached Auth
        return { 
            id: userfull.user.id,
            first_name: userfull.user.first_name,
            last_name: userfull.user.last_name,
            username: userfull.user.username
        }
    })
});


BotConversion.prototype.sendMessage = (chat_id, text, options) => {
    var _options = Object.assign({}, options)
    var targetPeer = _util.createPeer(chat_id)
    var opt = {
        no_webpage: _options.disable_web_page_preview?true:false,
        silent: _options.disable_notification?true:false,
        peer: targetPeer,
        message: text,
        random_id: _util.createRandomId(),
    }
    if (_options.reply_to_message_id) 
        opt = Object.assign(opt, { reply_to_msg_id: _options.reply_to_message_id })
    if (_options.reply_markup)
        opt = Object.assign(opt, { reply_markup: _util.createReplyMarkup(_options.reply_markup) })
    // TODO: insert parse_mode parser here
    return this.client('messages.sendMessage', opt)
        
}

BotConversion.prototype.forwardMessage = (chat_id, from_chat_id, message_id, options) => {
    var _options = Object.assign({}, options)
    var targetPeer = _util.createPeer(chat_id)
    var fromPeer = _util.createPeer(from_chat_id)
    if (!(message_id instanceof Array)) 
        var _message_id = [message_id]
    else 
        var _message_id = message_id
    return this.client('messages.forwardMessages', {
        silent: _options.disable_notification ? true:false,
        from_peer: fromPeer,
        id: _message_id,
        random_id: _util.createRandomId(), 
        to_peer: targetPeer
    })
}

// TODOs:
// sendPhoto
// sendAudio
// sendDocument
// sendSticker
// sendVideo
// sendVoice

BotConversion.prototype.sendLocation = (chat_id, lat, long, options) => {
    var _options = Object.assign({}, options)
    var targetPeer = _util.createPeer(chat_id)
    var opt = {
        silent: _options.disable_notification?true:false,
        peer: targetPeer,
        random_id: _util.createRandomId(),
        media: {
            _: 'inputMediaGeoPoint',
            geo_point: {
                _: 'inputGeoPoint',
                lat,
                long
            }
        }
    }
    if (_options.reply_to_message_id) 
        opt = Object.assign(opt, { reply_to_msg_id: _options.reply_to_message_id })
    if (_options.reply_markup)
        opt = Object.assign(opt, { reply_markup: _util.createReplyMarkup(_options.reply_markup) })
    return this.client('messages.sendMedia', opt)
}

BotConversion.prototype.sendVenue = (chat_id, lat, long, title, address, options) => {
    var _options = Object.assign({}, options)
    var targetPeer = _util.createPeer(chat_id)
    var opt = {
        silent: _options.disable_notification?true:false,
        peer: targetPeer,
        random_id: _util.createRandomId(),
        media: {
            _: 'inputMediaVenue',
            geo_point: {
                _: 'inputGeoPoint',
                lat,
                long
            },
            title,
            address,
            provider: 'foursquare'
        }
    }
    if (_options.reply_to_message_id) 
        opt = Object.assign(opt, { reply_to_msg_id: _options.reply_to_message_id })
    if (_options.foursquare_id) 
        opt = Object.assign(opt, { venue_id: _options.foursquare_id })
    if (_options.reply_markup)
        opt = Object.assign(opt, { reply_markup: _util.createReplyMarkup(_options.reply_markup) })
    return this.client('messages.sendMedia', opt)
}

BotConversion.prototype.sendContact = (chat_id, phone_number, first_name, options) => {
    var _options = Object.assign({}, options)
    var targetPeer = _util.createPeer(chat_id)
    var opt = {
        silent: _options.disable_notification?true:false,
        peer: targetPeer,
        random_id: _util.createRandomId(),
        media: {
            _: 'inputMediaContact',
            phone_number,
            first_name,
            last_name: _options.last_name||''
        }
    }
    if (_options.reply_to_message_id) 
        opt = Object.assign(opt, { reply_to_msg_id: _options.reply_to_message_id })
    if (_options.reply_markup)
        opt = Object.assign(opt, { reply_markup: _util.createReplyMarkup(_options.reply_markup) })
    return this.client('messages.sendMedia', opt)
}

BotConversion.prototype.sendChatAction = (chat_id, action) => {
    var targetPeer = _util.createPeer(chat_id)
    var _action = {}
    switch (action) {
        case 'typing':
            _action = { _: 'sendMessageTypingAction' }
            break
        case 'upload_photo':
            _action = { _: 'sendMessageUploadPhotoAction', progress: 0 }
            break
        case 'record_video':
            _action = { _: 'sendMessageRecordVideoAction' }
            break
        case 'upload_video':
            _action = { _: 'sendMessageUploadVideoAction', progress: 0 }
            break
        case 'record_audio':
            _action = { _: 'sendMessageRecordAudioAction' }
            break
        case 'upload_audio':
            _action = { _: 'sendMessageUploadAudioAction', progress: 0 }
            break
        case 'upload_document': 
            _action = { _: 'sendMessageUploadDocumentAction', progress: 0 }
            break
        case 'find_location': 
            _action = { _: 'sendMessageGeoLocationAction' }
            break
        default: 
            _action = { _: 'sendMessageCancelAction' }
    }
    return this.client('messages.setTyping', {
        peer: targetPeer,
        action: _action
    })
}

//TODOs:
// getUserProfilePhotos
// getFile
// kickChatMember -- what is `kicked`?
// unbanChatMember -- no method found
// getChat -- some Error
// getChatAdministrator -- ^
// getChatMembersCount -- ^
// getChatMember -- ^
// answerCallbackQuery
