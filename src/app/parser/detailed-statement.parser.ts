import { Deal, DetailedStatement, Position } from '../common.class';
import * as xpath from 'xpath';
import { SelectedValue } from 'xpath';
import { fieldSorter } from './utils';

export class DetailedStatementParser {

  constructor(private readonly mtid: number, private readonly login: number) {
  }

  public parse(doc: Document): DetailedStatement {
    const start = new Date().getTime();
    const balanceNodes: Array<SelectedValue> = xpath.select('//table/tr[td//text() = "balance"]', doc);
    if (!balanceNodes || balanceNodes.length === 0) {
      throw new Error('Missing balance row');
    }
    let positions: Position[] = [];
    let deals: Deal[] = [];
    balanceNodes.forEach((node: Element) => {
      const child: NodeListOf<Element> = <NodeListOf<Element>>node.childNodes;
      const deal = new Deal();
      deal.mtid = this.mtid;
      deal.pos_id = 0;
      deal.ticket = +child[ 0 ].textContent;
      deal.login = this.login;
      deal.symbol = null;
      deal.action = 2;
      deal.entry = 0;
      deal.digits = 0;
      deal.volume = 0;
      deal.lot = 0;
      deal.time = new Date(child[ 1 ].textContent).getTime();
      deal.price = 0;
      deal.comment = 'Deposit';
      deal.swap = 0;
      deal.commission = 0;
      deal.profit = +(child[ 4 ].textContent.replace(/ /g, ''));
      deal.price_pos = 0;
      deal.time_pos = 0;
      deal.balance = 0;
      deal.equity = 0;
      deals.push(deal);
    });
    const nodes: Array<SelectedValue> = xpath.select('//table/tr[count(td) = 14 and (td[9]/text() != "&nbsp;")]', doc);
    nodes
      .filter((node: Element) => node.childNodes.length === 14)
      .forEach((node: Element) => {
        const child: NodeListOf<Element> = <NodeListOf<Element>>node.childNodes;
        const pos = this.createStatementPos(child);
        positions.push(pos);
        deals.push(this.createOpenDeal(pos, child));
        deals.push(this.createCloseDeal(pos, child));
      });
    positions = positions.sort(fieldSorter([ 'time_create', 'pos_id' ]));

    deals = deals.sort(fieldSorter([ 'time' ]));
    let balance = 0;
    deals.forEach((deal: Deal) => {
      deal.balance = balance + deal.profit + deal.commission + deal.swap;
      deal.balance = +deal.balance.toFixed(2);
      deal.equity = deal.balance;
      balance = deal.balance;
    });
    deals.push(this.createLastDeal(deals, balance));
    console.log('time:', (new Date().getTime() - start) / 1000, 'closed balance:', balance);
    return new DetailedStatement(positions, deals);
  }

  private createStatementPos(child: NodeListOf<Element>): Position {
    const pos = new Position();
    pos.mtid = this.mtid;
    pos.pos_id = +child[ 0 ].textContent;
    pos.pos_cur = pos.pos_id;
    pos.login = this.login;
    pos.symbol = child[ 4 ].textContent;
    pos.action = child[ 2 ].textContent === 'buy' ? 0 : 1;
    pos.lot_total = +child[ 3 ].textContent;
    pos.vol_total = pos.lot_total * 100;
    pos.time_create = new Date(child[ 1 ].textContent).getTime();
    pos.time_update = new Date(child[ 8 ].textContent).getTime();
    pos.time_close = pos.time_update;
    pos.time_current = pos.time_update;
    pos.price_open = +(child[ 5 ].textContent.replace(/ /g, ''));
    pos.digits = this.calcDigits(pos.price_open + '');
    pos.price_current = +(child[ 9 ].textContent.replace(/ /g, ''));
    pos.sl = +(child[ 6 ].textContent.replace(/ /g, ''));
    pos.tp = +(child[ 7 ].textContent.replace(/ /g, ''));
    pos.profit = +(child[ 13 ].textContent.replace(/ /g, ''));
    pos.swap = +(child[ 12 ].textContent.replace(/ /g, ''));
    pos.commission = +(child[ 10 ].textContent.replace(/ /g, ''));
    return pos;
  }

  private createOpenDeal(pos, child: NodeListOf<Element>) {
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
    // noinspection TypeScriptUnresolvedFunction
    deal.comment = child[ 0 ].getAttribute('title');
    deal.swap = 0;
    deal.commission = 0;
    deal.profit = 0;
    deal.price_pos = 0;
    deal.time_pos = 0;
    deal.balance = 0;
    deal.equity = 0;
    return deal;
  }

  private createCloseDeal(pos, child: NodeListOf<Element>) {
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
    // noinspection TypeScriptUnresolvedFunction
    deal.comment = child[ 0 ].getAttribute('title');
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

  private calcDigits(price: string): number {
    price = price.trim();
    return price.length - price.lastIndexOf('.');
  }

}
