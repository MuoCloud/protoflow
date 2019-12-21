import { MongoClient } from 'mongodb';
declare class MongoDB {
    static mongoClient: MongoClient;
    static onConnectedCallback?: () => void;
    static get client(): MongoClient;
    static connect(uri: string): Promise<void>;
    static onConnected(callback: () => void): void;
}
export declare const useMongoDB: (uri: string) => Promise<void>;
export default MongoDB;
