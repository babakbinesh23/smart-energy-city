import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=fs.readFileSync(path.join(root,'bargheto-city.php'),'utf8').match(/^ \* Version: ([0-9.]+)$/m)[1];
const assets=path.join(root,'game/dist/assets');
const main=fs.readFileSync(path.join(assets,`index-${version}.js`),'utf8');
const pending=[path.join(assets,`index-${version}.js`)],visited=new Set();
const imports=/(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?['"](\.[^'"]+)['"]/g;
while(pending.length){
 const file=pending.pop();if(visited.has(file))continue;visited.add(file);
 assert(file.startsWith(root+path.sep)&&fs.statSync(file).isFile(),file);
 const source=fs.readFileSync(file,'utf8');
 const syntax=spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});
 assert.equal(syntax.status,0,syntax.stderr);
 for(const match of source.matchAll(imports))pending.push(path.resolve(path.dirname(file),match[1]));
}
// Locate media loaders in the actual reachable graph, including older retained modules.
const names=['generic-factory-2.5.197.glb','wind-turbine-2.5.206.glb','sun-tracker-2.5.208.glb','tracker-motor-2.5.210.mp3','wind-turbines-2.5.213.mp3','truck-livery-reference-2.5.216.png'];
const cases=names.map(name=>{const marker='(window.barghetoCityServerMedia109?.['+JSON.stringify(name)+']||';const file=[...visited].find(file=>fs.readFileSync(file,'utf8').includes(marker));assert(file,'Missing media loader: '+name);return [path.basename(file),name];});
for(const [file,name]of cases){
 const text=fs.readFileSync(path.join(assets,file),'utf8');
 const marker='(window.barghetoCityServerMedia109?.['+JSON.stringify(name)+']||';
 const start=text.indexOf(marker);assert(start>=0,file);
 let finish=start,depth=0,quote=null;
 for(;finish<text.length;finish++){const ch=text[finish];if(quote){if(ch==='\\'){finish++;continue;}if(ch===quote)quote=null;}else if(ch==='\"'||ch==="'"||ch==='`')quote=ch;else if(ch==='(')depth++;else if(ch===')'&&--depth===0){finish++;break;}}
 const expression=text.slice(start,finish).replace('import.meta.url',JSON.stringify('https://example.test/plugins/bargheto-city/game/dist/assets/'+file));
 const server='https://example.test/uploads/bargheto-city/assets/bundled/'+name+'?sha=verified';
 const mapped=vm.runInNewContext(expression,{window:{barghetoCityServerMedia109:{[name]:server}},URL:class{constructor(){throw Error('Bundled URL evaluated despite server mapping');}}});
 assert.equal(mapped,server);
 const fallback=vm.runInNewContext(expression,{window:{},URL});
 assert.equal(fallback,'https://example.test/plugins/bargheto-city/game/dist/assets/'+name);
}
console.log(JSON.stringify({reachableModules:visited.size,syntax:'pass',serverURLCases:cases.length,fallbackURLCases:cases.length}));
