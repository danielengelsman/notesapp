/**
 * Generates the Bookstead Archive: ONE self-contained .html file holding the
 * company's entire rebuilt ledger plus a built-in viewer. No dependencies,
 * no network requests, no Bookstead required — it must still open in 2040.
 *
 * Everything is inlined: data as JSON, viewer as vanilla JS, styles as CSS.
 */
import { Ledger, isBalanceSheet } from "./types";
import { ReconReport } from "./reconcile";

export interface ArchiveMeta {
  companyName: string;
  generatedAt: string; // ISO datetime, supplied by caller
  appVersion: string;
}

interface ArchiveData {
  meta: ArchiveMeta & { dateMin: string; dateMax: string };
  accounts: { name: string; type: string; cls: string; number?: string }[];
  customers: { name: string; company?: string; email?: string; phone?: string; address?: string[] }[];
  vendors: { name: string; company?: string; email?: string; phone?: string; address?: string[] }[];
  items: { name: string; type: string; description?: string; price?: number | null }[];
  transactions: { id: string; type: string; date: string; num?: string; name?: string; memo?: string; lines: { a: string; d: number; c: number; m?: string; n?: string }[] }[];
  verification: {
    perfect: boolean;
    matched: number;
    mismatched: number;
    totalDeltaAbs: number;
    asOf: string;
    rangeStart: string;
    qbTotalDebit: number | null;
    computedTotalDebit: number;
  } | null;
}

export function generateArchive(ledger: Ledger, recon: ReconReport | null, meta: ArchiveMeta): string {
  let dateMin = "", dateMax = "";
  for (const t of ledger.transactions) {
    if (!dateMin || t.date < dateMin) dateMin = t.date;
    if (!dateMax || t.date > dateMax) dateMax = t.date;
  }
  const data: ArchiveData = {
    meta: { ...meta, dateMin, dateMax },
    accounts: [...ledger.accounts.values()].map((a) => ({ name: a.name, type: a.type, cls: a.cls, number: a.number })),
    customers: ledger.customers,
    vendors: ledger.vendors,
    items: ledger.items.map((i) => ({ name: i.name, type: i.type, description: i.description, price: i.price })),
    transactions: ledger.transactions.map((t) => ({
      id: t.id, type: t.type, date: t.date, num: t.num, name: t.name, memo: t.memo,
      lines: t.lines.map((l) => ({ a: l.account, d: l.debit, c: l.credit, m: l.memo, n: l.name })),
    })),
    verification: recon
      ? {
          perfect: recon.perfect,
          matched: recon.matched,
          mismatched: recon.mismatched + recon.missingInRebuild + recon.missingInQb,
          totalDeltaAbs: recon.totalDeltaAbs,
          asOf: recon.asOf,
          rangeStart: recon.rangeStart,
          qbTotalDebit: recon.qbTotalDebit,
          computedTotalDebit: recon.computedTotalDebit,
        }
      : null,
  };
  const json = JSON.stringify(data).replace(/<\//g, "<\\/");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(meta.companyName)} — Bookstead Archive</title>
<style>${CSS}</style>
</head>
<body>
<div id="app"><noscript>This archive needs JavaScript to render. The raw data is embedded in this file as JSON and remains readable in any text editor.</noscript></div>
<script id="bookstead-data" type="application/json">${json}</script>
<script>${VIEWER_JS}</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const CSS = `
:root{--ink:#1a2332;--mut:#5c6b7f;--line:#dde4ec;--bg:#f6f8fa;--card:#fff;--green:#0f7b4d;--green-bg:#e7f5ee;--red:#b42318;--red-bg:#fdecea;--accent:#155e75;--accent-bg:#e6f2f5}
*{margin:0;padding:0;box-sizing:border-box}
body{font:15px/1.55 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg)}
header{background:var(--card);border-bottom:2px solid var(--line);padding:20px 28px}
header h1{font-size:22px;letter-spacing:-.3px}
header .sub{color:var(--mut);font-size:13px;margin-top:2px}
.badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 12px;font-size:12.5px;font-weight:600;margin-top:10px}
.badge.ok{background:var(--green-bg);color:var(--green)}
.badge.warn{background:var(--red-bg);color:var(--red)}
nav{display:flex;gap:2px;background:var(--card);padding:0 20px;border-bottom:1px solid var(--line);flex-wrap:wrap}
nav button{border:0;background:none;padding:12px 16px;font-size:14px;color:var(--mut);cursor:pointer;border-bottom:2px solid transparent;font-weight:500}
nav button.on{color:var(--accent);border-bottom-color:var(--accent)}
main{max-width:1100px;margin:24px auto;padding:0 20px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px 20px;margin-bottom:16px}
.controls{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
input[type=search],select{padding:8px 12px;border:1px solid var(--line);border-radius:8px;font-size:14px;background:var(--card);color:var(--ink)}
input[type=search]{flex:1;min-width:220px}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{Text-align:left;color:var(--mut);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em;padding:8px 10px;border-bottom:2px solid var(--line);white-space:nowrap}
td{padding:7px 10px;border-bottom:1px solid var(--line);vertical-align:top}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr.txn-head td{background:var(--bg);font-weight:600;cursor:pointer}
tr.split td:first-child{padding-left:28px;color:var(--mut)}
a.acct{color:var(--accent);text-decoration:none;cursor:pointer}
a.acct:hover{text-decoration:underline}
.pager{display:flex;gap:8px;align-items:center;justify-content:center;margin-top:14px;color:var(--mut);font-size:13.5px}
.pager button{padding:6px 12px;border:1px solid var(--line);background:var(--card);border-radius:7px;cursor:pointer;color:var(--ink)}
.pager button:disabled{opacity:.4;cursor:default}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:800px){.grid2{grid-template-columns:1fr}}
.total td{font-weight:700;border-top:2px solid var(--ink);border-bottom:none}
.sect td{font-weight:700;color:var(--mut);background:var(--bg)}
h2{font-size:17px;margin-bottom:10px}
h3{font-size:14px;color:var(--mut);margin:14px 0 6px}
.kv{display:grid;grid-template-columns:200px 1fr;gap:4px 16px;font-size:14px}
.kv dt{color:var(--mut)}
.pos{color:var(--ink)}.neg{color:var(--red)}
footer{color:var(--mut);font-size:12.5px;text-align:center;padding:24px;border-top:1px solid var(--line);margin-top:30px}
@media print{nav,.controls,.pager{display:none!important}body{background:#fff}main{max-width:none}.card{border:none;padding:0}}
`;

const VIEWER_JS = `
(function(){
"use strict";
var DATA=JSON.parse(document.getElementById("bookstead-data").textContent);
var app=document.getElementById("app");
var fmt=function(c){var s=c<0?"-":"",a=Math.abs(c),i=Math.floor(a/100).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,",");return s+i+"."+String(a%100).padStart(2,"0")};
var esc=function(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};
var BS={asset:1,liability:1,equity:1};
var years=[];(function(){var y0=+DATA.meta.dateMin.slice(0,4),y1=+DATA.meta.dateMax.slice(0,4);for(var y=y0;y<=y1;y++)years.push(y)})();
var state={tab:"transactions",q:"",acct:"",type:"",year:"",page:0,repYear:years[years.length-1]||new Date().getFullYear(),rep:"tb"};

function header(){
  var v=DATA.verification,badge="";
  if(v){badge=v.perfect
    ?'<span class="badge ok">&#10003; Verified: rebuilt trial balance matches QuickBooks to the penny ('+v.matched+' accounts, as of '+esc(v.asOf)+')</span>'
    :'<span class="badge warn">&#9888; '+v.mismatched+' account(s) did not reconcile (total delta '+fmt(v.totalDeltaAbs)+') — see the Bookstead report</span>';}
  return '<header><h1>'+esc(DATA.meta.companyName)+'</h1><div class="sub">Bookstead Archive · '+esc(DATA.meta.dateMin)+' to '+esc(DATA.meta.dateMax)+' · '+DATA.transactions.length.toLocaleString()+' transactions · generated '+esc(DATA.meta.generatedAt.slice(0,10))+' · this file is self-contained and works offline</div>'+badge+'</header>';
}
var TABS=[["transactions","Transactions"],["accounts","Accounts"],["names","Customers & Vendors"],["reports","Reports"],["about","About this archive"]];
function nav(){return '<nav>'+TABS.map(function(t){return '<button data-tab="'+t[0]+'" class="'+(state.tab===t[0]?"on":"")+'">'+t[1]+'</button>'}).join("")+'</nav>'}

function txnMatches(t){
  if(state.year&&t.date.slice(0,4)!==state.year)return false;
  if(state.type&&t.type!==state.type)return false;
  if(state.acct&&!t.lines.some(function(l){return l.a===state.acct}))return false;
  if(state.q){var q=state.q.toLowerCase();var hay=(t.type+" "+t.date+" "+(t.num||"")+" "+(t.name||"")+" "+(t.memo||"")+" "+t.lines.map(function(l){return l.a+" "+(l.m||"")+" "+(l.n||"")}).join(" ")).toLowerCase();
    if(hay.indexOf(q)===-1)return false;}
  return true;
}
function transactions(){
  var types={};DATA.transactions.forEach(function(t){types[t.type]=1});
  var list=DATA.transactions.filter(txnMatches);
  var PER=50,pages=Math.max(1,Math.ceil(list.length/PER));if(state.page>=pages)state.page=pages-1;
  var slice=list.slice(state.page*PER,(state.page+1)*PER);
  var rows=slice.map(function(t){
    var amt=t.lines.reduce(function(s,l){return s+l.d},0);
    var head='<tr class="txn-head"><td>'+esc(t.date)+'</td><td>'+esc(t.type)+'</td><td>'+esc(t.num||"")+'</td><td>'+esc(t.name||"")+'</td><td>'+esc(t.memo||"")+'</td><td class="num">'+fmt(amt)+'</td></tr>';
    var splits=t.lines.map(function(l){return '<tr class="split"><td colspan="2"><a class="acct" data-acct="'+esc(l.a)+'">'+esc(l.a)+'</a></td><td colspan="2">'+esc(l.n||l.m||"")+'</td><td class="num">'+(l.d?fmt(l.d):"")+'</td><td class="num">'+(l.c?fmt(l.c):"")+'</td></tr>'}).join("");
    return head+splits;
  }).join("");
  return '<div class="card"><div class="controls">'+
    '<input type="search" id="q" placeholder="Search memo, name, account, number…" value="'+esc(state.q)+'">'+
    '<select id="fYear"><option value="">All years</option>'+years.map(function(y){return '<option '+(state.year==y?"selected":"")+'>'+y+'</option>'}).join("")+'</select>'+
    '<select id="fType"><option value="">All types</option>'+Object.keys(types).sort().map(function(x){return '<option '+(state.type===x?"selected":"")+'>'+esc(x)+'</option>'}).join("")+'</select>'+
    '<select id="fAcct"><option value="">All accounts</option>'+DATA.accounts.map(function(a){return '<option value="'+esc(a.name)+'" '+(state.acct===a.name?"selected":"")+'>'+esc(a.name)+'</option>'}).join("")+'</select>'+
    '</div><table><thead><tr><th>Date</th><th>Type</th><th>Num</th><th>Name</th><th>Memo</th><th class="num">Amount / Dr | Cr</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan="6" style="text-align:center;color:var(--mut);padding:30px">No transactions match.</td></tr>')+'</tbody></table>'+
    '<div class="pager"><button id="prev" '+(state.page===0?"disabled":"")+'>&larr; Prev</button><span>Page '+(state.page+1)+' of '+pages+' · '+list.length.toLocaleString()+' transactions</span><button id="next" '+(state.page>=pages-1?"disabled":"")+'>Next &rarr;</button></div></div>';
}
function balances(upTo,from){var m={};DATA.transactions.forEach(function(t){if(t.date>upTo)return;if(from&&t.date<from)return;t.lines.forEach(function(l){m[l.a]=(m[l.a]||0)+l.d-l.c})});return m}
function accounts(){
  var bal=balances("9999-12-31","");
  var byCls={asset:[],liability:[],equity:[],income:[],expense:[]};
  DATA.accounts.forEach(function(a){(byCls[a.cls]=byCls[a.cls]||[]).push(a)});
  var html='<div class="card"><h2>Chart of accounts &amp; all-time balances</h2><table><thead><tr><th>Account</th><th>Type</th><th class="num">Balance (Dr+)</th></tr></thead><tbody>';
  ["asset","liability","equity","income","expense"].forEach(function(cls){
    var arr=byCls[cls]||[];if(!arr.length)return;
    html+='<tr class="sect"><td colspan="3">'+cls.toUpperCase()+'</td></tr>';
    arr.forEach(function(a){var b=bal[a.name]||0;
      html+='<tr><td><a class="acct" data-acct="'+esc(a.name)+'">'+esc((a.number?a.number+" · ":"")+a.name)+'</a></td><td>'+esc(a.type)+'</td><td class="num '+(b<0?"neg":"pos")+'">'+fmt(b)+'</td></tr>'});
  });
  return html+'</tbody></table></div>';
}
function names(){
  function block(title,arr){return '<div class="card"><h2>'+title+' ('+arr.length+')</h2><table><thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Address</th></tr></thead><tbody>'+
    arr.map(function(c){return '<tr><td>'+esc(c.name)+'</td><td>'+esc(c.company||"")+'</td><td>'+esc(c.email||"")+'</td><td>'+esc(c.phone||"")+'</td><td>'+esc((c.address||[]).join(", "))+'</td></tr>'}).join("")+'</tbody></table></div>'}
  return block("Customers",DATA.customers)+block("Vendors",DATA.vendors);
}
function reports(){
  var y=state.repYear,from=y+"-01-01",to=y+"-12-31";
  var sel='<div class="controls"><select id="repYear">'+years.map(function(x){return '<option '+(x==y?"selected":"")+'>'+x+'</option>'}).join("")+'</select>'+
    '<select id="repKind"><option value="tb" '+(state.rep==="tb"?"selected":"")+'>Trial Balance</option><option value="pl" '+(state.rep==="pl"?"selected":"")+'>Profit &amp; Loss</option><option value="bs" '+(state.rep==="bs"?"selected":"")+'>Balance Sheet</option></select>'+
    '<button onclick="window.print()" style="padding:8px 14px;border:1px solid var(--line);border-radius:8px;background:var(--card);cursor:pointer">Print / Save PDF</button></div>';
  var cum=balances(to,""),per=balances(to,from),html="";
  var acctsBy={};DATA.accounts.forEach(function(a){acctsBy[a.name]=a});
  if(state.rep==="tb"){
    var rows=[],re=0,td=0,tc=0;
    DATA.accounts.forEach(function(a){
      var v=BS[a.cls]?(cum[a.name]||0):(per[a.name]||0);
      if(!BS[a.cls])re+=(cum[a.name]||0)-(per[a.name]||0);
      if(v)rows.push([a.name,v]);
    });
    if(re){var hit=rows.filter(function(r){return /retained earnings/i.test(r[0])})[0];if(hit)hit[1]+=re;else rows.push(["Retained Earnings (computed)",re]);}
    rows.sort(function(a,b){return a[0]<b[0]?-1:1});
    html='<div class="card"><h2>Trial Balance — as of '+to+'</h2><table><thead><tr><th>Account</th><th class="num">Debit</th><th class="num">Credit</th></tr></thead><tbody>'+
      rows.map(function(r){var v=r[1];if(v>=0)td+=v;else tc-=v;
        return '<tr><td>'+esc(r[0])+'</td><td class="num">'+(v>=0?fmt(v):"")+'</td><td class="num">'+(v<0?fmt(-v):"")+'</td></tr>'}).join("")+
      '<tr class="total"><td>TOTAL</td><td class="num">'+fmt(td)+'</td><td class="num">'+fmt(tc)+'</td></tr></tbody></table></div>';
  }else if(state.rep==="pl"){
    var inc=[],exp=[],ti=0,te=0;
    DATA.accounts.forEach(function(a){var v=per[a.name]||0;if(!v)return;
      if(a.cls==="income"){inc.push([a.name,-v]);ti+=-v}
      if(a.cls==="expense"){exp.push([a.name,v]);te+=v}});
    function sec(title,arr,total){return '<tr class="sect"><td colspan="2">'+title+'</td></tr>'+arr.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td class="num">'+fmt(r[1])+'</td></tr>'}).join("")+'<tr class="total"><td>Total '+title+'</td><td class="num">'+fmt(total)+'</td></tr>'}
    html='<div class="card"><h2>Profit &amp; Loss — '+y+'</h2><table><tbody>'+sec("Income",inc,ti)+sec("Expenses",exp,te)+
      '<tr class="total"><td>NET INCOME</td><td class="num '+(ti-te<0?"neg":"pos")+'">'+fmt(ti-te)+'</td></tr></tbody></table></div>';
  }else{
    var re2=0;DATA.accounts.forEach(function(a){if(!BS[a.cls])re2+=cum[a.name]||0});
    function side(clsList,flip){var rows2=[],tot=0;
      DATA.accounts.forEach(function(a){if(clsList.indexOf(a.cls)===-1)return;var v=(cum[a.name]||0)*(flip?-1:1);if(!v)return;rows2.push([a.name,v]);tot+=v});
      return {rows:rows2,tot:tot}}
    var A=side(["asset"],false),L=side(["liability"],true),E=side(["equity"],true);
    E.rows.push(["Retained Earnings + current year (computed)",-re2]);E.tot+=-re2;
    function tbl(title,S){return '<tr class="sect"><td colspan="2">'+title+'</td></tr>'+S.rows.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td class="num">'+fmt(r[1])+'</td></tr>'}).join("")+'<tr class="total"><td>Total '+title+'</td><td class="num">'+fmt(S.tot)+'</td></tr>'}
    html='<div class="card"><h2>Balance Sheet — as of '+to+'</h2><div class="grid2"><table><tbody>'+tbl("Assets",A)+'</tbody></table><table><tbody>'+tbl("Liabilities",L)+tbl("Equity",E)+'</tbody></table></div>'+
      '<p style="margin-top:10px;color:var(--mut);font-size:13px">Assets '+fmt(A.tot)+' = Liabilities + Equity '+fmt(L.tot+E.tot)+(A.tot===L.tot+E.tot?" &#10003;":" &#9888;")+'</p></div>';
  }
  return '<div class="card">'+sel+'</div>'+html;
}
function about(){
  var v=DATA.verification;
  return '<div class="card"><h2>About this archive</h2><dl class="kv">'+
    '<dt>Company</dt><dd>'+esc(DATA.meta.companyName)+'</dd>'+
    '<dt>Coverage</dt><dd>'+esc(DATA.meta.dateMin)+' through '+esc(DATA.meta.dateMax)+'</dd>'+
    '<dt>Contents</dt><dd>'+DATA.transactions.length.toLocaleString()+' transactions · '+DATA.accounts.length+' accounts · '+DATA.customers.length+' customers · '+DATA.vendors.length+' vendors · '+DATA.items.length+' items</dd>'+
    '<dt>Verification</dt><dd>'+(v?(v.perfect?"Rebuilt trial balance matched the QuickBooks-exported trial balance exactly ("+v.matched+" accounts, as of "+esc(v.asOf)+"). Total debits: "+fmt(v.computedTotalDebit)+".":"Reconciliation had "+v.mismatched+" unmatched account(s); total absolute delta "+fmt(v.totalDeltaAbs)+"."):"No trial balance was provided at generation time.")+'</dd>'+
    '<dt>Generated</dt><dd>'+esc(DATA.meta.generatedAt)+' by Bookstead '+esc(DATA.meta.appVersion)+'</dd>'+
    '</dl><h3>Permanence</h3><p>This file is deliberately self-contained: the data (embedded JSON) and this viewer (plain JavaScript) live in the one .html file. It makes no network requests, requires no account, and does not depend on Bookstead existing. Copy it anywhere; open it in any browser; print any report to PDF. If browsers someday stop running JavaScript, the raw JSON between the &lt;script id="bookstead-data"&gt; tags remains plainly readable.</p>'+
    '<h3>Scope</h3><p>Rebuilt from QuickBooks Desktop list exports (IIF) and the Custom Transaction Detail report. General-ledger postings only: audit trail, attachments, payroll item detail, and memorized/custom reports are not part of QuickBooks&#39; exports and are not included.</p></div>';
}
function render(){
  var body={transactions:transactions,accounts:accounts,names:names,reports:reports,about:about}[state.tab]();
  app.innerHTML=header()+nav()+'<main>'+body+'</main><footer>'+esc(DATA.meta.companyName)+' — Bookstead Archive — self-contained, offline, yours.</footer>';
  app.querySelectorAll("nav button").forEach(function(b){b.onclick=function(){state.tab=b.dataset.tab;state.page=0;render()}});
  app.querySelectorAll("a.acct").forEach(function(a){a.onclick=function(){state.tab="transactions";state.acct=a.dataset.acct;state.page=0;render()}});
  var q=document.getElementById("q");if(q){q.oninput=debounce(function(){state.q=q.value;state.page=0;render();document.getElementById("q").focus();var el=document.getElementById("q");el.setSelectionRange(el.value.length,el.value.length)},250)}
  [["fYear","year"],["fType","type"],["fAcct","acct"]].forEach(function(p){var el=document.getElementById(p[0]);if(el)el.onchange=function(){state[p[1]]=el.value;state.page=0;render()}});
  var prev=document.getElementById("prev"),next=document.getElementById("next");
  if(prev)prev.onclick=function(){state.page--;render()};
  if(next)next.onclick=function(){state.page++;render()};
  var ry=document.getElementById("repYear");if(ry)ry.onchange=function(){state.repYear=+ry.value;render()};
  var rk=document.getElementById("repKind");if(rk)rk.onchange=function(){state.rep=rk.value;render()};
}
function debounce(f,ms){var t;return function(){clearTimeout(t);t=setTimeout(f,ms)}}
render();
})();
`;
