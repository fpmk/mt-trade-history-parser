export class Position {
  get commission(): number {
    return this._commission;
  }

  set commission(value: number) {
    this._commission = value;
  }

  private _mtid: number;             // идентификатор брокера - известен по счету; для которого загружается история
  private _pos_id: number;         // =число из столбца Ticket
  private _pos_cur: number;         // =pos_id
  private _login: number;         // логин этого МТ счета; для которого загружается история
  private _symbol: string;     // =текст из столбца Item
  private _action: number; // 0 (если Type=buy) / 1 (если Type=sell)
  private _vol_total: number;         // = число из Size100
  private _lot_total: number;         // = число из Size
  private _time_create: number;     // = число из Open Time
  private _price_open: number;     // = число из первого Price
  private _digits: number;         // = определить из числа знаков у Price
  private _time_update: number;     // = число из Close Time
  private _time_close: number;         // = time_update
  private _time_current: number;     // = time_update
  private _price_current: number;     // = число из второго Price
  private _sl: number;             //  = число из S / L
  private _tp: number;             // = число из T / P
  private _profit: number;         // = число из Profit
  private _swap: number;         // =число из Swap
  private _commission: number;     // =число из Commission
  private contract_size = 100000;
  private vol_rest = 0;         // = 0
  private lot_rest = 0;         // =0
  private float_pl = 0;         // =0
  private nopub = 1;         // =1

  get mtid(): number {
    return this._mtid;
  }

  set mtid(value: number) {
    this._mtid = value;
  }

  get pos_id(): number {
    return this._pos_id;
  }

  set pos_id(value: number) {
    this._pos_id = value;
  }

  get pos_cur(): number {
    return this._pos_cur;
  }

  set pos_cur(value: number) {
    this._pos_cur = value;
  }

  get login(): number {
    return this._login;
  }

  set login(value: number) {
    this._login = value;
  }

  get symbol(): string {
    return this._symbol;
  }

  set symbol(value: string) {
    this._symbol = value;
  }

  get action(): number {
    return this._action;
  }

  set action(value: number) {
    this._action = value;
  }

  get vol_total(): number {
    return this._vol_total;
  }

  set vol_total(value: number) {
    this._vol_total = value;
  }

  get lot_total(): number {
    return this._lot_total;
  }

  set lot_total(value: number) {
    this._lot_total = value;
  }

  get time_create(): number {
    return this._time_create;
  }

  set time_create(value: number) {
    this._time_create = value;
  }

  get price_open(): number {
    return this._price_open;
  }

  set price_open(value: number) {
    this._price_open = value;
  }

  get digits(): number {
    return this._digits;
  }

  set digits(value: number) {
    this._digits = value;
  }

  get time_update(): number {
    return this._time_update;
  }

  set time_update(value: number) {
    this._time_update = value;
  }

  get time_close(): number {
    return this._time_close;
  }

  set time_close(value: number) {
    this._time_close = value;
  }

  get time_current(): number {
    return this._time_current;
  }

  set time_current(value: number) {
    this._time_current = value;
  }

  get price_current(): number {
    return this._price_current;
  }

  set price_current(value: number) {
    this._price_current = value;
  }

  get sl(): number {
    return this._sl;
  }

  set sl(value: number) {
    this._sl = value;
  }

  get tp(): number {
    return this._tp;
  }

  set tp(value: number) {
    this._tp = value;
  }

  get profit(): number {
    return this._profit;
  }

  set profit(value: number) {
    this._profit = value;
  }

  get swap(): number {
    return this._swap;
  }

  set swap(value: number) {
    this._swap = value;
  }

}

export class Deal {
  private _mtid: number;             // =по аналогии с её позицией
  private _pos_id: number;         // =берем из её позиции; или =0 для balance
  private _ticket: number;         // =число из столбца Ticket (для сделки открытия или balance); = Ticket+1 (для сделки закрытия)
  private _login: number;         // =по аналогии с позицией
  private _symbol: string;         // =берем из её позиции; или =null для balance
  private _action: number; // =берем из позиции для сделки открытия; = противоположное значение от позиции (0 поменять на 1 или наоборот) для сделки закрытия; =2 (для сделки balance)
  private _entry: number;     // =0 (для сделки открытия или balance) / =1 (для сделки закрытия)
  private _digits: number;         // =берем из позиции; или =0 для balance
  private _volume: number;         // =число из Size*100; или =0 для balance
  private _lot: number;         // =число из Size; или =0 для balance
  private _time: number;         // = число из Time
  private _price: number;         // = число из Price
  private _comment: string;         // =поле комментария; как брать - смотри в начале задачи
  private _swap: number;         // =0 для сделки открытия / =swap позиции для сделки закрытия
  private _commission: number;     // =0 для сделки открытия / =commisiion позиции для сделки закрытия
  private _profit: number;         // =0 для сделки открытия; =число из profit позиции для сделки закрытия; или =значение из Profit для сделки balance
  private _price_pos: number;         // =берем из позиции price_create; или =0 для balance
  private _time_pos: number;         // =берем из позиции time_create; или =0 для balance
  private _balance: number;        // = накопительный Balance - описано ниже
  private _equity: number;         // =balance
  private magic = 0;         // =0
  private mtid_ma = 0;         // =0
  private pos_ma = 0;        // =0
  private pos_cur_ma = 0;    // =0
  private malogin = 0;        // =0
  private reason = 0;    // =0
  private spread = 0;         // =0
  private exec = 0;            // =0
  private conv_usd = 0;        // =0
  private nopub = 1;             // =1

  get equity(): number {
    return this._equity;
  }

  set equity(value: number) {
    this._equity = value;
  }

  get balance(): number {
    return this._balance;
  }

  set balance(value: number) {
    this._balance = value;
  }

  get time_pos(): number {
    return this._time_pos;
  }

  set time_pos(value: number) {
    this._time_pos = value;
  }

  get price_pos(): number {
    return this._price_pos;
  }

  set price_pos(value: number) {
    this._price_pos = value;
  }

  get profit(): number {
    return this._profit;
  }

  set profit(value: number) {
    this._profit = value;
  }

  get commission(): number {
    return this._commission;
  }

  set commission(value: number) {
    this._commission = value;
  }

  get swap(): number {
    return this._swap;
  }

  set swap(value: number) {
    this._swap = value;
  }

  get comment(): string {
    return this._comment;
  }

  set comment(value: string) {
    this._comment = value;
  }

  get price(): number {
    return this._price;
  }

  set price(value: number) {
    this._price = value;
  }

  get time(): number {
    return this._time;
  }

  set time(value: number) {
    this._time = value;
  }

  get lot(): number {
    return this._lot;
  }

  set lot(value: number) {
    this._lot = value;
  }

  get volume(): number {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;
  }

  get digits(): number {
    return this._digits;
  }

  set digits(value: number) {
    this._digits = value;
  }

  get entry(): number {
    return this._entry;
  }

  set entry(value: number) {
    this._entry = value;
  }

  get action(): number {
    return this._action;
  }

  set action(value: number) {
    this._action = value;
  }

  get symbol(): string {
    return this._symbol;
  }

  set symbol(value: string) {
    this._symbol = value;
  }

  get login(): number {
    return this._login;
  }

  set login(value: number) {
    this._login = value;
  }

  get ticket(): number {
    return this._ticket;
  }

  set ticket(value: number) {
    this._ticket = value;
  }

  get pos_id(): number {
    return this._pos_id;
  }

  set pos_id(value: number) {
    this._pos_id = value;
  }

  get mtid(): number {
    return this._mtid;
  }

  set mtid(value: number) {
    this._mtid = value;
  }

}

export class DetailedStatement {
  positions: Position[];
  deals: Deal[];

  constructor(positions: Position[], deals: Deal[]) {
    this.positions = positions;
    this.deals = deals;
  }
}
