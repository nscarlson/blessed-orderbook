import OrderBook from './OrderBook'

export default abstract class Exchange {
    orderBook: OrderBook

    public abstract getOrderBook({
        baseSymbol,
        quoteSymbol,
    }: {
        baseSymbol: string
        quoteSymbol: string
    }): Promise<OrderBook>

    public abstract updateOrderBook({
        baseSymbol,
        quoteSymbol,
    }: {
        baseSymbol: string
        quoteSymbol: string
    }): Promise<OrderBook>

    public abstract resyncOrderBook({
        baseSymbol,
        quoteSymbol,
    }: {
        baseSymbol: string
        quoteSymbol: string
    }): Promise<void>
}
