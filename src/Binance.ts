import axios, { AxiosInstance } from 'axios'
import crypto from 'crypto'
// import moment from 'moment'
// import { v4 as uuidv4 } from 'uuid'
import Exchange from './Exchange'
import OrderBook from './OrderBook'

class Binance extends Exchange {
    constructor() {
        super()
        this.createV1HttpClient()
        this.createV3HttpClient()
    }

    apiKey = process.env.BINANCE_API_KEY || ''
    apiSecretKey = process.env.BINANCE_SECRET_KEY || ''

    v1HttpClient: AxiosInstance
    v3HttpClient: AxiosInstance

    orderBook: OrderBook = {
        bids: [],
        asks: [],
    }

    // getOrder = async ({
    //     baseSymbol,
    //     newClientOrderId,
    //     orderId,
    //     origClientOrderId,
    //     quoteSymbol,
    // }) => {
    //     try {
    //         symbol: `${quoteSymbol}${baseSymbol}`

    //         const timestamp = new Date().getTime()

    //         const totalParams = `timestamp=${timestamp}`

    //         const order = (await this.v3HttpClient.get(`/order${totalParams}`, {
    //             headers: {
    //                 'X-MBX-APIKEY': this.apiKey,
    //             },
    //             params: {
    //                 symbol: `${quoteSymbol}${baseSymbol}`,
    //             },
    //         })).data
    //     } catch(err) {
    //         console.error(err)
    //     }
    // }

    // createOrder = async ({
    //     baseSymbol,
    //     price,
    //     quantity,
    //     quoteSymbol,
    //     side,
    //     type,
    // }) => {
    //     try {
    //         const newClientOrderId = uuidv4()
    //         const symbol = `${quoteSymbol}${baseSymbol}`
    //         const timestamp = new Date().getTime()

    //         // TODO: Make this more pleasant and readable
    //         const totalParams = `newClientOrderId=${newClientOrderId}&symbol=${symbol}&side=${side}&type=${type}&timeInForce=FOK&quantity=${quantity}&price=${price}&timestamp=${timestamp}`
    //         const signature = this.hmacSha256(totalParams)

    //         console.info()
    //         console.info(
    //             `${moment().format()} | submitting order | ${newClientOrderId} ${type} ${side} ${quantity} ${quoteSymbol} @${price}`,
    //         )

    //         const result = (
    //             await this.v3HttpClient(
    //                 `/order/test?${totalParams}&signature=${signature}`,
    //                 {
    //                     headers: {
    //                         'X-MBX-APIKEY': this.apiKey,
    //                     },
    //                     method: 'POST',
    //                 },
    //             )
    //         ).data
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }

    createV1HttpClient = () => {
        console.log('Initializing Binance v1 client...')
        this.v1HttpClient =
            axios.create({
                baseURL: 'https://api.binance.com/api/v1',
                timeout: 5000,
            }) || undefined
    }

    createV3HttpClient = () => {
        console.log('Initializing Binance v3 connection...')
        this.v3HttpClient = axios.create({
            baseURL: 'https://api.binance.com/api/v3',
            timeout: 5000,
        })
    }

    // parseBalanceBySymbol = ({ balances, symbol }) => {
    //     const balance = balances.find((b) => b.asset === symbol)
    //     // console.log('balance:', balance)
    //     return balance
    // }

    // getBalances = async (keys) => {
    //     try {
    //         const timestamp = new Date().getTime()
    //         const totalParams = `timestamp=${timestamp}`

    //         const balances = (
    //             await this.v3HttpClient.get(`/account?${totalParams}`, {
    //                 headers: {
    //                     'X-MBX-APIKEY': this.apiKey,
    //                 },
    //                 params: {
    //                     signature: this.hmacSha256(totalParams),
    //                 },
    //             })
    //         ).data.balances

    //         const filteredBalances = balances.filter((balance) =>
    //             keys.includes(balance.asset),
    //         )

    //         // console.info(
    //         //     `                          | wallet balance   | BTC: ${
    //         //         this.parseBalanceBySymbol({
    //         //             balances: filteredBalances,
    //         //             symbol: 'BTC',
    //         //         }).free
    //         //     }`,
    //         // )

    //         return filteredBalances
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }

    getOrderBook = async ({
        baseSymbol,
        quoteSymbol,
    }: {
        baseSymbol: string
        quoteSymbol: string
    }): Promise<OrderBook> => {
        try {
            const transformResponse = (data: {
                asks: string[][]
                bids: string[][]
            }): OrderBook => {
                return {
                    asks: data.asks,
                    bids: data.bids,
                }
            }

            const result: OrderBook = (
                await this.v1HttpClient.get<OrderBook>('/depth', {
                    params: {
                        symbol: `${quoteSymbol}${baseSymbol}`,
                        limit: 1000,
                    },
                    transformResponse: (data: string) =>
                        transformResponse(JSON.parse(data)),
                })
            ).data

            // console.log(result)

            // console.log(
            //     `${moment().format()} | orderbook info   | Bid: ${
            //         result.bids[0][0]
            //     } Ask: ${result.asks[0][0]}`,
            // )

            return result
        } catch (err) {
            console.error(err)
            return {
                asks: [],
                bids: [],
            }
        }
    }

    updateOrderBook = async ({
        baseSymbol,
        quoteSymbol,
        newAsks,
        newBids,
    }: {
        baseSymbol: string
        quoteSymbol: string
        newAsks: string[][]
        newBids: string[][]
    }): Promise<OrderBook> => {
        try {
            // TODO: review algorithmic complexity and optimize accordingly

            if (!this.orderBook.asks.length && !this.orderBook.bids.length) {
                this.orderBook = await this.getOrderBook({
                    baseSymbol,
                    quoteSymbol,
                })
            }

            for (const newAsk of newAsks) {
                if (newAsk[1] === '0.00000000') {
                    const index = this.orderBook.asks.findIndex(
                        ([price, volume]: string[]) => price === newAsk[0],
                    )

                    if (~index) {
                        this.orderBook.asks.splice(index, 1)
                    }
                } else {
                    const index = this.orderBook.asks.findIndex(
                        ([price, volume]: string[]) => price === newAsk[0],
                    )

                    if (~index) {
                        this.orderBook.asks[index] = [...newAsk]
                    } else {
                        this.orderBook.asks.push(newAsk)
                    }
                }
            }

            for (const newBid of newBids) {
                if (newBid[1] === '0.00000000') {
                    const index = this.orderBook.bids.findIndex(
                        ([price, volume]: string[]) => price === newBid[0],
                    )

                    if (~index) {
                        this.orderBook.bids.splice(index, 1)
                    }
                } else {
                    const index = this.orderBook.bids.findIndex(
                        ([price, volume]: string[]) => price === newBid[0],
                    )

                    if (~index) {
                        this.orderBook.bids[index] = [...newBid]
                    } else {
                        this.orderBook.bids.push(newBid)
                    }
                }
            }

            this.sortOrderBook()

            return this.orderBook
        } catch (err) {
            return { asks: [], bids: [] }
        }
    }

    resyncOrderBook = async ({
        baseSymbol,
        quoteSymbol,
    }: {
        baseSymbol: string
        quoteSymbol: string
    }) => {
        this.orderBook = await this.getOrderBook({
            baseSymbol,
            quoteSymbol,
        })
    }

    hmacSha256 = (message: string) =>
        crypto
            .createHmac('sha256', this.apiSecretKey)
            .update(message)
            .digest()
            .toString('hex')

    sortOrderBook = () => {
        const sortBids = (a: string[], b: string[]) =>
            parseFloat(b[0]) - parseFloat(a[0])

        const sortAsks = (a: string[], b: string[]) =>
            parseFloat(a[0]) - parseFloat(b[0])

        this.orderBook.asks.sort(sortAsks)
        this.orderBook.bids.sort(sortBids)
    }
}

export default Binance
