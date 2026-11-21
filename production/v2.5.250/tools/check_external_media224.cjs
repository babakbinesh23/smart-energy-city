const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),assets=root+'/game/dist/assets',catalog=JSON.parse(fs.readFileSync(root+'/server-media-manifest.json'));
const origin='https://example.test',prefix=origin+'/wp-content/plugins/bargheto-city/game/dist/assets/';
const urls=Object.fromEntries(Object.entries(catalog).map(([name,s])=>[path.basename(name),origin+'/wp-content/uploads/bargheto-city/assets/'+name+'?sha='+s.sha256.slice(0,16)]));
const window={barghetoCityServerMedia109:urls},ctx={window,URL,location:{href:origin+'/barghetocity/',origin}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(assets+'/media-urls-2.5.223.js','utf8'),ctx);
for(const name of Object.keys(urls)){assert.equal(window.barghetoMediaURL223(prefix+name),urls[name]);}
assert.equal(window.barghetoMediaURL223(prefix+'quality-2.5.222.js'),prefix+'quality-2.5.222.js');
assert.equal(window.barghetoMediaURL223(origin+'/pictures/city-map-2.5.123.webp'),origin+'/pictures/city-map-2.5.123.webp');
let source=fs.readFileSync(assets+'/forklift-livery-2.5.222-media223.js','utf8').replace(/^import .*?;\s*$/gm,'').replaceAll('import.meta.url',JSON.stringify(prefix+'forklift-livery-2.5.222-media223.js')).replace(/export (async function|function|class|const) /g,'$1 ');
vm.runInContext(source+'\nglobalThis.art=FORKLIFT_ART219;',ctx);
assert.equal(ctx.art[0].photo,urls['forklift-reference-gold-2.5.219.png']);assert.equal(ctx.art[1].photo,urls['forklift-reference-white-2.5.219.png']);
const main=fs.readFileSync(assets+'/index-2.5.224.js','utf8');for(const name of ['bargheto-logo-xleaNlBS.svg','electricity-before-B3aug3-F.webp','electricity-after-zKWnFKuO.webp'])assert(main.includes('new URL(`'+name+'`,import.meta.url).href)')||main.includes(name),name);
console.log(JSON.stringify({catalogURLs:Object.keys(urls).length,literalPictures:'pass',computedForkliftURLs:'pass',moduleURLs:'preserved',unrelatedURLs:'preserved'}));
