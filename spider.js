import rp from 'request-promise';
import fs from 'fs';

let AT = '';

let url = 'https://graph.facebook.com/v2.3/745908415421098/feed?_=_';

console.log(`${url}?access_token=${AT}`);


const finish = data => {
  fs.writeFileSync('ef.json', JSON.stringify(data));
  console.log('DATA', data.length);
}

const spider = (url, access_token, limit, data) => {
  if (limit === 0) {
    finish(data);
    return;
  };
  console.log('hitting', url);
  rp(`${url}&access_token=${AT}`)
    .then(JSON.parse)
    .then(r => {
      data = data.concat(r.data);
      if (r.paging && r.paging.next) {
        spider(r.paging.next, access_token, --limit, data);
      } else {
        finish(data);
      }
    });
}

spider(url, AT, 50000, []);
