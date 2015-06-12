import fs from 'fs';
import rp from 'request-promise';
import uuid from 'node-uuid';
import sha1 from 'sha1';

const data = JSON.parse(fs.readFileSync('./ef.json'));
const spiderImg = (i, imgs) => {
  let url = imgs[i];
  console.log(url);
  if (!url) return;
  rp(url)
    .then(data => {
      let id = uuid();
      fs.writeFileSync(`img/${sha1(url)}.jpg`, data);
      urlId[url] = id;
    });
}

let urlId = {};
let imgs = data
  .map(post => post.picture)
  .filter(Boolean)
  .filter(url => !fs.existsSync(`img/${sha1(url)}.jpg`));

console.log(`Downloading ${imgs.length} images`);
spiderImg(0, imgs);