import blessed from 'blessed'
import OrderBook from './OrderBook'

export default class BlessedScreen {
    constructor() {
        this.screen = blessed.screen()
        this.screen.key(['C-c'], () => process.exit(0))

        this.bidsTable = blessed.listtable({
            left: 0,
            width: '50%',
            style: {
                header: {
                    bg: 'green',
                    transparent: true,
                },
            },
        })

        this.asksTable = blessed.listtable({
            left: '50%-2',
            width: '50%',
            style: {
                header: {
                    bg: 'red',
                    transparent: true,
                },
            },
        })

        this.screen.append(this.bidsTable)
        this.screen.append(this.asksTable)

        this.screen.render()
    }
    asksTable: blessed.Widgets.ListTableElement
    asksData = null
    bidsTable: blessed.Widgets.ListTableElement
    bidsData = null
    orderBook: OrderBook
    screen: blessed.Widgets.Screen

    renderOrderBook = (orderbook: OrderBook) => {
        this.orderBook = orderbook

        const bids = this.orderBook.bids.map((bid) => [bid[1], bid[0]])
        bids.sort(this.sortBids)

        const asks = this.orderBook.asks
        asks.sort(this.sortAsks)

        this.bidsTable.setData([['Quantity', 'Bids'], ...bids])
        this.asksTable.setData([['Asks', 'Quantity'], ...asks])

        this.screen.render()
    }

    sortBids = (a: string[], b: string[]) => parseFloat(b[1]) - parseFloat(a[1])
    sortAsks = (a: string[], b: string[]) => parseFloat(a[0]) - parseFloat(b[0])
}
