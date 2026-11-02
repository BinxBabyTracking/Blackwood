const {chromium}=require('playwright');(async()=>{const P=JSON.parse(process.argv[2]);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1536,height:1024}});
p.on('console',m=>console.log(m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8799/render.html#'+encodeURIComponent(JSON.stringify(P)));
await p.waitForFunction(()=>window.DONE,null,{timeout:60000}); console.log('size',JSON.stringify(await p.evaluate(()=>window.DONE)));
await p.locator('canvas').screenshot({path:process.argv[3],omitBackground:true}); await b.close()})();
