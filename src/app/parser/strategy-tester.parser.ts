import { DetailedStatement, Position } from '../common.class';
import * as xpath from 'xpath';
import { SelectedValue } from 'xpath';

export class StrategyTesterParser {

  constructor(private readonly mtid: number, private readonly login: number) {
  }

  public parse(doc: Document): DetailedStatement {
    const nodes: Array<SelectedValue> = xpath.select('(//table)[2]/tr[count(td) = 10 or count(td) = 9]', doc);
    nodes.shift();
    console.log(nodes);
    const tmpPos: Map<number, Position> = new Map<number, Position>();
    const positions: Position[] = [];
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
        pos.symbol = child[ 4 ].textContent; // todo
        pos.action = type === 'buy' ? 0 : 1;
        pos.lot_total = +child[ 4 ].textContent;
        pos.vol_total = pos.lot_total * 100;
        pos.swap = 0;
        pos.commission = 0;
        if (type === 'buy' || type === 'sell') {
          console.log(child[ 1 ].textContent);
          pos.time_create = new Date(child[ 1 ].textContent).getTime();
          pos.price_open = +(child[ 5 ].textContent.replace(/ /g, ''));
        }
        if (type === 'close') {
          const price = +(child[ 5 ].textContent.replace(/ /g, ''));
          pos.digits = this.calcDigits(price + '');
          pos.time_update = new Date(child[ 1 ].textContent).getTime();
          pos.time_close = pos.time_update;
          pos.time_current = pos.time_update;
          pos.price_current = price;
          pos.sl = +(child[ 6 ].textContent.replace(/ /g, ''));
          pos.tp = +(child[ 7 ].textContent.replace(/ /g, ''));
          pos.profit = +(child[ 8 ].textContent.replace(/ /g, ''));
          positions.push(pos);
        }
      });

    return new DetailedStatement(positions, []);
  }

  private calcDigits(price: string): number {
    price = price.trim();
    return price.length - price.lastIndexOf('.');
  }

}

