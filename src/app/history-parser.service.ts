import { Injectable } from '@angular/core';
import { DetailedStatement } from './common.class';
import * as dom from 'xmldom';
import * as xpath from 'xpath';
import { SelectedValue } from 'xpath';
import { DetailedStatementParser } from './parser/detailed-statement.parser';
import { StrategyTesterParser } from './parser/strategy-tester.parser';

@Injectable({
  providedIn: 'root'
})
export class HistoryParserService {

  private mtid: number;
  private login: number;

  constructor() {
  }

  public parseTradeHistory(html: string, mtid: number, login: number): DetailedStatement {
    this.mtid = mtid;
    this.login = login;
    const doc = new dom.DOMParser({
      errorHandler: {},
      locator: {}
    }).parseFromString(html);

    if (this.isStatement(doc)) {
      console.log('Found detailed statement. Parsing...');
      return new DetailedStatementParser(this.mtid, this.login).parse(doc);
    }
    if (this.isTester(doc)) {
      console.log('Found strategy tester. Parsing...');
      return new StrategyTesterParser(this.mtid, this.login).parse(doc);
    }
    throw new Error('Invalid trade history document');
  }

  private isStatement(doc: Document): boolean {
    const nodes: Array<SelectedValue> = xpath.select('//table/tr[count(td) = 14 and (td[9]/text() != "&nbsp;")]', doc);
    if (nodes && nodes.length > 1) {
      const node: Node = <Node>nodes[ 1 ];
      return node.childNodes.length === 14;
    }
    return false;
  }

  private isTester(doc: Document): boolean {
    const nodes: Array<SelectedValue> = xpath.select('(//table)[2]/tr[count(td) = 10]', doc);
    if (nodes && nodes.length > 1) {
      const node: Node = <Node>nodes[ 1 ];
      return node.childNodes.length === 10;
    }
    return false;
  }

}
