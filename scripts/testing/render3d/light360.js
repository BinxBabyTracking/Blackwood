const {chromium}=require('playwright');(async()=>{const P=require(require('path').resolve(process.argv[2]));
const b=await chromium.launch({args:['--use-gl=angle']});const W=P.W||4096;const p=await b.newPage({viewport:{width:W,height:W/2}});
p.on('console',m=>{if(!/GPU stall/.test(m.text()))console.log(m.text())}); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8799/light360.html#'+encodeURIComponent(JSON.stringify(P)));
await p.waitForFunction(()=>window.DONE,null,{timeout:120000}); 
await p.locator('canvas').screenshot({path:process.argv[3],omitBackground:true}); await b.close()})();
