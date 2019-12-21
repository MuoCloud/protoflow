declare type RandomStringCharset = 'all' | 'letter-only' | 'number-only' | 'uppercase-letter-only' | 'lowercase-letter-only' | 'uppercase-letter-number' | 'lowercase-letter-number';
export declare const randomString: (len?: number, charset?: RandomStringCharset) => string;
export {};
