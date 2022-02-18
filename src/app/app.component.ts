import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as xml2js from 'xml2js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommentsComponent } from './comments/comments.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private http: HttpClient, private modalService: NgbModal) { }
  imgUrl: string = "";
  title: string = "";
  subtitle: string = "";
  lastUpdated: string = "";
  entries: Array<any> = [];
  searchText: string = "";
  searchOrder: string = "hot";
  justSearchFlag: boolean = false;
  loading_20 = false;
  loading_40 = false;
  loading_60 = false;
  loading_80 = false;
  loading_100 = false;
  loadingValue = 0;
  load_main = false;
  ngOnInit(): void {

  }
  showModal(link: string) {
    let s = link.split("/r/");
    let t = s[1].split("/")
    const modalRef = this.modalService.open(CommentsComponent, { windowClass: "myCustomModalClass" });
    modalRef.componentInstance.link = t;
    modalRef.result.then((result) => {
      console.log(result);
      console.log('closed');
    }).catch((result) => {
      console.log(result);
      console.log('cancelling');
    });
  }
  sleep(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  fetch() {
    this.entries = [];
    this.imgUrl = "";
    this.title = "";
    this.subtitle = "";
    this.lastUpdated = "";
    this.load_main = false;
    this.http.get(`https://reddit-reader-server.herokuapp.com/reddit/${this.searchText}/${this.searchOrder}/${this.justSearchFlag}`, { responseType: 'text' }).subscribe(data => {
      let parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });
      parser.parseString(data, async (err: any, result: any) => {
        console.log(result.feed);
        if (result.feed.logo && result.feed.logo.length > 0)
          this.imgUrl = result.feed.logo[0];
        this.title = result.feed.title[0];
        if (result.feed.subtitle) {
          this.subtitle = result.feed.subtitle[0];
        }
        this.lastUpdated = result.feed.updated[0];
        let total = result.feed.entry.length;
        for (let entry of result.feed.entry) {
          let obj = { 'author': '', 'title': '', 'published': '', 'link': '' };
          if (entry['author']) {
            obj.author = entry['author'][0]['name'];
          }
          obj.title = entry['title'][0];
          if (entry['published']) {
            obj.published = entry['published'][0];
          }
          obj.link = entry['link'][0]['$']['href'] + ".rss"
          this.entries.push(obj);
          this.loadingValue = Math.floor((this.entries.length / total) * 100);
          if (this.loadingValue < 20) {
            this.loading_20 = true;
            this.loading_40 = false;
            this.loading_60 = false;
            this.loading_80 = false;
            this.loading_100 = false;
          }
          else if (this.loadingValue > 20 && this.loadingValue < 40) {
            this.loading_20 = false;
            this.loading_40 = true;
            this.loading_60 = false;
            this.loading_80 = false;
            this.loading_100 = false;
          }
          else if (this.loadingValue > 40 && this.loadingValue < 60) {
            this.loading_20 = false;
            this.loading_40 = false;
            this.loading_60 = true;
            this.loading_80 = false;
            this.loading_100 = false;
          }
          else if (this.loadingValue > 60 && this.loadingValue < 80) {
            this.loading_20 = false;
            this.loading_40 = false;
            this.loading_60 = false;
            this.loading_80 = true;
            this.loading_100 = false;
          }
          else if (this.loadingValue == 100) {
            this.loading_20 = false;
            this.loading_40 = false;
            this.loading_60 = false;
            this.loading_80 = false;
            this.loading_100 = true;
          }
          await this.sleep(20);
        }
        this.loading_100 = false;
        this.load_main = true;
      })
    })
  }
  modifySearch(order: string) {
    if (order == 'new') {
      this.searchOrder = order;
    }
    else {
      this.searchOrder = 'hot';
    }
  }
  justSearch() {
    this.justSearchFlag = !this.justSearchFlag;
  }
}
