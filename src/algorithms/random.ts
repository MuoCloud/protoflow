type RandomStringCharset =
    | 'all'
    | 'letter-only'
    | 'number-only'
    | 'uppercase-letter-only'
    | 'lowercase-letter-only'
    | 'uppercase-letter-number'
    | 'lowercase-letter-number'

const RANDOM_STRING_CHARSETS = {
    'all': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    'letter-only': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    'number-only': '0123456789',
    'uppercase-letter-only': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'lowercase-letter-only': 'abcdefghijklmnopqrstuvwxyz',
    'uppercase-letter-number': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    'lowercase-letter-number': 'abcdefghijklmnopqrstuvwxyz0123456789'
}

export const randomString = (len = 16, charset: RandomStringCharset = 'all') => {
    const chars = RANDOM_STRING_CHARSETS[charset]

    let text = ''

    for (let i = 0; i < len; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return text
}
