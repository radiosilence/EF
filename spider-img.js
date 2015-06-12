import fs from 'fs';
import request from 'request';
import sha1 from 'sha1';
import URL from 'url';

const AT = '';

const API = 'https://graph.facebook.com/v2.3/';

const data = JSON.parse(fs.readFileSync('./ef.json'));

const download = (uri, filename) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filename)) {
      console.log("Skipping", uri);
      resolve();
    } else {
      request.head(uri, function(err, res, body) {
      
        console.log("Downloading", uri);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);  
      });
    }
  });
};

const spiderImg = (i, links) => {
  let url = URL.parse(links[i], true);
  if (i === links.length) {
    console.log("DONE!", Object.keys(posts).length), 'posts');
    fs.writeFileSync('./posts.json', JSON.stringify(posts));
    return;
  }
  console.log(links[i]);
  request.get(`${API}${url.query.fbid}?access_token=${AT}`, (err, response, body) => {
    let data = JSON.parse(body);
    console.log(data.images ? data.images.length : 'None');
    if (data && data.images) {
      Promise.all(data.images.map(image => download(image.source, `img/${sha1(image.source)}.jpg`)))
        .then(() => {
          posts[links[i]] = data;
          spiderImg(++i, links);
        });
    } else {
      spiderImg(++i, links);
    }
  });
}

let posts = {};

let urlId = {};
let links = data
  .map(post => post.link)
  .filter(Boolean);

console.log(`Downloading ${links.length} links`);
spiderImg(0, links);
