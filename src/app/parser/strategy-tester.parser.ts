import { Deal, DetailedStatement, Position } from '../common.class';
import { fieldSorter } from './utils';
import * as xpath from 'xpath';
import { SelectedValue } from 'xpath';

export class StrategyTesterParser {

  constructor(private readonly mtid: number, private readonly login: number) {
  }

  public parse(doc: Document): DetailedStatement {
    const nodes: Array<SelectedValue> = xpath.select('(//table)[2]/tr[count(td) = 10 or count(td) = 9]', doc);
    nodes.shift();
    const tmpPos: Map<number, Position> = new Map<number, Position>();
    const positions: Position[] = [];
    let deals: Deal[] = [];
    let profit = 0;
    const symbolNode: Array<SelectedValue> = xpath.select('(//table)[1]/tr[1]/td[2]', doc);
    const symbol = <Element>symbolNode[0];
    const smb = symbol.textContent.substr(0, symbol.textContent.indexOf(' '));
    const firstBalanceDeal = this.createFirstBalanceDeal(nodes, smb);
    deals.push(firstBalanceDeal);
    let firstDeal = false;
    nodes
      .forEach((node: Element) => {
        const child: NodeListOf<Element> = <NodeListOf<Element>>node.childNodes;
        const order = +child[ 3 ].textContent;
        let pos: Position = tmpPos.get(order);
        if (!pos) {
          pos = new Position();
          tmpPos.set(order, pos);
        }
        const type = child[ 2 ].textContent;
        pos.mtid = this.mtid;
        pos.pos_id = order;
        pos.pos_cur = pos.pos_id;
        pos.login = this.login;
        pos.symbol = smb;
        pos.action = type === 'buy' ? 0 : 1;
        pos.lot_total = +child[ 4 ].textContent;
        pos.vol_total = pos.lot_total * 100;
        pos.swap = 0;
        pos.commission = 0;
        if (type === 'buy' || type === 'sell') {
          pos.time_create = new Date(child[ 1 ].textContent).getTime();
          pos.price_open = +(child[ 5 ].textContent.replace(/ /g, ''));
        }
        if (type === 'close' || type === 't/p' || type === 's/l') {
          pos.profit = +(child[ 8 ].textContent.replace(/ /g, ''));
          if (!firstDeal) {
            firstDeal = true;
            firstBalanceDeal.balance = +(child[ 9 ].textContent.replace(/ /g, '')) - pos.profit;
            firstBalanceDeal.balance = +firstBalanceDeal.balance.toFixed(2);
            firstBalanceDeal.profit = firstBalanceDeal.balance;
            firstBalanceDeal.equity = firstBalanceDeal.balance;
          }
          const price = +(child[ 5 ].textContent.replace(/ /g, ''));
          pos.digits = this.calcDigits(price + '');
          pos.time_update = new Date(child[ 1 ].textContent).getTime();
          pos.time_close = pos.time_update;
          pos.time_current = pos.time_update;
          pos.price_current = price;
          pos.sl = +(child[ 6 ].textContent.replace(/ /g, ''));
          pos.tp = +(child[ 7 ].textContent.replace(/ /g, ''));
          deals.push(this.createOpenDeal(pos));
          const closeDeal = this.createCloseDeal(pos);
          profit += closeDeal.profit;
          deals.push(closeDeal);
          positions.push(pos);
        }
      });
    console.log('Total profit:', profit);
    deals = deals.sort(fieldSorter([ 'time' ]));
    let balance = 0;
    deals.forEach((deal: Deal) => {
      deal.balance = balance + deal.profit + deal.commission + deal.swap;
      deal.balance = +deal.balance.toFixed(2);
      deal.equity = deal.balance;
      balance = deal.balance;
    });
    deals.push(this.createLastDeal(deals, +balance.toFixed(2)));
    console.log('closed balance:', balance);
    return new DetailedStatement(positions, deals);
  }

  private calcDigits(price: string): number {
    price = price.trim();
    return price.length - price.lastIndexOf('.');
  }

  private createFirstBalanceDeal(nodes: Array<SelectedValue>, smb: string): Deal {
    const el: Element = <Element>nodes[ 0 ];
    const child: NodeListOf<Element> = <NodeListOf<Element>>el.childNodes;
    const deal = new Deal();
    deal.mtid = this.mtid;
    deal.pos_id = 0;
    deal.ticket = 1;
    deal.login = this.login;
    deal.symbol = smb;
    deal.action = 2;
    deal.entry = 0;
    deal.digits = 0;
    deal.volume = 0;
    deal.lot = 0;
    deal.time = new Date(child[ 1 ].textContent).getTime() - 1;
    deal.price = 0;
    deal.comment = 'Deposit';
    deal.swap = 0;
    deal.commission = 0;
    deal.profit = 0;
    deal.price_pos = 0;
    deal.time_pos = 0;
    deal.balance = 0;
    deal.equity = 0;
    return deal;
  }

  private createOpenDeal(pos: Position): Deal {
    const deal = new Deal();
    deal.mtid = this.mtid;
    deal.pos_id = pos.pos_id;
    deal.ticket = pos.pos_id;
    deal.login = this.login;
    deal.symbol = pos.symbol;
    deal.action = 1;
    deal.entry = 0;
    deal.digits = pos.digits;
    deal.volume = pos.vol_total;
    deal.lot = pos.lot_total;
    deal.time = pos.time_create;
    deal.price = pos.price_open;
    deal.comment = null;
    deal.swap = 0;
    deal.commission = 0;
    deal.profit = 0;
    deal.price_pos = 0;
    deal.time_pos = 0;
    deal.balance = 0;
    deal.equity = 0;
    return deal;
  }

  private createCloseDeal(pos: Position): Deal {
    const deal = new Deal();
    deal.mtid = this.mtid;
    deal.pos_id = pos.pos_id;
    deal.ticket = pos.pos_id;
    deal.login = this.login;
    deal.symbol = pos.symbol;
    deal.action = 0;
    deal.entry = 1;
    deal.digits = pos.digits;
    deal.volume = pos.vol_total;
    deal.lot = pos.lot_total;
    deal.time = pos.time_close;
    deal.price = pos.price_current;
    deal.comment = null;
    deal.swap = pos.swap;
    deal.commission = pos.commission;
    deal.profit = pos.profit;
    deal.price_pos = pos.price_current;
    deal.time_pos = pos.time_create;
    deal.balance = 0;
    deal.equity = 0;
    return deal;
  }

  private createLastDeal(deals: Deal[], balance: number): Deal {
    const lastDealFromArray = deals[ deals.length - 1 ];
    const lastDeal = new Deal();
    lastDeal.mtid = this.mtid;
    lastDeal.pos_id = 0;
    lastDeal.ticket = lastDealFromArray.ticket + 1;
    lastDeal.login = this.login;
    lastDeal.symbol = null;
    lastDeal.action = 2;
    lastDeal.entry = 0;
    lastDeal.digits = 0;
    lastDeal.volume = 0;
    lastDeal.lot = 0;
    lastDeal.time = lastDealFromArray.time + 1;
    lastDeal.price = 0;
    lastDeal.comment = 'Withdrawal';
    lastDeal.swap = 0;
    lastDeal.commission = 0;
    lastDeal.profit = -balance;
    lastDeal.price_pos = 0;
    lastDeal.time_pos = 0;
    lastDeal.balance = 0;
    lastDeal.equity = 0;
    return lastDeal;
  }

}

