const { MTProto } = require('telegram-mtproto')
// const EventEmitter = require('events')
const _util = require('./util')

// main

class BotConversion extends MTProto {
    constructor(api_id, api_hash, bot_token, database) {
        // TODO: init mtproto here rather than import
        // super({wildcard: true})
        const api = {
            layer: 71,
            initConnection: 0x69796de9,
            api_id
        }
        super({
            api
        })
        this.api_id = api_id
        this.api_hash = api_hash
        this.bot_token = bot_token
        // this.client = client
        // this.options = options
        // if (options.api_id instanceof String) 
        //     this.options.api_id = parseInt(options.api_id)
        // TODO: storage for access_hash : use storage for mtproto
        // TODO: init events
        this.login()
    }

    async login() {
        // if logged in = this_id
        try {
            const auth = await this('auth.importBotAuthorization', {
                api_id: this.api_id,
                api_hash: this.api_hash,
                bot_auth_token: this.token
            })
            // db: logged in
            return auth.user
        } catch (e) {

        }
    }

    async getMe() {
        const userfull = await this('users.getFullUser', {
            id: { _: 'inputUserSelf' }
        })
        //this.me = userfull.user // update Cached Auth
        return {
            id: userfull.user.id,
            first_name: userfull.user.first_name,
            last_name: userfull.user.last_name,
            username: userfull.user.username,
            is_bot: userfull.user.bot,
            raw: userfull
        }
    }


    async sendMessage(chat_id, text, options) {
        var _options = Object.assign({}, options)
        var targetPeer = _util.createInputPeer(chat_id)
        var opt = {
            no_webpage: !!_options.disable_web_page_preview,
            silent: !!_options.disable_notification,
            peer: targetPeer,
            //message: text,
            random_id: _util.createRandomId()
        }
        if (_options.reply_to_message_id)
            opt = Object.assign(opt, { reply_to_msg_id: _options.reply_to_message_id })
        if (_options.reply_markup)
            opt = Object.assign(opt, { reply_markup: _util.createReplyMarkup(_options.reply_markup) })
        // TODO: insert parse_mode parser here
        var { message, entities } = _util.parseEntities(text)
        if (entities) opt.entities = entities
        opt.message = message
        return this('messages.sendMessage', opt)
    }

    async forwardMessage(chat_id, from_chat_id, message_id, options) {
        var _options = Object.assign({}, options)
        var targetPeer = _util.createInputPeer(chat_id)
        var fromPeer = _util.createInputPeer(from_chat_id)
        if (!Array.isArray(message_id))
            var _message_id = [message_id]
        else
            var _message_id = message_id
        return this('messages.forwardMessages', {
            silent: !!_options.disable_notification,
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

    sendLocation(chat_id, lat, long, options) {
        var _options = Object.assign({}, options)
        var targetPeer = _util.createInputPeer(chat_id)
        var opt = {
            silent: _options.disable_notification ? true : false,
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
        return this('messages.sendMedia', opt)
    }

    sendVenue(chat_id, lat, long, title, address, options) {
        var _options = Object.assign({}, options)
        var targetPeer = _util.createInputPeer(chat_id)
        var opt = {
            silent: _options.disable_notification ? true : false,
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
        return this('messages.sendMedia', opt)
    }

    sendContact(chat_id, phone_number, first_name, options) {
        var _options = Object.assign({}, options)
        var targetPeer = _util.createInputPeer(chat_id)
        var opt = {
            silent: _options.disable_notification ? true : false,
            peer: targetPeer,
            random_id: _util.createRandomId(),
            media: {
                _: 'inputMediaContact',
                phone_number,
                first_name,
                last_name: _options.last_name || ''
            }
        }
        if (_options.reply_to_message_id)
            opt = Object.assign(opt, { reply_to_msg_id: _options.reply_to_message_id })
        if (_options.reply_markup)
            opt = Object.assign(opt, { reply_markup: _util.createReplyMarkup(_options.reply_markup) })
        return this('messages.sendMedia', opt)
    }

    sendChatAction(chat_id, action) {
        var targetPeer = _util.createInputPeer(chat_id)
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

        return this('messages.setTyping', {
            peer: targetPeer,
            action: _action
        })
    }

    //TODOs:
    // getUserProfilePhotos
    // getFile
    // kickChatMember -- messages.deleteChatUser
    // unbanChatMember -- channels.editBanned

    // getChat -- some Error
    getChat(chat_id) {
        var chat_type = _util.typeofPeer(chat_id)
        if (chat_type === 'User') {
            var _id = _util.createInputPeer(chat_id).user_id
            return this('users.getFullUser', {
                id: {
                    _: 'inputUser',
                    user_id: _id
                    // access hash?
                }
            }) // further process
        } else if (chat_type === 'Channel') {
            var _id = _util.createInputPeer(chat_id).channel_id
            return this('channels.getFullChannel', {
                channel: {
                    _: 'inputChannel',
                    channel_id: _id
                    // access hash?
                }
            }) // further process
        } else if (chat_type === 'Chat') {
            var _id = _util.createInputPeer(chat_id).chat_id
            return this('messages.getFullChat', {
                chat_id: _id
            }) // further process
        }
    }


    // getChatAdministrator -- ^
    getChatAdministrator(chat_id) {
        var chat_type = _util.typeofPeer(chat_id)
        if (chat_type === 'Channel') {
            var _id = _util.createInputPeer(chat_id).channel_id
            return this('channels.getParticipants', {
                channel: {
                    _: 'inputChannel',
                    channel_id: _id
                    // access hash?
                },
                filter: {
                    _: 'channelParticipantsAdmins'
                },
                offset: 0,
                limit: 20
            }) // further process
        } else if (chat_type === 'Chat') {
            var _id = _util.createInputPeer(chat_id).chat_id
            return this('messages.getFullChat', {
                chat_id: _id
            }).then((chat) => {
                if (chat.full_chat.participants._ = 'chatParticipantsForbidden') throw 401 // Enhance this
                var participants = chat.full_chat.participants.participants
                return participants
                    .filter(_util.isAdministrator)
                    .map(
                
            })
            // further process
        } else {
            // user ???
        }
    }

    // getChatMembersCount -- ^
    // getChatMember -- ^
    // answerCallbackQuery
    answerCallbackQuery(options) {
        let { id, text, alert, url, } = options
        
    }

}

module.exports = exports = BotConversion