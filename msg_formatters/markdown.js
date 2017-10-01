const parse = (input_string) => {
    let text = '',
        current_entity,
        in_entity, // b, i, lt, lu, pl, pt, c
        entities = [],
        is_transcoded = false

    for (let i = 0; i < input_string.length; i++) {
        if (input_string[i] == '\\') {
            if (input_string[i + 1].match(/[*_[]()\`]/)) {
                text += input_string[i + 1]
                i++
            } else {
                text += input_string[i]
            }
            continue
        }
        if (!in_entity) {
            switch (input_string[i]) {
                case '*':
                    in_entity = 'b'
                    current_entity = {
                        '_': 'messageEntityBold',
                        offset: text.length
                    }
                    break
                case '_':
                    in_entity = 'i'
                    current_entity = {
                        '_': 'messageEntityItalic',
                        offset: text.length
                    }
                    break
                case '[':
                    in_entity = 'lt'
                    current_entity = {
                        '_': 'messageEntityTextUrl',
                        offset: text.length,
                        url: ''
                    }
                    break
                case '`':
                    if (input_string.substring(i, i + 3) == '```') {
                        in_entity = 'pl'
                        current_entity = {
                            '_': 'messageEntityPre',
                            offset: text.length,
                            language: ''
                        }
                        i += 2
                    } else {
                        in_entity = 'c'
                        current_entity = {
                            '_': 'messageEntityCode',
                            offset: text.length
                        }
                    }
                    break
                default:
                    text += input_string[i]
            }
            continue
        } else {
            if (in_entity == 'b' && input_string[i] == '*') {
                current_entity.length = text.length - current_entity.offset
                in_entity = false
                entities.push(current_entity)
            } else if (in_entity == 'i' && input_string[i] == '_') {
                current_entity.length = text.length - current_entity.offset
                in_entity = false
                entities.push(current_entity)
            } else if (in_entity == 'c' && input_string[i] == '`') {
                current_entity.length = text.length - current_entity.offset
                in_entity = false
                entities.push(current_entity)
            } else if (in_entity == 'lt' && input_string.substring(i, i + 2) == '](') {
                current_entity.length = text.length - current_entity.offset
                in_entity = 'lu'
                i++
                continue
            } else if (in_entity == 'lu' && input_string[i] == ')') {
                in_entity = false
                entities.push(current_entity)
            } else if (in_entity == 'lu') {
                current_entity.url += input_string[i]
            } else if (in_entity == 'pl' && input_string[i] == '\n') {
                in_entity = 'pt'
            } else if (in_entity == 'pl') {
                current_entity.language += input_string[i]
            } else if (in_entity == 'pt' && input_string.substring(i, i + 3) == '```') {
                current_entity.length = text.length - current_entity.offset
                in_entity = false
                i += 2
                entities.push(current_entity)
            } else {
                text += input_string[i]
            }
            continue
        }
    }
    if (in_entity)
        throw new Error(`Entity mark ${in_entity} not closed.`)
    return { text, entities }
}
module.exports = exports = parse
