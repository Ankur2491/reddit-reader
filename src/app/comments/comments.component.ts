import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import * as xml2js from 'xml2js';  

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() link: Array<string> = [];
  comments: Array<any> = [];
  commentsMap: {[id: string]: string} = {};
  commentsBackup: Array<any> = [];
  commentsMapBackup: {[id: string]: string} = {};
  commentContext: string = "";
  showback = false;
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(`https://reddit-reader-server.herokuapp.com/reddit/comments/${this.link[0]}/${this.link[1]}/${this.link[2]}/${this.link[3]}`, { responseType: 'text' }).subscribe(data => {
      let parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      parser.parseString(data, (err: any, result: any)=>{
        console.log(result);
        let counter = 0;
        for(let entry of result.feed.entry){
          let obj = {'author': '', 'content':'', 'published':'', 'link': '', 'id':''};
          if(entry['author'] && entry['author'].length>0)
            obj.author = entry['author'][0]['name'];
           obj.published = entry['updated'][0];
           obj.content = entry['content'][0]["_"];
           obj.id = entry['id'][0];
           this.comments.push(obj);
           if(counter > 0){
             let id:string = entry['id'][0];
             this.commentsMap[id] = entry['link'][0]['$']['href']+".rss"
             console.log(this.commentsMap);
           }
           counter++;
        }
      });
      
    })
  }
  moveBack(){
    this.showback = false;
    this.comments = this.commentsBackup.slice();
    this.commentsMap = Object.assign({},this.commentsMapBackup);
  }
  loadThread(cId: string, content: string){
    console.log(this.commentsMap);
    this.showback = true;
    this.commentContext = content;
    this.commentsBackup = this.comments.slice();
    this.comments = [];
    this.commentsMapBackup = Object.assign({},this.commentsMap);
    let link = this.commentsMap[cId];
    console.log(link);
    let s = link.split("/r/");
    let t = s[1].split("/")
    this.http.get(`https://reddit-reader-server.herokuapp.com/reddit/comments/${t[0]}/${t[1]}/${t[2]}/${t[3]}/${t[4]}`, { responseType: 'text' }).subscribe(data => {
      let parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });

      parser.parseString(data, (err: any, result: any)=>{
        console.log(result);
        for(let entry of result.feed.entry){
          let obj = {'author': '', 'content':'', 'published':'', 'link': '', 'id':''};
          if(entry['author'] && entry['author'].length>0)
            obj.author = entry['author'][0]['name'];
           obj.published = entry['updated'][0];
           obj.content = entry['content'][0]["_"];
           obj.id = entry['id'][0];
           this.comments.push(obj);
        }
      });
      
    })
    this.commentsMap = {};
  }
}
