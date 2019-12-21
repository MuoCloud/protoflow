import { MongoClient } from 'mongodb'

class MongoDB {
    static mongoClient: MongoClient
    static onConnectedCallback?: () => void

    static get client() {
        if (!this.mongoClient) {
            throw new Error('MongoDB Connection has not been established')
        }

        return this.mongoClient
    }

    static async connect(uri: string) {
        this.mongoClient = await MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        if (this.onConnectedCallback) {
            this.onConnectedCallback()
        }
    }

    static onConnected(callback: () => void) {
        this.onConnectedCallback = callback

        if (this.mongoClient) {
            callback()
        }
    }
}

export const useMongoDB = async (uri: string) => MongoDB.connect(uri)

export default MongoDB
