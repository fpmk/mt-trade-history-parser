import { Component } from '@angular/core';
import { HistoryParserService } from './history-parser.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent {
  private file: any;

  constructor(private parser: HistoryParserService) {

  }

  fileChanged(e) {
    this.file = e.target.files[ 0 ];
    const fileReader = new FileReader();
    fileReader.onload = (ev) => {
      // console.log(fileReader.result);
      console.log(this.parser.parseTradeHistory(fileReader.result + ''));
    };
    fileReader.readAsText(this.file);
  }
}
