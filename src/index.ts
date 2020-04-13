import WebSocket from 'ws'

import Binance from './Binance'
import BlessedScreen from './BlessedScreen'
import OrderBook from './OrderBook'

const init = async () => {
    const binance = new Binance()
    const blessedScreen = new BlessedScreen()

    // TODO: manage websockets dynamically elsewhere
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusd@depth')

    ws.on('open', () =>
        ws.send(
            JSON.stringify({
                method: 'SUBSCRIBE',
                params: ['btcusdt@depth'],
                id: 312,
            }),
        ),
    )
    ws.on('message', async (data: WebSocket.Data) => {
        const parsedData: any = JSON.parse(data.toString())

        await binance.getOrderBook({
            baseSymbol: 'USDT',
            quoteSymbol: 'BTC',
        })

        const updatedOrderBook: OrderBook = await binance.updateOrderBook({
            baseSymbol: 'USDT',
            quoteSymbol: 'BTC',
            newAsks: parsedData.a,
            newBids: parsedData.b,
        })

        blessedScreen.renderOrderBook(updatedOrderBook)
    })
    ws.on('error', (err: Error) => console.log(err))
}

export default init()
