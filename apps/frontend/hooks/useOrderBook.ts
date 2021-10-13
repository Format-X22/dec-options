import { DocumentNode, gql, QueryResult, useQuery } from '@apollo/client';
import { OptionGQL } from '@app/shared/option.schema';
import { OrderBook as OrderBookModel } from '@app/shared/orderbook.schema';

const makeOrderBookQuery = (options: Array<OptionGQL> = []): DocumentNode => {
    let body: string = '';

    options.forEach((option: OptionGQL, index: number) => {
        body += `
          id${index}_${option.market.name}: orderBook(optionId: "${option.id}", optionMarketKey: ${option.market.key}) {
              optionMarketKey
              asks {
                  price
                  amount
              }
              bids {
                  price
                  amount
              }
          }
      `;
    });

    body = body || 'orderBook(optionId: "", optionMarketKey: DERIBIT) { optionMarketKey }';

    return gql`
      query getOrderBook {
          ${body}
      }
  `;
};

export const useOrderBook = (data: Array<OptionGQL>): QueryResult<{ orderBook: OrderBookModel }> => {
    return useQuery(makeOrderBookQuery(data));
};
