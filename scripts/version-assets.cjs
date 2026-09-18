/* Add content versions to local assets so new releases fetch matching files. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function refreshAssets(root) {
 const file=path.join(root,'index.html');
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/((?:src|href)=")([a-z][a-z0-9.-]*\.(?:js|css|svg))(?:\?[^"<>]*)?(")/g,(_,prefix,name,suffix)=>{
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex').slice(0,12);
  return `${prefix}${name}?v=${hash}${suffix}`;
 });
 fs.writeFileSync(file,html);
 return html;
}
module.exports={refreshAssets};
if(require.main===module) {refreshAssets(process.argv[2]||path.join(__dirname,'..','docs'));console.log('Frontend asset URLs now use content versions.');}
