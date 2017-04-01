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
    var targetPeer = _util.createPeer(chat_id)
    return this.client('messages.sendMessage', {
        
    })
        
}

BotConversion.prototype.forwardMessage = (chat_id, from_chat_id, message_id, options) => {
    var targetPeer = _util.createPeer(chat_id)
    var fromPeer = _util.createPeer(from_chat_id)
    if (!(message_id instanceof Array)) 
        var _message_id = [message_id]
    else 
        var _message_id = message_id
    return this.client('messages.forwardMessages', {
        silent: options.disable_notification ? true:false,
        from_peer: fromPeer,
        id: _message_id,
        random_id: 0, //???
        to_peer = targetPeer
    })
}