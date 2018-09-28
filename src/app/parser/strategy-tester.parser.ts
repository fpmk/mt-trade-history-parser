import { DetailedStatement } from '../common.class';

export class StrategyTesterParser {
  private readonly mtid: number;
  private readonly login: number;

  constructor(private readonly mtid: number, private readonly login: number) {
    this.mtid = mtid;
    this.login = login;
  }

  public parse(doc: Document): DetailedStatement {
    return new DetailedStatement([], []);
  }
}
