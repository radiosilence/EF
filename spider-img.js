import fs from 'fs';
import request from 'request';
import sha1 from 'sha1';
import URL from 'url';

const AT = '';

const API = 'https://graph.facebook.com/v2.3/';

const data = JSON.parse(fs.readFileSync('./ef.json'));

const download = (uri, filename) => {
  return new Promise((resolve, reject) => {
    request.head(uri, function(err, res, body) {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
      if (fs.existsSync(filename)) {
        resolve();
      } else {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);  
      }
    });
  });
};

const spiderImg = (i, links) => {
  let url = URL.parse(links[i], true);
  request.get(`${API}${url.query.fbid}?access_token=${AT}`, (err, response, body) => {
    console.log("GOT", JSON.parse(body));
    let data = JSON.parse(body);
    if (data && data.image) {
      Promise.all(data.images.map(image => download(image.source, `img/${sha1(image.source)}.jpg`)))
        .then(() => {
          console.log("Spidering post", i + 1);
          spiderImg(++i, links);
        });
    } else {
      spiderImg(++i, links);
    }
  });
  console.log(url);
  // if (!url) return;
  // download(url, `img/${sha1(url)}.jpg`, () => {
  //   spiderImg(++i, links);
  // });
}

let urlId = {};
let links = data
  .map(post => post.link)
  .filter(Boolean);

console.log(`Downloading ${links.length} links`);
spiderImg(0, links);
