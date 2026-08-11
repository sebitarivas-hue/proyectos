/* LE MENU DES LANGUES — depuis chaque page, chaque langue mène à LA MÊME
   page dans la langue choisie. Le menu a quitté le pied pour la barre : il
   se lit maintenant dans le <details> du haut, où la langue courante est un
   <span> et les cinq autres des liens.
   Usage : servir docs/ sur 8899, puis
   PW=<…>/playwright-core node outils/menu-langues.js                     */
const {chromium}=require(process.env.PW);
const fs=require('fs'),path=require('path');
function pages(d,a=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(e.name!=='assets')pages(p,a);}else if(e.name==='index.html')a.push(p);}return a;}
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await b.newPage({viewport:{width:1280,height:900}});
const list=pages('docs'), pb=[];
let n=0;
for(const f of list){
 const from='/'+f.replace(/^docs\//,'').replace(/index\.html$/,'');
 await pg.goto('http://127.0.0.1:8899'+from,{waitUntil:'load'});
 const liens=await pg.evaluate(()=>{const f=document.querySelector('.nav details.lang .lang-liste');
  return f?[...f.querySelectorAll('a')].map(a=>[a.textContent.trim(),a.getAttribute('href')]):[];});
 const attendu={'Français':'','English':'en','Español':'es','Italiano':'it','中文':'zh','Deutsch':'de'};
 const cur=(from.match(/^\/(en|es|it|zh|de)\//)||[])[1]||'';
 const route=from.replace(/^\/(en|es|it|zh|de)\//,'/');
 for(const [nom,href] of liens){
  const l=attendu[nom]; if(l===undefined) continue;
  const veut=(l?'/'+l:'')+route;
  n++;
  if(href!==veut) pb.push(from+' · '+nom+' → '+href+' au lieu de '+veut);
 }
 if(liens.length!==5) pb.push(from+' : '+liens.length+' liens de langue au lieu de 5');
}
await b.close();
console.log('pages : '+list.length+' · liens de langue vérifiés : '+n);
console.log(pb.length?pb.slice(0,15).join('\n'):'le menu des langues mène partout à la même page dans la langue choisie');
console.log('anomalies : '+pb.length);
})();
