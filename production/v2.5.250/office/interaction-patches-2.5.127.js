/* Extend the readable integration patch; the original payload remains intact. */
(()=>{
 const patches=window.OfficePatches97;
 function replace(file,from,to){if(!patches[file]?.includes(from))throw Error('Office 127 patch mismatch: '+file);patches[file]=patches[file].replace(from,to);}
 replace('department-voices.js','async function toggleTopic(id){const c=candidate();if(!c||c.id!==id)return false;',
  'async function toggleTopic(id,pointed=false){const c=candidate();if(pointed?(!getPlaying()||!has(id)||distance(id)>=6):(!c||c.id!==id))return false;');
 replace('department-voices.js','toggleGuide,toggleTopic,toggleCandidate,','toggleGuide,toggleTopic,togglePointed127:id=>toggleTopic(id,true),toggleCandidate,');
 replace('game.js',"playing&&voices?.activeId==='eric'&&!!voices?.speaking","playing&&!!voices?.speaking");
 replace('game.js',"playing&&voices?.activeId==='eric'&&voices?.status==='playing'","playing&&voices?.status==='playing'");
})();
