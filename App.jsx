import { useState, useRef, useEffect } from "react";

const C = {
  bg:"#06090F", panel:"#0B1018", card:"#101924", cardH:"#141F2E",
  b:"#1A2A3F", b2:"#243550", t:"#E2ECFF", t2:"#607B99", t3:"#2E4260",
  red:"#FF4040", amber:"#F59E0B", blue:"#3E9EFF", green:"#27C785",
  cyan:"#00C4D4", violet:"#9B7EFF", gold:"#F5A623",
  rBg:"rgba(255,64,64,0.08)", aBg:"rgba(245,158,11,0.08)", bBg:"rgba(62,158,255,0.08)",
};
const PMAP = { Critical:[C.red,C.rBg], High:[C.amber,C.aBg], Medium:[C.blue,C.bBg], Low:[C.green,"rgba(39,199,133,0.08)"] };
const SMAP = { Rejected:C.red, Blocked:C.red, "On Hold":C.amber, "In Progress":C.blue, "In Review":C.blue, Submitted:C.violet, Approved:C.green, Complete:C.green, "Not Submitted":C.t2, TBD:C.t2, "Re-Submitted":C.cyan, Pending:"#3E5570", Open:C.amber, New:C.gold, Closed:C.green };
const today = new Date("2026-03-30");
const isOD = d => { if (!d||d==="TBD") return false; return Math.round((new Date(d)-today)/86400000) < 0; };
const uid = () => Math.random().toString(36).slice(2,7).toUpperCase();

const Pill = ({label, color}) => <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",color,background:color+"18",border:`1px solid ${color}28`}}>{label}</span>;
const PBadge = ({p}) => { const [c,bg] = PMAP[p]||[C.t2,"transparent"]; return <Pill label={p} color={c}/>; };
const SBadge = ({v}) => <Pill label={v} color={SMAP[v]||C.t2}/>;
const Row = ({l,v}) => <div style={{display:"flex",gap:8,marginBottom:5}}><span style={{fontSize:9,color:C.t3,width:90,flexShrink:0,textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</span><span style={{fontSize:11,color:C.t2}}>{v||"—"}</span></div>;
const Btn = ({label,onClick,color=C.blue,outline,sm,disabled}) => <button onClick={onClick} disabled={disabled} style={{padding:sm?"4px 10px":"7px 16px",borderRadius:6,border:`1px solid ${outline?color:color+"40"}`,background:outline?"transparent":disabled?C.b:color+(outline?"":"22"),color:disabled?C.t3:color,fontSize:sm?9:11,fontWeight:700,cursor:disabled?"not-allowed":"pointer"}}>{label}</button>;

const JOBS0 = [
  {id:"J01",w:"BHCD-FBR-03-E",p:"2025001170",pri:"Critical",hot:1,sp:"Rejected",sq:"Pending",sc:"Blocked",own:"Evelyn Padilla",blk:"QC + response letter pending before resubmit",nxt:"Confirm QC + response letter; update tracker",ecd:"2026-03-12",ag:"Miami-Dade",city:"Miami-Dade",note:"Bike path + MOT comments. Coord w/ Yanek accepted.",lu:"2026-03-10",hist:[]},
  {id:"J02",w:"BHCD-FBR-03-W",p:"2025001170",pri:"Critical",hot:1,sp:"Rejected",sq:"Pending",sc:"Blocked",own:"Evelyn Padilla",blk:"QC + response letter pending",nxt:"Same permit as E — QC + response letter + tracker note",ecd:"2026-03-12",ag:"Miami-Dade",city:"Miami-Dade",note:"Shares permit 2025001170.",lu:"2026-03-10",hist:[]},
  {id:"J03",w:"FB-HBR201",p:"2025007053",pri:"Critical",hot:1,sp:"In Review",sq:"Complete",sc:"Blocked",own:"Evelyn Padilla",blk:"AT&T FIFO 30-day window; rodding results pending",nxt:"Confirm AT&T payment w/ Miguel Gomez; SFWMD meeting",ecd:"2026-03-31",ag:"AT&T / SFWMD",city:"Broward",note:"AT&T order 2026-SE-FL-000149-A05DEVH.",lu:"2026-03-10",hist:[]},
  {id:"J04",w:"FB-HBR252",p:"251120-59436",pri:"Critical",hot:1,sp:"Rejected",sq:"Pending",sc:"Blocked",own:"DFT / Evelyn",blk:"Missing 15ft clearance callout on Sheet 5 — repeated RAI",nxt:"Add 15ft clearance callout + dimension + cloud on Sheet 5",ecd:"2026-03-20",ag:"SFWMD",city:"Broward",note:"SFWMD Canal C-1W. 3/26: Bridge as-builts received from FDOT.",lu:"2026-03-10",hist:[]},
  {id:"J05",w:"FB-HBR346",p:"",pri:"High",hot:1,sp:"In Review",sq:"Pending",sc:"Blocked",own:"Evelyn Padilla",blk:"SFWMD bridge spacing + NEW: USACE Certified Lands crossing issue",nxt:"Evelyn to contact DFT for USACE Certified Lands resolution",ecd:"2026-03-27",ag:"SFWMD / USACE",city:"Broward",note:"3/30: USACE 404 no permit needed BUT crosses Certified Lands — Real Estate Division review required.",lu:"2026-03-10",hist:[]},
  {id:"J06",w:"D-HBR221",p:"",pri:"Critical",hot:1,sp:"Not Submitted",sq:"Pending",sc:"Blocked",own:"Omar Molina / DFT",blk:"Culvert redesign + scope split — 17 residential properties",nxt:"Formalize scope split w/ Carl/Natalie; secondary project",ecd:"2026-04-01",ag:"DERM",city:"Broward",note:"3/24/26: Redesign confirmed. Pending updated drawings.",lu:"2026-03-10",hist:[]},
  {id:"J07",w:"D-HCS403",p:"",pri:"High",hot:1,sp:"Not Submitted",sq:"Pending",sc:"Blocked",own:"DFT / Alec",blk:"Culvert info required by Tamarac; field verification pending",nxt:"Confirm permit submitted today 3/30; culvert 36\" confirmed via VAC",ecd:"2026-03-30",ag:"Tamarac",city:"Tamarac",note:"3/30: Andy emailed Draftech — submit today. 36\" culvert confirmed.",lu:"2026-03-10",hist:[]},
  {id:"J08",w:"D-HCS404",p:"",pri:"High",hot:1,sp:"Not Submitted",sq:"Pending",sc:"Blocked",own:"DFT / Alec",blk:"Culvert info pending",nxt:"Same as HCS403 — confirm submission today 3/30",ecd:"2026-03-30",ag:"Tamarac",city:"Tamarac",note:"3/30: Submit with HCS403. Same 36\" culvert requirement.",lu:"2026-03-10",hist:[]},
  {id:"J09",w:"D-HCS132",p:"",pri:"High",hot:0,sp:"In Review",sq:"Pending",sc:"Pending",own:"DFT",blk:"Revised PD pending",nxt:"Follow up with BC MOT on 4/1 — drop-off confirmed 3/18",ecd:"2026-03-20",ag:"Broward County",city:"Broward",note:"MOT / bike path. Drop-off confirmed 3/18.",lu:"2026-03-10",hist:[]},
  {id:"J10",w:"FB-HCS527",p:"",pri:"High",hot:1,sp:"TBD",sq:"Pending",sc:"TBD",own:"TBD",blk:"Owner / ECD not assigned",nxt:"Address BCTED MOT comments; field coord w/ Patricia/Southern Traffic + Marco",ecd:"",ag:"Broward County",city:"Broward",note:"BCTED MOT rejected. Field coordination required.",lu:"2026-03-10",hist:[]},
  {id:"J11",w:"FX4-FSR-06-4K",p:"",pri:"Critical",hot:1,sp:"Rejected",sq:"Pending",sc:"Blocked",own:"Me",blk:"FDOT 546 sight triangle unresolved; 3 jobs frozen",nxt:"Complete QC on PD; submit to City of Hollywood by 3/31",ecd:"2026-03-31",ag:"Hollywood / FDOT",city:"Hollywood",note:"3/30: PD on hand and under QC. Submit to Hollywood 3/31.",lu:"2026-03-10",hist:[]},
  {id:"J12",w:"BHCD-FSR-04-W",p:"",pri:"High",hot:0,sp:"Not Submitted",sq:"Pending",sc:"Blocked",own:"Stephen Mbadinga (MTZ)",blk:"Aerial too complex; UG design requested from DFT",nxt:"Design requested from DFT (3/27). ECD: 4/10.",ecd:"2026-04-10",ag:"Broward County",city:"Sunrise",note:"3/27: Design requested from DFT, pending ECD. Owner: Stephen Mbadinga.",lu:"2026-03-10",hist:[]},
  {id:"J13",w:"FX4-FCS-03",p:"",pri:"Critical",hot:1,sp:"Not Submitted",sq:"Pending",sc:"Blocked",own:"Natalie Lennox",blk:"Dual FX4 not approved; 76 jobs frozen in BROW037/038",nxt:"Get written joint Byers/Tillman sign-off — no DFT work without it",ecd:"TBD",ag:"Coral Springs",city:"Coral Springs",note:"Dual FX4 rejected after DA approval.",lu:"2026-03-10",hist:[]},
  {id:"J14",w:"FB-HSR450",p:"",pri:"High",hot:0,sp:"In Review",sq:"Pending",sc:"Blocked",own:"TBD",blk:"FDOT PD shows old path; owner unknown",nxt:"Confirm owner; pending revised PD to submit to FDOT",ecd:"",ag:"FDOT",city:"Sunrise",note:"3/30: Pending revised PD to submit to FDOT.",lu:"2026-03-10",hist:[]},
  {id:"J15",w:"BHCD-FPO-03-W",p:"",pri:"Medium",hot:0,sp:"Not Submitted",sq:"Pending",sc:"Pending",own:"Omar Molina",blk:"MOT upload timing unknown",nxt:"Confirm permit submitted 3/25 per email",ecd:"",ag:"Broward County",city:"Pompano",note:"Submitted 3/25 per Natalie email.",lu:"2026-03-10",hist:[]},
];
const ACTS0 = [
  {id:"A01",t:"FBR-03 Resubmittal Confirmation",d:"Confirm QC complete, response letter drafted, tracker note added.",own:"Evelyn Padilla",by:"Me",due:"2026-03-12",st:"Open",pri:"Critical",el:1,job:"BHCD-FBR-03-E"},
  {id:"A02",t:"AT&T HBR201 Payment Confirmation",d:"Confirm payment processed with AT&T planner Miguel Gomez. FIFO queue ETA.",own:"Evelyn Padilla",by:"Me",due:"2026-03-13",st:"Open",pri:"High",el:0,job:"FB-HBR201"},
  {id:"A03",t:"SFWMD Coordination Meeting 03/13",d:"HBR252/239/346 — as-builts, bridge spacing, 15ft callout.",own:"Evelyn Padilla",by:"Me",due:"2026-03-13",st:"Open",pri:"Critical",el:1,job:"FB-HBR252"},
  {id:"A04",t:"HBR252 Sheet 5 Clearance Callout",d:"DFT: proper callout + dimension + cloud for 15ft horizontal clearance. NOT screenshot.",own:"Angel Mora / DFT",by:"Me",due:"2026-03-15",st:"Open",pri:"Critical",el:1,job:"FB-HBR252"},
  {id:"A05",t:"FX4-FCS-03 Dual FX4 Written Approval",d:"Escalate to Natalie/Carl for joint Byers/Tillman sign-off before DFT starts 76-job redesign.",own:"Natalie Lennox",by:"Me",due:"2026-03-14",st:"Open",pri:"Critical",el:2,job:"FX4-FCS-03"},
  {id:"A06",t:"John Williams Outreach — Aerial Process",d:"Contact John Williams before 03/17 Corning meeting. Request: ABF guidance, aerial permit process, Corning TAP calculator.",own:"Me",by:"Me",due:"2026-03-16",st:"Open",pri:"Critical",el:0,job:""},
];
const HOTS0=[
  {id:"H01",sum:"BHCD-FBR-03 Miami-Dade Resubmittal",issue:"Resubmitted 3/26. USACE 408 active.",nxt:"Monitor USACE 408; confirm 404 follows",own:"Evelyn Padilla",st:"Under Review",risk:"High",age:20},
  {id:"H02",sum:"FB-HBR201 AT&T + CSX + MDC",issue:"CSX $4k flagger fee. MDC rejected 3/26. SFWMD as-builts received.",nxt:"Request CSX check to Lou; follow up MDC Parks",own:"Evelyn Padilla",st:"Under Review",risk:"Critical",age:11},
  {id:"H03",sum:"SFWMD Bridge Cluster HBR252/239/346",issue:"HBR252 repeated RAI on 15ft callout.",nxt:"Fix HBR252 Sheet 5 callout.",own:"Evelyn / DFT",st:"Waiting on DFT",risk:"Critical",age:21},
  {id:"H04",sum:"FB-HBR346 USACE Certified Lands",issue:"USACE 404 no permit but crosses Certified Lands.",nxt:"Evelyn to contact DFT for resolution",own:"Evelyn Padilla",st:"New",risk:"High",age:0},
  {id:"H05",sum:"D-HBR221/223 Culvert Scope Split",issue:"17 houses stripped. Redesign confirmed 3/24.",nxt:"Formalize scope split with Carl/Natalie",own:"Omar Molina",st:"Under Review",risk:"Critical",age:5},
  {id:"H06",sum:"FX4-FSR-06 Hollywood Submit 3/31",issue:"PD under QC as of 3/30.",nxt:"Complete QC; submit to Hollywood by 3/31",own:"Me",st:"Under Review",risk:"Critical",age:12},
  {id:"H07",sum:"FX4-FCS-03 Dual FX4 76 Jobs Frozen",issue:"Dual FX4 rejected after DA approval.",nxt:"Get written joint Byers/Tillman sign-off",own:"Natalie Lennox",st:"New",risk:"Critical",age:3},
  {id:"H08",sum:"Aerial Workstream Process Gaps",issue:"23 aerial CDs stuck. Missing Corning TAP, ABF guidance.",nxt:"Contact John Williams before 03/17",own:"Me",st:"New",risk:"Critical",age:1},
];
const LSYS=`You are Lucien, a senior OSP PM advisor for Tillman Market 9/10. OSP Standards v6.2 + Corning DTAP v2.0. Key: burial depth 36", FDH max 90 homes, Stingray 12F=609m/24F=365m, FX4 slab 94x48x5", DTAP max span 170-185ft. Active: BHCD-FBR-03 resubmitted MDC, HBR252 SFWMD 15ft callout, FX4-FSR-06 submit 3/31, FX4-FCS-03 76 jobs frozen, HBR346 USACE Certified Lands. Respond: STATUS → BLOCKER → NEXT ACTION.`;


// ─── SHARED REVIEW PANEL (used by both Email Intel and Screenshot Intel) ──────
function ReviewPanel({upd,setUpd,newActs,setNewActs,risks,appCnt,pending,onApply,onReset,jobs}){
  const [filter,setFilter]=useState("pending");
  const skipCnt=upd.filter(p=>p.st==="skipped").length;
  const vis=filter==="all"?upd:upd.filter(p=>p.st===filter);
  const confCol={High:C.green,Medium:C.gold,Low:C.amber};
  const approve=id=>setUpd(p=>p.map(x=>x.id===id?{...x,st:"approved"}:x));
  const skip=id=>setUpd(p=>p.map(x=>x.id===id?{...x,st:"skipped"}:x));
  return(<>
    <div style={{display:"flex",gap:7,marginBottom:13,flexWrap:"wrap",alignItems:"center"}}>
      {[["all","All",upd.length,C.t2],["pending","Pending",pending,C.gold],["approved","Approved",appCnt,C.green],["skipped","Skipped",skipCnt,C.t3]].map(([v,l,cnt,col])=>(
        <button key={v} onClick={()=>setFilter(v)} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${filter===v?col:C.b}`,background:filter===v?col+"20":"transparent",color:filter===v?col:C.t2,fontSize:10,fontWeight:700,cursor:"pointer"}}>{l} ({cnt})</button>
      ))}
      <div style={{marginLeft:"auto",display:"flex",gap:6}}>
        <Btn label="✓ All" onClick={()=>setUpd(p=>p.map(x=>({...x,st:"approved"})))} color={C.green} outline sm/>
        <Btn label="✕ All" onClick={()=>setUpd(p=>p.map(x=>({...x,st:"skipped"})))} color={C.t2} outline sm/>
        <Btn label="↺" onClick={()=>setUpd(p=>p.map(x=>({...x,st:"pending"})))} color={C.t2} outline sm/>
        <Btn label={`Apply ${appCnt} →`} onClick={onApply} disabled={appCnt===0} color={C.blue}/>
      </div>
    </div>
    {vis.length===0&&<div style={{textAlign:"center",padding:28,color:C.t3,fontSize:12}}>No items in this filter.</div>}
    {vis.map(p=>{
      const bdr=p.st==="approved"?C.green:p.st==="skipped"?C.t3:C.b;
      const bg=p.st==="approved"?"rgba(39,199,133,0.05)":p.st==="skipped"?"rgba(0,0,0,0.15)":C.card;
      return(
        <div key={p.id} style={{background:bg,border:`1px solid ${bdr}`,borderRadius:9,padding:"11px 13px",marginBottom:7,opacity:p.st==="skipped"?0.5:1,transition:"all 0.15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9,gap:7}}>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
              <Pill label={p.jobId||p.w||"?"} color={C.blue}/>
              <Pill label={p.fieldLabel||p.field||p.flbl} color={C.t2}/>
              <Pill label={(p.confidence||p.conf||"Med")+" conf"} color={confCol[p.confidence||p.conf]||C.t2}/>
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              {p.st!=="approved"?<Btn label="✓" onClick={()=>approve(p.id)} color={C.green} sm/>:<Btn label="✓" onClick={()=>skip(p.id)} color={C.green} outline sm/>}
              {p.st!=="skipped"?<Btn label="✕" onClick={()=>skip(p.id)} color={C.t2} outline sm/>:<Btn label="↺" onClick={()=>approve(p.id)} color={C.t2} outline sm/>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,borderRadius:6,overflow:"hidden",border:`1px solid ${C.b}`,marginBottom:7}}>
            <div style={{padding:"7px 11px",background:"rgba(255,64,64,0.05)",borderRight:`1px solid ${C.b}`}}>
              <div style={{fontSize:8,fontWeight:700,color:C.red,textTransform:"uppercase",marginBottom:3}}>Current</div>
              <div style={{fontSize:11,color:C.t2,lineHeight:1.4,wordBreak:"break-word"}}>{p.oldValue||p.old||"—"}</div>
            </div>
            <div style={{padding:"7px 11px",background:"rgba(39,199,133,0.05)"}}>
              <div style={{fontSize:8,fontWeight:700,color:C.green,textTransform:"uppercase",marginBottom:3}}>Proposed</div>
              <div style={{fontSize:11,color:C.t,lineHeight:1.4,fontWeight:500,wordBreak:"break-word"}}>{p.newValue||p.nw}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <div style={{background:C.panel,borderRadius:5,padding:"6px 9px",borderLeft:`2px solid ${C.cyan}`}}>
              <div style={{fontSize:8,color:C.t3,marginBottom:2}}>📎 SOURCE</div>
              <div style={{fontSize:10,color:C.t2,fontStyle:"italic",lineHeight:1.4}}>"{p.sourceQuote||p.src}"</div>
            </div>
            <div style={{background:C.panel,borderRadius:5,padding:"6px 9px",borderLeft:`2px solid ${C.violet}`}}>
              <div style={{fontSize:8,color:C.t3,marginBottom:2}}>💡 WHY</div>
              <div style={{fontSize:10,color:C.t2,lineHeight:1.4}}>{p.rationale||p.rat}</div>
            </div>
          </div>
        </div>
      );
    })}
    {newActs?.length>0&&<>
      <div style={{borderTop:`1px solid ${C.b}`,margin:"14px 0"}}/>
      <div style={{fontSize:10,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:9}}>New Action Items ({newActs.length})</div>
      {newActs.map((a,i)=>(
        <div key={a.id||i} style={{background:a.sel?C.card:C.panel,border:`1px solid ${a.sel?C.gold+"40":C.b}`,borderRadius:9,padding:"10px 13px",marginBottom:7,opacity:a.sel?1:0.5}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}><PBadge p={a.pri||a.priority}/>{(a.job||a.linkedJob)&&<Pill label={a.job||a.linkedJob} color={C.blue}/>}<span style={{fontSize:11,fontWeight:700,color:C.t}}>{a.t||a.topic}</span></div>
            <label style={{display:"flex",gap:4,cursor:"pointer",alignItems:"center",flexShrink:0}}><input type="checkbox" checked={a.sel} onChange={()=>setNewActs(p=>p.map((x,j)=>j===i?{...x,sel:!x.sel}:x))}/><span style={{fontSize:10,color:C.t2}}>Include</span></label>
          </div>
          <div style={{fontSize:11,color:C.t2,lineHeight:1.4,marginBottom:5}}>{a.d||a.description}</div>
          <div style={{display:"flex",gap:4}}><Pill label={"Owner: "+(a.own||a.owner||"TBD")} color={C.blue}/>{(a.due||a.dueDate)&&<Pill label={"Due: "+(a.due||a.dueDate)} color={isOD(a.due||a.dueDate)?C.red:C.t3}/>}</div>
        </div>
      ))}
    </>}
    {risks?.length>0&&<>
      <div style={{borderTop:`1px solid ${C.b}`,margin:"14px 0"}}/>
      <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:9}}>Flagged Risks ({risks.length})</div>
      {risks.map((r,i)=>(
        <div key={i} style={{background:C.rBg,border:`1px solid ${C.red}30`,borderRadius:9,padding:"10px 13px",marginBottom:7}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}><span>⚠️</span><span style={{fontSize:12,fontWeight:700,color:C.t}}>{r.title}</span>{(r.job||r.linkedJob)&&<Pill label={r.job||r.linkedJob} color={C.blue}/>}</div>
          <div style={{fontSize:11,color:C.t2,marginBottom:3}}>{r.desc||r.description}</div>
          <div style={{fontSize:10,color:C.amber}}>↳ {r.impact}</div>
        </div>
      ))}
    </>}
    <div style={{position:"sticky",bottom:0,background:C.panel,borderTop:`1px solid ${C.b}`,padding:"10px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
      <div style={{fontSize:11,color:C.t2}}>{appCnt} approved · {pending} pending · {skipCnt} skipped</div>
      <div style={{display:"flex",gap:7}}><Btn label="Start Over" onClick={onReset} color={C.t2} outline/><Btn label={`Apply ${appCnt} →`} onClick={onApply} disabled={appCnt===0} color={C.blue}/></div>
    </div>
  </>);
}

// ─── EMAIL INTEL ──────────────────────────────────────────────────────────────
const ESYS=`You are Lucien. Analyze the email and return ONLY valid JSON: {"emailMeta":{"from":"","subject":"","date":"","summary":""},"proposedUpdates":[{"jobId":"WO-ID","field":"sp|sq|sc|own|blk|nxt|ecd|note","fieldLabel":"human name","oldValue":"","newValue":"","confidence":"High|Medium|Low","sourceQuote":"","rationale":""}],"newActionItems":[{"topic":"","description":"","owner":"","dueDate":"","priority":"Critical|High|Medium|Low","linkedJob":""}],"flaggedRisks":[{"title":"","description":"","impact":"","job":""}]}. Known jobs: BHCD-FBR-03-E, BHCD-FBR-03-W, FB-HBR201, FB-HBR252, FB-HBR346, D-HCS403, D-HCS404, D-HCS132, FB-HCS527, FX4-FSR-06-4K, BHCD-FSR-04-W, FX4-FCS-03, FB-HSR450, BHCD-FPO-03-W. Status values: Not Submitted|In Review|Submitted|Re-Submitted|Rejected|Approved|Complete|Blocked|On Hold|Pending|TBD.`;

const DEMO_META={from:"Natalie Lennox <Natalie.Lennox@mastec.com>",subject:"Tillman Staff Call 3/30/26",date:"Mon 30 Mar 2026 15:42:48 UTC",summary:"Staff call notes. 20 job updates across Markets 9/10. BHCD-FBR-03 resubmitted to MDC. FX4-FSR-06 PD under QC targeting 3/31. New USACE Certified Lands issue on FB-HBR346. CSX flagger requirement on FB-HBR201.",attachments:["image001.png","image002.png","image003.png","Tillman Master Tracker 033026.xlsx"]};
const DEMO_UPD=[
  {id:"P01",jobId:"J01",jid:"J01",w:"BHCD-FBR-03-E",field:"sp",flbl:"Permit Status",fieldLabel:"Permit Status",oldValue:"Rejected",old:"Rejected",newValue:"Re-Submitted",nw:"Re-Submitted",confidence:"High",conf:"High",sourceQuote:"3/26/26: CP-Resubmitted to MDC",src:"3/26/26: CP-Resubmitted to MDC",rationale:"Confirmed resubmitted to Miami-Dade County on 3/26.",rat:"Confirmed resubmitted to Miami-Dade County on 3/26.",st:"pending"},
  {id:"P02",jobId:"J02",jid:"J02",w:"BHCD-FBR-03-W",field:"sp",flbl:"Permit Status",fieldLabel:"Permit Status",oldValue:"Rejected",old:"Rejected",newValue:"Re-Submitted",nw:"Re-Submitted",confidence:"High",conf:"High",sourceQuote:"3/26/26: CP-Resubmitted to MDC",src:"3/26/26: CP-Resubmitted to MDC",rationale:"Same permit 2025001170 as -E, both resubmitted 3/26.",rat:"Same permit, both resubmitted 3/26.",st:"pending"},
  {id:"P03",jobId:"J03",jid:"J03",w:"FB-HBR201",field:"blk",flbl:"Blocker",fieldLabel:"Blocker",oldValue:"AT&T FIFO 30-day",old:"AT&T FIFO 30-day",newValue:"CSX $4k flagger fee (check to Lou). MDC REJECTED 3/26 Parks review. SFWMD as-builts received 3/26.",nw:"CSX $4k flagger fee (check to Lou). MDC REJECTED 3/26 Parks review. SFWMD as-builts received 3/26.",confidence:"High",conf:"High",sourceQuote:"CSX requires 30-day notification for flaggers. Request check for flagger fee. Send to Lou.",src:"CSX requires 30-day notification for flaggers. Request check for flagger fee.",rationale:"New CSX + MDC rejection blockers confirmed.",rat:"New CSX + MDC rejection blockers confirmed.",st:"pending"},
  {id:"P04",jobId:"J05",jid:"J05",w:"FB-HBR346",field:"blk",flbl:"Blocker",fieldLabel:"Blocker",oldValue:"SFWMD bridge spacing",old:"SFWMD bridge spacing",newValue:"SFWMD + USACE Certified Lands — Real Estate Division Acquisition Branch review required",nw:"SFWMD + USACE Certified Lands — Real Estate Division Acquisition Branch review required",confidence:"High",conf:"High",sourceQuote:"Project crosses Certified Lands and will require review by Real Estate Division Acquisition Branch.",src:"Project crosses Certified Lands — Real Estate Division Acquisition Branch review required.",rationale:"Newly discovered USACE Certified Lands requirement.",rat:"Newly discovered USACE Certified Lands requirement.",st:"pending"},
  {id:"P05",jobId:"J07",jid:"J07",w:"D-HCS403",field:"nxt",flbl:"Next Action",fieldLabel:"Next Action",oldValue:"Culvert VAC check",old:"Culvert VAC check",newValue:"Confirm permit submitted 3/30 — Andy emailed Draftech. 36\" culvert confirmed via field VAC.",nw:"Confirm permit submitted 3/30 — Andy emailed Draftech. 36\" culvert confirmed via field VAC.",confidence:"High",conf:"High",sourceQuote:"3/30 - AG - Email sent to Draftech verifying status to make sure permit is submitted today",src:"3/30 - AG - Email sent to Draftech verifying permit submitted today",rationale:"Active push confirmed same day.",rat:"Active push confirmed same day.",st:"pending"},
  {id:"P06",jobId:"J11",jid:"J11",w:"FX4-FSR-06-4K",field:"sq",flbl:"QC Status",fieldLabel:"QC Status",oldValue:"Pending",old:"Pending",newValue:"In Progress",nw:"In Progress",confidence:"High",conf:"High",sourceQuote:"3/30- PD on hand and under QC",src:"3/30- PD on hand and under QC",rationale:"PD is under QC as of 3/30.",rat:"PD under QC as of 3/30.",st:"pending"},
  {id:"P07",jobId:"J11",jid:"J11",w:"FX4-FSR-06-4K",field:"ecd",flbl:"ECD",fieldLabel:"ECD",oldValue:"2026-03-20",old:"2026-03-20",newValue:"2026-03-31",nw:"2026-03-31",confidence:"High",conf:"High",sourceQuote:"Expecting design QC and submitted to Hollywood by 3/31",src:"Expecting design QC and submitted to Hollywood by 3/31",rationale:"ECD updated to 3/31.",rat:"ECD updated to 3/31.",st:"pending"},
  {id:"P08",jobId:"J12",jid:"J12",w:"BHCD-FSR-04-W",field:"own",flbl:"Owner",fieldLabel:"Owner",oldValue:"DFT",old:"DFT",newValue:"Stephen Mbadinga (MTZ)",nw:"Stephen Mbadinga (MTZ)",confidence:"High",conf:"High",sourceQuote:"BHCD-FSR-04-W-TEMP: Stephen Mbadinga (MTZ). ECD: 4/10/2026.",src:"BHCD-FSR-04-W-TEMP: Stephen Mbadinga (MTZ). ECD: 4/10/2026.",rationale:"Owner and ECD explicitly named in email.",rat:"Owner explicitly named in email.",st:"pending"},
];
const DEMO_ACTS=[
  {id:"N01",t:"FB-HBR201: CSX Flagger Check",d:"Request $4k check for CSX flagger fee to Lou. TCPT passthrough. Confirm 30-day notice required for abandoned RR.",own:"Richard Carrero / Evelyn",due:"2026-04-03",pri:"High",job:"FB-HBR201",sel:true},
  {id:"N02",t:"FB-HBR346: USACE Certified Lands",d:"Evelyn to contact DFT. Real Estate Division Acquisition Branch review process unknown.",own:"Evelyn Padilla",due:"TBD",pri:"High",job:"FB-HBR346",sel:true},
  {id:"N03",t:"D-HCS403/404: Confirm Submission EOD 3/30",d:"Andy emailed Draftech 3/30. Confirm permit submitted for both Tamarac culvert jobs.",own:"Andy Gray",due:"2026-03-30",pri:"High",job:"D-HCS403",sel:true},
];
const DEMO_RISKS=[
  {title:"BHCD-FBR-03 USACE 408/404 Dual Review",desc:"404 cannot finalize until 408 complete. Unknown timeline.",impact:"Delays construction start beyond permit approval",job:"BHCD-FBR-03-E"},
  {title:"FB-HBR346 Certified Lands — No Process Defined",desc:"Real Estate Division Acquisition Branch review has no established timeline.",impact:"Could block HBR346 indefinitely",job:"FB-HBR346"},
];

function EmailIntel({jobs,setJobs,acts,setActs}){
  const[stage,setStage]=useState("drop");
  const[drag,setDrag]=useState(false);
  const[meta,setMeta]=useState(null);
  const[upd,setUpd]=useState([]);
  const[newActs,setNewActs]=useState([]);
  const[risks,setRisks]=useState([]);
  const[log,setLog]=useState([]);
  const[applied,setApplied]=useState(0);
  const fileRef=useRef(null);
  const logRef=useRef(null);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=9999;},[log]);
  const addLog=(msg,ok=true)=>setLog(p=>[...p,{msg,ok,t:new Date().toISOString().slice(11,19)}]);

  const runDemo=()=>{
    setStage("parsing");setLog([]);
    const steps=[
      ["Reading: Tillman_Staff_Call_3_30_26.msg (2.7 MB)",true,300],
      ["From: Natalie Lennox <Natalie.Lennox@mastec.com>",true,400],
      ["Attachments: image001.png · image002.png · image003.png · Tillman Master Tracker 033026.xlsx",true,500],
      ["Extracting body text (78,078 chars)...",true,600],
      ["Cross-referencing job IDs against tracker...",true,700],
      ["Matches: BHCD-FBR-03-E/W · FB-HBR201 · FB-HBR346 · D-HCS403/04 · FX4-FSR-06 · BHCD-FSR-04-W · more...",true,900],
      [`Generated ${DEMO_UPD.length} proposed updates · ${DEMO_ACTS.length} new actions · ${DEMO_RISKS.length} risks`,true,0],
    ];
    let d=0;steps.forEach(([msg,ok,wait])=>{d+=wait;setTimeout(()=>addLog(msg,ok),d);});
    setTimeout(()=>{setMeta(DEMO_META);setUpd(DEMO_UPD.map(p=>({...p})));setNewActs(DEMO_ACTS.map(a=>({...a})));setRisks(DEMO_RISKS);setStage("review");},d+300);
  };

  const processFile=async(file)=>{
    setStage("parsing");setLog([]);
    addLog(`Reading: ${file.name} (${(file.size/1024).toFixed(0)} KB)`);
    let text="";
    try{
      if(file.name.endsWith(".txt")||file.name.endsWith(".eml")){text=await file.text();}
      else if(file.name.endsWith(".msg")){
        addLog("Extracting text from Outlook .msg...");
        const buf=await file.arrayBuffer();const bytes=new Uint8Array(buf);
        for(let i=0;i<bytes.length-1;i++){if(bytes[i+1]===0&&bytes[i]>=32&&bytes[i]<127){let s="";while(i<bytes.length-1&&bytes[i+1]===0&&bytes[i]>=32&&bytes[i]<127){s+=String.fromCharCode(bytes[i]);i+=2;}if(s.length>8)text+=s+"\n";}}
      }
    }catch(e){addLog("Read error: "+e.message,false);}
    if(text.length>200){
      addLog(`Extracted ${text.length} chars — sending to Lucien...`);
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:ESYS,messages:[{role:"user",content:`Analyze:\n\n${text.slice(0,8000)}`}]})});
        const d=await res.json();
        const raw=d.content?.find(b=>b.type==="text")?.text||"{}";
        const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
        addLog(`Found ${parsed.proposedUpdates?.length||0} updates`);
        setMeta(parsed.emailMeta||{from:file.name,subject:file.name,date:"",summary:""});
        setUpd((parsed.proposedUpdates||[]).map((p,i)=>({...p,id:"P"+i,st:"pending"})));
        setNewActs((parsed.newActionItems||[]).map((a,i)=>({...a,id:"N"+i,sel:true})));
        setRisks(parsed.flaggedRisks||[]);
      }catch(e){
        addLog("API failed — loading demo data",false);
        setMeta(DEMO_META);setUpd(DEMO_UPD.map(p=>({...p})));setNewActs(DEMO_ACTS.map(a=>({...a})));setRisks(DEMO_RISKS);
      }
    }else{
      addLog("Insufficient text — loading demo data",false);
      setMeta(DEMO_META);setUpd(DEMO_UPD.map(p=>({...p})));setNewActs(DEMO_ACTS.map(a=>({...a})));setRisks(DEMO_RISKS);
    }
    setStage("review");
  };

  const apply=()=>{
    const approved=upd.filter(p=>p.st==="approved");
    setJobs(jobs.map(j=>{
      const changes=approved.filter(p=>p.jid===j.id);
      if(!changes.length)return j;
      let jj={...j};
      changes.forEach(p=>{jj={...jj,[p.field||p.fld]:p.newValue||p.nw,lu:"2026-03-30",hist:[...(jj.hist||[]),{date:"2026-03-30",field:p.field||p.fld,from:p.old||p.oldValue,to:p.nw||p.newValue,src:"Tillman Staff Call 3/30/26"}]};});
      return jj;
    }));
    const addedActs=newActs.filter(a=>a.sel).map(a=>({...a,id:"A"+uid(),t:a.t||a.topic,d:a.d||a.description,own:a.own||a.owner||"",by:"Natalie Lennox",due:a.due||a.dueDate||"",st:"Open",pri:a.pri||a.priority||"High",el:0,job:a.job||a.linkedJob||""}));
    setActs(p=>[...p,...addedActs]);
    setApplied(approved.length+addedActs.length);
    setStage("done");
  };
  const reset=()=>{setStage("drop");setUpd([]);setNewActs([]);setRisks([]);setMeta(null);setLog([]);setApplied(0);};
  const pending=upd.filter(p=>p.st==="pending").length;
  const appCnt=upd.filter(p=>p.st==="approved").length;

  if(stage==="done")return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14,padding:30}}><div style={{fontSize:48}}>✅</div><div style={{fontSize:20,fontWeight:800,color:C.green}}>Changes Applied</div><div style={{fontSize:13,color:C.t2}}><b style={{color:C.t}}>{applied} changes</b> written to records.</div><Btn label="Process Another Email" onClick={reset} color={C.blue}/></div>);

  if(stage==="parsing")return(<div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}><div style={{fontSize:18,fontWeight:800,color:C.t,marginBottom:16}}>Processing Email...</div><div ref={logRef} style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,padding:16,fontFamily:"monospace",fontSize:11,lineHeight:2,maxHeight:360,overflowY:"auto"}}>{log.map((l,i)=><div key={i} style={{display:"flex",gap:10}}><span style={{color:C.t3,flexShrink:0}}>{l.t}</span><span style={{color:l.ok?C.t2:C.amber}}>{l.ok?"  ":"⚠ "}{l.msg}</span></div>)}{!log.length&&<span style={{color:C.t3}}>Initializing...</span>}<span style={{color:C.blue}}>▌</span></div></div>);

  if(stage==="review")return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,padding:"12px 15px",marginBottom:13}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div><div style={{fontSize:13,fontWeight:700,color:C.t,marginBottom:2}}>{meta?.subject}</div><div style={{fontSize:11,color:C.t2}}>From: {meta?.from}</div><div style={{fontSize:10,color:C.t3,marginTop:1}}>{meta?.date} · {meta?.attachments?.join(" · ")}</div></div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}><Pill label={upd.length+" updates"} color={C.blue}/><Pill label={newActs.length+" actions"} color={C.gold}/>{risks.length>0&&<Pill label={risks.length+" risks"} color={C.red}/>}</div>
        </div>
        {meta?.summary&&<div style={{fontSize:11,color:C.t2,lineHeight:1.5,borderTop:`1px solid ${C.b}`,paddingTop:7}}>{meta.summary}</div>}
      </div>
      <ReviewPanel upd={upd} setUpd={setUpd} newActs={newActs} setNewActs={setNewActs} risks={risks} appCnt={appCnt} pending={pending} onApply={apply} onReset={reset} jobs={jobs}/>
    </div>
  );

  return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:20}}><div style={{fontSize:18,fontWeight:800,color:C.t}}>Email Intelligence</div><div style={{fontSize:11,color:C.t2,marginTop:3}}>Drop an email → Lucien reads it → proposes job updates → you approve each change</div></div>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)processFile(f);}} onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${drag?C.blue:C.b2}`,borderRadius:13,padding:"40px 28px",textAlign:"center",cursor:"pointer",background:drag?C.bBg:"transparent",transition:"all 0.2s",marginBottom:14}}>
        <div style={{fontSize:36,marginBottom:10}}>📧</div>
        <div style={{fontSize:14,fontWeight:700,color:C.t,marginBottom:5}}>{drag?"Drop to process":"Drop email file here"}</div>
        <div style={{fontSize:11,color:C.t2}}>Supports .msg (Outlook) · .eml · .txt</div>
        <input ref={fileRef} type="file" accept=".msg,.eml,.txt" onChange={e=>{if(e.target.files[0])processFile(e.target.files[0]);}} style={{display:"none"}}/>
      </div>
      <div style={{textAlign:"center"}}><button onClick={runDemo} style={{padding:"9px 22px",borderRadius:7,border:`1px solid ${C.violet}50`,background:"linear-gradient(135deg,#1A0A2E,#0B1018)",color:C.violet,fontSize:12,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:9}}><span style={{width:20,height:20,borderRadius:"50%",background:`linear-gradient(135deg,${C.violet},${C.blue})`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff"}}>L</span>Load Demo: Tillman Staff Call 3/30/26</button></div>
    </div>
  );
}

// ─── SCREENSHOT INTEL ─────────────────────────────────────────────────────────
const SS_SYS=`You are Lucien, an OSP PM advisor for Tillman Market 9/10. Analyze the screenshot and return ONLY valid JSON: {"screenshotType":"Permit Portal|SiteTracker|Excel|Email|Map|Report|Other","summary":"1-2 sentences","proposedUpdates":[{"jobId":"WO-ID","field":"sp|sq|sc|own|blk|nxt|ecd|ag|p|note","fieldLabel":"human name","oldValue":"","newValue":"","confidence":"High|Medium|Low","sourceQuote":"exact text from image","rationale":"why"}],"newActionItems":[{"topic":"","description":"","owner":"","dueDate":"YYYY-MM-DD or TBD","priority":"Critical|High|Medium|Low","linkedJob":""}],"flaggedRisks":[{"title":"","description":"","impact":"","job":""}]}. Known job IDs: BHCD-FBR-03-E, BHCD-FBR-03-W, FB-HBR201, FB-HBR252, FB-HBR346, D-HCS403, D-HCS404, D-HCS132, FB-HCS527, FX4-FSR-06-4K, BHCD-FSR-04-W, FX4-FCS-03, FB-HSR450, BHCD-FPO-03-W. Be thorough — read all visible text, statuses, dates, names. If no job IDs are visible, still extract any actionable information.`;

function ScreenshotIntel({jobs,setJobs,acts,setActs}){
  const[stage,setStage]=useState("drop");
  const[drag,setDrag]=useState(false);
  const[images,setImages]=useState([]);
  const[result,setResult]=useState(null);
  const[upd,setUpd]=useState([]);
  const[newActs,setNewActs]=useState([]);
  const[risks,setRisks]=useState([]);
  const[err,setErr]=useState("");
  const[applied,setApplied]=useState(0);
  const fileRef=useRef(null);

  const toB64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);});
  const mimeOk=f=>f.type.startsWith("image/");

  const processFiles=async(files)=>{
    const valid=[...files].filter(mimeOk);
    if(!valid.length){setErr("Please drop image files (PNG, JPG, WEBP, GIF).");return;}
    setStage("analyzing");setErr("");
    const imgs=await Promise.all(valid.map(async f=>({name:f.name,b64:await toB64(f),preview:URL.createObjectURL(f),mime:f.type})));
    setImages(imgs);
    try{
      const content=[
        {type:"text",text:`Analyze ${imgs.length>1?"these screenshots":"this screenshot"} carefully and extract all actionable job updates.`},
        ...imgs.map(img=>({type:"image",source:{type:"base64",media_type:img.mime,data:img.b64}}))
      ];
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SS_SYS,messages:[{role:"user",content}]})});
      const d=await res.json();
      const raw=d.content?.find(b=>b.type==="text")?.text||"{}";
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(parsed);
      setUpd((parsed.proposedUpdates||[]).map((p,i)=>({...p,id:"S"+i,st:"pending"})));
      setNewActs((parsed.newActionItems||[]).map((a,i)=>({...a,id:"SN"+i,sel:true})));
      setRisks(parsed.flaggedRisks||[]);
      setStage("review");
    }catch(e){
      setErr("Analysis failed: "+(e.message||String(e))+". Check your connection and try again.");
      setStage("drop");
    }
  };

  const apply=()=>{
    const approved=upd.filter(p=>p.st==="approved");
    setJobs(jobs.map(j=>{
      const changes=approved.filter(p=>p.jobId===j.w);
      if(!changes.length)return j;
      let jj={...j};
      changes.forEach(p=>{jj={...jj,[p.field]:p.newValue,lu:"2026-03-30",hist:[...(jj.hist||[]),{date:"2026-03-30",field:p.field,from:p.oldValue,to:p.newValue,src:"Screenshot analysis"}]};});
      return jj;
    }));
    const addedActs=newActs.filter(a=>a.sel).map(a=>({...a,id:"A"+uid(),t:a.topic,d:a.description,own:a.owner||"",by:"Screenshot Intel",due:a.dueDate||"",st:"Open",pri:a.priority||"High",el:0,job:a.linkedJob||""}));
    setActs(p=>[...p,...addedActs]);
    setApplied(approved.length+addedActs.length);
    setStage("done");
  };
  const reset=()=>{setStage("drop");setImages([]);setResult(null);setUpd([]);setNewActs([]);setRisks([]);setErr("");setApplied(0);};
  const pending=upd.filter(p=>p.st==="pending").length;
  const appCnt=upd.filter(p=>p.st==="approved").length;

  if(stage==="done")return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:14,padding:30}}><div style={{fontSize:48}}>✅</div><div style={{fontSize:20,fontWeight:800,color:C.green}}>Changes Applied</div><div style={{fontSize:13,color:C.t2}}><b style={{color:C.t}}>{applied} changes</b> written to records.</div><Btn label="Analyze Another Screenshot" onClick={reset} color={C.blue}/></div>);

  if(stage==="analyzing")return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:18,padding:40}}>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:4}}>{images.map((img,i)=><img key={i} src={img.preview} alt={img.name} style={{width:130,height:90,objectFit:"cover",borderRadius:7,border:`1px solid ${C.b2}`}}/>)}</div>
    <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.violet},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>L</div>
    <div style={{fontSize:14,fontWeight:700,color:C.t}}>Lucien is reading the screenshot{images.length>1?"s":""}...</div>
    <div style={{fontSize:11,color:C.t2,textAlign:"center",maxWidth:340,lineHeight:1.6}}>Identifying job IDs, permit statuses, dates, owners, and action items.</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{width:18,height:18,border:`2px solid ${C.b2}`,borderTopColor:C.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
  </div>);

  if(stage==="review")return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:13,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:18,fontWeight:800,color:C.t}}>Screenshot Analysis</div><div style={{fontSize:11,color:C.t2,marginTop:2}}>{result?.screenshotType||"Unknown"} · {images.length} image{images.length>1?"s":""}</div></div>
        <Btn label="New Screenshot" onClick={reset} color={C.t2} outline sm/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,padding:"12px 15px",marginBottom:13,display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{display:"flex",gap:7,flexShrink:0}}>{images.map((img,i)=><img key={i} src={img.preview} alt={img.name} style={{width:75,height:52,objectFit:"cover",borderRadius:5,border:`1px solid ${C.b2}`}}/>)}</div>
        <div><div style={{fontSize:10,fontWeight:700,color:C.violet,marginBottom:3,textTransform:"uppercase"}}>{result?.screenshotType}</div><div style={{fontSize:11,color:C.t2,lineHeight:1.5}}>{result?.summary}</div><div style={{marginTop:7,display:"flex",gap:5}}><Pill label={upd.length+" updates"} color={C.blue}/>{newActs.length>0&&<Pill label={newActs.length+" actions"} color={C.gold}/>}{risks.length>0&&<Pill label={risks.length+" risks"} color={C.red}/>}</div></div>
      </div>
      {upd.length===0&&risks.length===0&&newActs.length===0&&(<div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,padding:"28px 20px",textAlign:"center",marginBottom:12}}><div style={{fontSize:24,marginBottom:8}}>🔍</div><div style={{fontSize:13,fontWeight:700,color:C.t,marginBottom:5}}>No job updates detected</div><div style={{fontSize:11,color:C.t2,lineHeight:1.5}}>Try a screenshot that shows job IDs, permit statuses, or work order names.</div></div>)}
      <ReviewPanel upd={upd} setUpd={setUpd} newActs={newActs} setNewActs={setNewActs} risks={risks} appCnt={appCnt} pending={pending} onApply={apply} onReset={reset} jobs={jobs}/>
    </div>
  );

  return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:20}}><div style={{fontSize:18,fontWeight:800,color:C.t}}>Screenshot Intel</div><div style={{fontSize:11,color:C.t2,marginTop:3}}>Drop any screenshot — permit portal, SiteTracker, Excel, Outlook, map, report. Lucien reads it and proposes job updates.</div></div>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);processFiles(e.dataTransfer.files);}} onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${drag?C.cyan:C.b2}`,borderRadius:13,padding:"44px 28px",textAlign:"center",cursor:"pointer",background:drag?"rgba(0,196,212,0.06)":"transparent",transition:"all 0.2s",marginBottom:14}}>
        <div style={{fontSize:36,marginBottom:10}}>📸</div>
        <div style={{fontSize:14,fontWeight:700,color:C.t,marginBottom:5}}>{drag?"Drop to analyze":"Drop screenshots here"}</div>
        <div style={{fontSize:11,color:C.t2,marginBottom:3}}>PNG · JPG · WEBP · GIF · Drop multiple images at once</div>
        <div style={{fontSize:10,color:C.t3}}>Permit portals · SiteTracker · Excel · Outlook · Maps · Inspection reports</div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={e=>processFiles(e.target.files)} style={{display:"none"}}/>
      </div>
      {err&&<div style={{background:C.rBg,border:`1px solid ${C.red}30`,borderRadius:7,padding:"9px 13px",marginBottom:12,fontSize:11,color:C.red}}>{err}</div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
        {["🌐 Permit Portals","📊 SiteTracker / Excel","📧 Email Screenshots","🗺 Maps & Plans","📋 Inspection Reports","📄 Letters & RFIs"].map(l=>(
          <div key={l} style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:6,padding:"5px 11px",fontSize:11,color:C.t2}}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function HotsView({hots,setHots}){
  const[sel,setSel]=useState(null);
  const move=(id,st)=>setHots(p=>p.map(x=>x.id===id?{...x,st}:x));
  return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:18}}><div style={{fontSize:18,fontWeight:800,color:C.t}}>Hot Topics Board</div><div style={{fontSize:11,color:C.t2,marginTop:2}}>{hots.filter(h=>h.st!=="Closed").length} open</div></div>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:10}}>
        {HCOLS.map(col=>{
          const cards=hots.filter(h=>h.st===col);
          return(
            <div key={col} style={{minWidth:226,flexShrink:0}}>
              <div style={{background:C.panel,border:`1px solid ${C.b2}`,borderRadius:"7px 7px 0 0",padding:"7px 11px",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:9,fontWeight:700,color:C.t2,textTransform:"uppercase",letterSpacing:"0.08em"}}>{col}</span>
                <span style={{fontSize:10,color:C.t3,fontFamily:"monospace"}}>{cards.length}</span>
              </div>
              <div style={{background:C.card,border:`1px solid ${C.b}`,borderTop:"none",borderRadius:"0 0 7px 7px",minHeight:150,padding:7}}>
                {cards.map(h=>(
                  <div key={h.id} onClick={()=>setSel(sel===h.id?null:h.id)} style={{background:C.panel,border:`1px solid ${h.risk==="Critical"?C.red+"30":C.b}`,borderRadius:6,padding:"9px 10px",marginBottom:7,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><Pill label={h.risk} color={h.risk==="Critical"?C.red:C.amber}/><span style={{fontSize:9,color:C.t3}}>{h.age}d</span></div>
                    <div style={{fontSize:11,fontWeight:700,color:C.t,marginBottom:3,lineHeight:1.3}}>{h.sum}</div>
                    <div style={{fontSize:9,color:C.t2}}>{h.nxt?.slice(0,55)}…</div>
                    {sel===h.id&&(
                      <div style={{marginTop:8,borderTop:`1px solid ${C.b}`,paddingTop:8}} onClick={e=>e.stopPropagation()}>
                        <div style={{fontSize:9,color:C.t2,marginBottom:6,lineHeight:1.4}}>{h.issue}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {HCOLS.filter(c=>c!==col).map(c=><button key={c} onClick={()=>move(h.id,c)} style={{fontSize:8,padding:"2px 6px",borderRadius:3,border:`1px solid ${C.b2}`,background:C.card,color:C.t2,cursor:"pointer"}}>{c}</button>)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FLD_S = {background:C.bg,border:`1px solid ${C.b2}`,borderRadius:5,padding:"5px 9px",color:C.t,fontSize:11,outline:"none",width:"100%",fontFamily:"inherit",boxSizing:"border-box"};
const FLD_TA = {...FLD_S,resize:"vertical",lineHeight:1.5};
const STAT_OPTS = ["Not Submitted","In Review","Submitted","Re-Submitted","Rejected","Approved","Complete","Blocked","On Hold","Pending","TBD"];
const PRI_OPTS = ["Critical","High","Medium","Low"];

function JobEditPanel({j, onSave, onCancel}){
  const[d,setD]=useState({...j});
  const f=(k,v)=>setD(p=>({...p,[k]:v}));
  const lbl=(t)=><div style={{fontSize:9,fontWeight:700,color:C.t3,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{t}</div>;
  const inp=(k,placeholder)=><input value={d[k]||""} onChange={e=>f(k,e.target.value)} placeholder={placeholder||k} style={FLD_S}/>;
  const sel=(k,opts)=><select value={d[k]||""} onChange={e=>f(k,e.target.value)} style={FLD_S}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
  const ta=(k,rows=2)=><textarea value={d[k]||""} onChange={e=>f(k,e.target.value)} rows={rows} style={FLD_TA}/>;

  return(
    <div style={{background:"#0A1520",border:`1px solid ${C.blue}40`,borderRadius:9,padding:"18px 20px",margin:"0 0 0 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.blue}}>✏ Editing: {j.w}</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{padding:"5px 14px",borderRadius:5,border:`1px solid ${C.b2}`,background:"transparent",color:C.t2,fontSize:11,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>onSave(d)} style={{padding:"5px 16px",borderRadius:5,border:"none",background:C.blue,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Save Changes</button>
        </div>
      </div>

      {/* Row 1 — identity */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
        <div>{lbl("WO-ID")}{inp("w","WO-ID")}</div>
        <div>{lbl("City / Area")}{inp("city","City")}</div>
        <div>{lbl("Agency")}{inp("ag","Agency")}</div>
        <div>{lbl("Permit #")}{inp("p","Permit #")}</div>
      </div>

      {/* Row 2 — status */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
        <div>{lbl("Priority")}{sel("pri",PRI_OPTS)}</div>
        <div>{lbl("Permit Status")}{sel("sp",STAT_OPTS)}</div>
        <div>{lbl("QC Status")}{sel("sq",STAT_OPTS)}</div>
        <div>{lbl("Construction")}{sel("sc",STAT_OPTS)}</div>
        <div>{lbl("Hot 🔥")}<select value={d.hot?1:0} onChange={e=>f("hot",Number(e.target.value))} style={FLD_S}><option value={1}>Yes</option><option value={0}>No</option></select></div>
      </div>

      {/* Row 3 — people + dates */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
        <div>{lbl("Owner")}{inp("own","Owner")}</div>
        <div>{lbl("ECD (YYYY-MM-DD)")}{inp("ecd","2026-04-15")}</div>
        <div>{lbl("Last Update")}{inp("lu","2026-03-30")}</div>
      </div>

      {/* Row 4 — text fields */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <div>{lbl("Blocker")}{ta("blk",2)}</div>
        <div>{lbl("Next Action")}{ta("nxt",2)}</div>
      </div>
      <div style={{marginBottom:4}}>{lbl("Notes")}{ta("note",3)}</div>

      {/* Audit trail (read-only) */}
      {j.hist?.length>0&&(
        <div style={{marginTop:14,borderTop:`1px solid ${C.b}`,paddingTop:10}}>
          <div style={{fontSize:8,color:C.t3,textTransform:"uppercase",marginBottom:6}}>Audit Trail</div>
          {j.hist.slice(-5).map((h,i)=>(
            <div key={i} style={{fontSize:9,color:C.t2,marginBottom:3,paddingLeft:8,borderLeft:`2px solid ${C.green}30`}}>
              {h.date} · {h.field} → <span style={{color:C.green}}>{h.to}</span> <span style={{color:C.t3}}>({h.src})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobsView({jobs, setJobs}){
  const[search,setSearch]=useState("");
  const[pri,setPri]=useState("All");
  const[exp,setExp]=useState(null);
  const[editing,setEditing]=useState(null); // job id being edited

  const shown=jobs
    .filter(j=>(pri==="All"||j.pri===pri)&&(!search||j.w.toLowerCase().includes(search.toLowerCase())||j.own?.toLowerCase().includes(search.toLowerCase())||j.city?.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b)=>({Critical:0,High:1,Medium:2,Low:3}[a.pri]||4)-({Critical:0,High:1,Medium:2,Low:3}[b.pri]||4));

  const handleSave=(updated)=>{
    setJobs(jobs.map(j=>j.id===updated.id
      ? {...updated, lu:"2026-03-30", hist:[...(j.hist||[]),{date:"2026-03-30",field:"manual edit",from:"",to:"updated",src:"Manual edit"}]}
      : j
    ));
    setEditing(null);
  };

  return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:18}}><div style={{fontSize:18,fontWeight:800,color:C.t}}>Jobs Tracker</div><div style={{fontSize:11,color:C.t2,marginTop:2}}>{shown.length}/{jobs.length}</div></div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search WO-ID, city, owner…" style={{flex:1,minWidth:180,background:C.card,border:`1px solid ${C.b}`,borderRadius:6,padding:"7px 12px",color:C.t,fontSize:11,outline:"none",fontFamily:"inherit"}}/>
        {["All","Critical","High","Medium","Low"].map(p=><button key={p} onClick={()=>setPri(p)} style={{padding:"5px 11px",borderRadius:5,border:`1px solid ${pri===p?(PMAP[p]?.[0]||C.blue):C.b}`,background:pri===p?(PMAP[p]?.[1]||C.bBg):"transparent",color:pri===p?(PMAP[p]?.[0]||C.blue):C.t2,fontSize:10,fontWeight:700,cursor:"pointer"}}>{p}</button>)}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"190px 76px 110px 1fr 130px 32px",padding:"9px 14px",borderBottom:`1px solid ${C.b}`,background:C.panel}}>
          {["WO-ID","Priority","Permit","Blocker / Next Action","Owner",""].map(h=><div key={h} style={{fontSize:9,fontWeight:700,color:C.t3,textTransform:"uppercase",letterSpacing:"0.1em"}}>{h}</div>)}
        </div>
        {shown.map((j,i)=>(
          <div key={j.id}>
            {/* Summary row */}
            <div style={{display:"grid",gridTemplateColumns:"190px 76px 110px 1fr 130px 32px",padding:"10px 14px",borderBottom:`1px solid ${C.b}`,background:exp===j.id||editing===j.id?C.cardH:i%2===0?C.card:C.panel,alignItems:"center"}}>
              <div onClick={()=>{setExp(exp===j.id?null:j.id);setEditing(null);}} style={{cursor:"pointer"}}>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>{j.hot?<span>🔥</span>:null}<span style={{fontSize:11,fontWeight:700,color:C.t,fontFamily:"monospace"}}>{j.w}</span></div>
                <div style={{fontSize:9,color:C.t2,marginTop:1}}>{j.city}</div>
              </div>
              <div onClick={()=>{setExp(exp===j.id?null:j.id);setEditing(null);}} style={{cursor:"pointer"}}><PBadge p={j.pri}/></div>
              <div onClick={()=>{setExp(exp===j.id?null:j.id);setEditing(null);}} style={{cursor:"pointer"}}><SBadge v={j.sp}/></div>
              <div onClick={()=>{setExp(exp===j.id?null:j.id);setEditing(null);}} style={{cursor:"pointer",fontSize:10,color:C.t2,lineHeight:1.4}}>{j.blk?.slice(0,60)}{j.blk?.length>60?"…":""}</div>
              <div onClick={()=>{setExp(exp===j.id?null:j.id);setEditing(null);}} style={{cursor:"pointer",fontSize:10,color:C.t2}}>{j.own}</div>
              {/* Edit pencil */}
              <div style={{display:"flex",justifyContent:"center"}}>
                <button
                  onClick={e=>{e.stopPropagation();setEditing(editing===j.id?null:j.id);setExp(null);}}
                  title="Edit this job"
                  style={{width:22,height:22,borderRadius:4,border:`1px solid ${editing===j.id?C.blue:C.b2}`,background:editing===j.id?C.blue+"30":"transparent",color:editing===j.id?C.blue:C.t3,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
                  ✏
                </button>
              </div>
            </div>

            {/* Read-only expand panel */}
            {exp===j.id&&editing!==j.id&&(
              <div style={{background:C.panel,borderBottom:`1px solid ${C.b}`,padding:"14px 18px"}}>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
                  <button onClick={()=>{setEditing(j.id);setExp(null);}} style={{padding:"4px 14px",borderRadius:5,border:`1px solid ${C.blue}40`,background:C.blue+"18",color:C.blue,fontSize:10,fontWeight:700,cursor:"pointer"}}>✏ Edit this job</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div>
                    <Row l="Agency" v={j.ag}/><Row l="ECD" v={j.ecd||"—"}/><Row l="Permit #" v={j.p||"—"}/><Row l="Last Update" v={j.lu}/>
                    {j.hist?.length>0&&<><div style={{fontSize:8,color:C.t3,textTransform:"uppercase",marginTop:8,marginBottom:4}}>Audit Trail</div>{j.hist.slice(-4).map((h,idx)=><div key={idx} style={{fontSize:9,color:C.t2,marginBottom:2,paddingLeft:7,borderLeft:`2px solid ${C.green}40`}}>{h.date}: <span style={{color:C.green}}>{h.to}</span> <span style={{color:C.t3}}>({h.src})</span></div>)}</>}
                  </div>
                  <div>
                    <div style={{fontSize:8,color:C.t3,textTransform:"uppercase",marginBottom:4}}>Next Action</div>
                    <div style={{fontSize:11,color:C.gold,marginBottom:10,lineHeight:1.5}}>{j.nxt}</div>
                    <div style={{fontSize:8,color:C.t3,textTransform:"uppercase",marginBottom:4}}>Notes</div>
                    <div style={{fontSize:11,color:C.t2,lineHeight:1.5}}>{j.note}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Inline edit panel */}
            {editing===j.id&&(
              <div style={{borderBottom:`1px solid ${C.b}`,padding:"12px 14px",background:C.panel}}>
                <JobEditPanel j={j} onSave={handleSave} onCancel={()=>setEditing(null)}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionsView({acts,setActs}){
  const[fst,setFst]=useState("Open");
  const shown=[...acts].filter(a=>fst==="All"||a.st===fst).sort((a,b)=>({Critical:0,High:1,Medium:2,Low:3}[a.pri]||4)-({Critical:0,High:1,Medium:2,Low:3}[b.pri]||4));
  return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:18}}><div style={{fontSize:18,fontWeight:800,color:C.t}}>Action Items</div><div style={{fontSize:11,color:C.t2,marginTop:2}}>{shown.length} shown</div></div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["All","Open","In Progress","Closed"].map(s=><button key={s} onClick={()=>setFst(s)} style={{padding:"5px 12px",borderRadius:5,border:`1px solid ${fst===s?C.blue:C.b}`,background:fst===s?C.bBg:"transparent",color:fst===s?C.blue:C.t2,fontSize:10,fontWeight:600,cursor:"pointer"}}>{s}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {shown.map(a=>{
          const od=isOD(a.due);
          return(
            <div key={a.id} style={{background:C.card,border:`1px solid ${od?C.red+"40":C.b}`,borderRadius:9,padding:"13px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><PBadge p={a.pri}/>{od&&<Pill label="OVERDUE" color={C.red}/>}{a.el>0&&<Pill label={"ESC L"+a.el} color={C.gold}/>}</div>
                <span style={{fontSize:10,color:od?C.red:C.t2,fontFamily:"monospace"}}>{a.due||"—"}</span>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:C.t,marginBottom:5}}>{a.t}</div>
              <div style={{fontSize:11,color:C.t2,marginBottom:8,lineHeight:1.5}}>{a.d}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <Pill label={"Owner: "+a.own} color={C.blue}/>
                {a.st==="Open"&&<Btn label="✓ Close" sm onClick={()=>setActs(p=>p.map(x=>x.id===a.id?{...x,st:"Closed"}:x))} color={C.green} outline/>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard({jobs,acts,hots,setView}){
  const crit=jobs.filter(j=>j.pri==="Critical").length;
  const rej=jobs.filter(j=>j.sp==="Rejected").length;
  const blk=jobs.filter(j=>j.sc==="Blocked").length;
  const od=acts.filter(a=>a.st==="Open"&&isOD(a.due)).length;
  const critActs=acts.filter(a=>a.pri==="Critical"&&a.st==="Open");
  const kpi=(label,val,col,click)=><div onClick={click} style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,padding:"14px 18px",cursor:click?"pointer":"default",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2,background:col}}/><div style={{fontSize:9,color:C.t2,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{label}</div><div style={{fontSize:28,fontWeight:800,color:col,fontFamily:"monospace"}}>{val}</div></div>;
  return(
    <div style={{padding:"28px 30px",overflowY:"auto",height:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:22}}>
        <div><div style={{fontSize:20,fontWeight:800,color:C.t}}>PM Dashboard</div><div style={{fontSize:11,color:C.t2,marginTop:2}}>Market 9/10 — Broward & Dade · MasTec/Byers × Tillman Fiber</div></div>
        <div style={{fontSize:10,color:C.t2,fontFamily:"monospace",background:C.card,padding:"6px 12px",borderRadius:6,border:`1px solid ${C.b}`,alignSelf:"flex-start"}}>30 MAR 2026</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
        {kpi("Total Jobs",jobs.length,C.blue,()=>setView("jobs"))}
        {kpi("Critical",crit,C.red,()=>setView("jobs"))}
        {kpi("Hot Topics",hots.length,C.gold,()=>setView("hots"))}
        {kpi("Overdue",od,od>0?C.red:C.green,()=>setView("actions"))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:22}}>
        {kpi("Permits Rejected",rej,C.red)}
        {kpi("Const Blocked",blk,C.amber)}
        {kpi("Waiting on DFT",jobs.filter(j=>j.blk?.toLowerCase().includes("dft")).length,C.blue)}
        {kpi("No Owner/ECD",jobs.filter(j=>j.own==="TBD"||!j.ecd).length,C.amber)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,padding:16}}>
          <div style={{fontSize:10,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Critical Actions ({critActs.length})</div>
          {critActs.slice(0,5).map(a=>(
            <div key={a.id} style={{borderBottom:`1px solid ${C.b}`,paddingBottom:9,marginBottom:9}}>
              <div style={{fontSize:11,fontWeight:700,color:C.t,marginBottom:3}}>{a.t}</div>
              <div style={{fontSize:10,color:C.t2,marginBottom:4,lineHeight:1.4}}>{a.d?.slice(0,70)}…</div>
              <div style={{display:"flex",gap:5}}><Pill label={a.own} color={C.t2}/><Pill label={isOD(a.due)?"OVERDUE: "+a.due:"Due "+a.due} color={isOD(a.due)?C.red:C.t3}/></div>
            </div>
          ))}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:9,padding:16}}>
          <div style={{fontSize:10,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>🔥 Hot Topics ({hots.length})</div>
          {hots.slice(0,5).map(h=>(
            <div key={h.id} style={{borderBottom:`1px solid ${C.b}`,paddingBottom:9,marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><div style={{fontSize:11,fontWeight:700,color:C.t}}>{h.sum}</div><Pill label={h.risk} color={h.risk==="Critical"?C.red:C.amber}/></div>
              <div style={{fontSize:10,color:C.t2}}>{h.nxt?.slice(0,70)}…</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Lucien({onClose}){
  const[msgs,setMsgs]=useState([{r:"a",c:"Lucien ready. Standards v6.2 + DTAP loaded. What do you need?"}]);
  const[inp,setInp]=useState("");
  const[loading,setLoading]=useState(false);
  const btm=useRef(null);
  useEffect(()=>{btm.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=async txt=>{
    const q=txt||inp.trim();if(!q||loading)return;
    const um={r:"u",c:q};setMsgs(p=>[...p,um]);setInp("");setLoading(true);
    try{
      const history=msgs.filter((_,i)=>i>0).concat(um).map(m=>({role:m.r==="u"?"user":"assistant",content:m.c}));
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:LSYS,messages:history})});
      const d=await res.json();
      setMsgs(p=>[...p,{r:"a",c:d.content?.find(b=>b.type==="text")?.text||"No response."}]);
    }catch{setMsgs(p=>[...p,{r:"a",c:"Connection error."}]);}
    setLoading(false);
  };
  const qps=["What do I owe today?","Summarize FX4-FSR-06","SFWMD bridge clearance?","DTAP max span?","Burial depth rule?","FDH sizing?"];
  return(
    <div style={{width:360,flexShrink:0,display:"flex",flexDirection:"column",height:"100%",background:"linear-gradient(135deg,#1A0A2E,#0B1018)",borderLeft:`1px solid ${C.b}`}}>
      <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.b}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:"rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.violet},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>L</div><div><div style={{fontSize:12,fontWeight:700,color:C.t}}>Lucien</div><div style={{fontSize:9,color:C.t2,textTransform:"uppercase",letterSpacing:"0.08em"}}>OSP Advisor · v6.2 + DTAP</div></div></div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.t2,cursor:"pointer",fontSize:15}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",gap:6}}>
            {m.r==="a"&&<div style={{width:19,height:19,borderRadius:"50%",background:`linear-gradient(135deg,${C.violet},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0,marginTop:2}}>L</div>}
            <div style={{maxWidth:"85%",background:m.r==="u"?`${C.blue}22`:C.card,border:`1px solid ${m.r==="u"?C.blue+"40":C.b}`,borderRadius:m.r==="u"?"9px 9px 2px 9px":"9px 9px 9px 2px",padding:"8px 11px",fontSize:11,color:C.t,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.c}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:6}}><div style={{width:19,height:19,borderRadius:"50%",background:`linear-gradient(135deg,${C.violet},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff"}}>L</div><div style={{background:C.card,border:`1px solid ${C.b}`,borderRadius:"9px 9px 9px 2px",padding:"8px 11px",color:C.t2,fontSize:11}}>Thinking…</div></div>}
        <div ref={btm}/>
      </div>
      <div style={{padding:"7px 10px",borderTop:`1px solid ${C.b}`,display:"flex",flexWrap:"wrap",gap:4,maxHeight:72,overflowY:"auto"}}>
        {qps.map(q=><button key={q} onClick={()=>send(q)} style={{fontSize:9,padding:"3px 7px",borderRadius:4,border:`1px solid ${C.b2}`,background:C.card,color:C.t2,cursor:"pointer"}}>{q}</button>)}
      </div>
      <div style={{padding:"9px 10px",borderTop:`1px solid ${C.b}`,display:"flex",gap:7,flexShrink:0}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about standards, jobs…" style={{flex:1,background:C.card,border:`1px solid ${C.b2}`,borderRadius:6,padding:"7px 11px",color:C.t,fontSize:11,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={()=>send()} disabled={loading} style={{padding:"7px 12px",borderRadius:6,background:loading?C.b:C.violet,border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:loading?"not-allowed":"pointer"}}>→</button>
      </div>
    </div>
  );
}

// ─── SCREENSHOT INTEL ────────────────────────────────────────────────────────
const NAV=[
  {id:"dash",lbl:"Dashboard",ico:"◈"},
  {id:"jobs",lbl:"Jobs",ico:"⊞"},
  {id:"hots",lbl:"Hot Topics",ico:"◉"},
  {id:"actions",lbl:"Actions",ico:"◎"},
  {id:"email",lbl:"Email Intel",ico:"✉",hi:true},
  {id:"screenshots",lbl:"Screenshots",ico:"📸",hi:true},
];
const withTO = (p, ms=1200) =>
  Promise.race([p, new Promise((_,rej)=>setTimeout(()=>rej('timeout'),ms))]);

const save = (key, data) => {
  const v = JSON.stringify(data);
  (async()=>{ try { if(window.storage) await withTO(window.storage.set(key,v)); } catch {} })();
};
const loadOne = async key => {
  try { if(window.storage){ const r=await withTO(window.storage.get(key)); if(r?.value) return JSON.parse(r.value); } } catch {}
  return null;
};
const clearAll = async () => {
  for(const k of ["t_jobs","t_acts","t_hots"])
    try { if(window.storage) await withTO(window.storage.delete(k)); } catch {}
};

export default function App(){
  const[view,setView]=useState("dash");
  const[jobs,setJobs]=useState(JOBS0);
  const[hots,setHots]=useState(HOTS0);
  const[acts,setActs]=useState(ACTS0);
  const[showL,setShowL]=useState(false);
  const[saved,setSaved]=useState(false);
  const[confirmReset,setConfirmReset]=useState(false);
  const canSave=useRef(false);

  // On mount: render immediately with defaults, then silently hydrate from storage
  useEffect(()=>{
    let live=true;
    (async()=>{
      try {
        const[j,a,h]=await Promise.all([loadOne("t_jobs"),loadOne("t_acts"),loadOne("t_hots")]);
        if(!live) return;
        if(j) setJobs(j);
        if(a) setActs(a);
        if(h) setHots(h);
      } catch {}
      if(live) canSave.current=true;
    })();
    // Safety net: enable saving after 2s even if storage calls stall
    const t=setTimeout(()=>{ canSave.current=true; },2000);
    return ()=>{ live=false; clearTimeout(t); };
  },[]);

  const flash=()=>{ setSaved(true); setTimeout(()=>setSaved(false),1800); };
  useEffect(()=>{ if(!canSave.current) return; save("t_jobs",jobs); flash(); },[jobs]);
  useEffect(()=>{ if(!canSave.current) return; save("t_acts",acts); },[acts]);
  useEffect(()=>{ if(!canSave.current) return; save("t_hots",hots); },[hots]);

  const handleReset=async()=>{
    canSave.current=false;
    await clearAll();
    setJobs(JOBS0); setActs(ACTS0); setHots(HOTS0);
    setConfirmReset(false);
    setTimeout(()=>{ canSave.current=true; },200);
  };

  const od=acts.filter(a=>a.st==="Open"&&isOD(a.due)).length;

  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"'Sora','Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:#1A2A3F;border-radius:2px;}input,select,textarea,button{font-family:inherit;}`}</style>

      {confirmReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
          <div style={{background:C.panel,border:`1px solid ${C.b2}`,borderRadius:10,padding:28,width:360,textAlign:"center"}}>
            <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:10}}>Reset All Data?</div>
            <div style={{fontSize:12,color:C.t2,marginBottom:20,lineHeight:1.5}}>Restores original seed data. Cannot be undone.</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setConfirmReset(false)} style={{padding:"8px 20px",borderRadius:6,border:`1px solid ${C.b2}`,background:"transparent",color:C.t2,fontSize:12,cursor:"pointer"}}>Cancel</button>
              <button onClick={handleReset} style={{padding:"8px 20px",borderRadius:6,border:"none",background:C.red,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Reset to Defaults</button>
            </div>
          </div>
        </div>
      )}

      <div style={{width:192,background:C.panel,borderRight:`1px solid ${C.b}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${C.b}`}}>
          <div style={{fontSize:11,fontWeight:800,color:C.t,letterSpacing:"0.05em",textTransform:"uppercase"}}>Tillman OSP</div>
          <div style={{fontSize:8,color:C.t3,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2}}>PM Tracker · Mkt 9/10</div>
          <div style={{marginTop:8,display:"flex",gap:4,flexWrap:"wrap"}}>
            {jobs.filter(j=>j.pri==="Critical").length>0&&<Pill label={jobs.filter(j=>j.pri==="Critical").length+" CRIT"} color={C.red}/>}
            {od>0&&<Pill label={od+" OD"} color={C.amber}/>}
          </div>
          <div style={{marginTop:6,fontSize:9,color:saved?C.green:C.t3,transition:"color 0.4s",height:12}}>{saved?"✓ Saved":""}</div>
        </div>
        <div style={{flex:1,padding:"8px 7px"}}>
          {NAV.map(n=>{
            const ac=view===n.id;
            const badge=n.id==="hots"?hots.filter(h=>h.st!=="Closed").length:n.id==="actions"?od:0;
            return(
              <button key={n.id} onClick={()=>setView(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:6,border:"none",background:ac?(n.hi?`${C.cyan}15`:`${C.blue}15`):"transparent",color:ac?(n.hi?C.cyan:C.blue):C.t2,fontSize:11,fontWeight:ac?700:500,cursor:"pointer",marginBottom:2,textAlign:"left",borderLeft:`2px solid ${ac?(n.hi?C.cyan:C.blue):"transparent"}`}}>
                <span style={{fontSize:12,width:14,textAlign:"center"}}>{n.ico}</span>
                <span style={{flex:1}}>{n.lbl}</span>
                {badge>0&&<span style={{fontSize:9,fontWeight:700,background:n.id==="hots"?C.aBg:C.rBg,color:n.id==="hots"?C.gold:C.red,padding:"1px 5px",borderRadius:9}}>{badge}</span>}
                {n.hi&&<span style={{fontSize:7,fontWeight:700,background:`${C.cyan}20`,color:C.cyan,padding:"1px 4px",borderRadius:3}}>NEW</span>}
              </button>
            );
          })}
        </div>
        <div style={{padding:"10px 7px",borderTop:`1px solid ${C.b}`,display:"flex",flexDirection:"column",gap:6}}>
          <button onClick={()=>setShowL(!showL)} style={{width:"100%",padding:"7px 10px",borderRadius:6,border:`1px solid ${showL?C.violet+"60":C.b2}`,background:showL?`${C.violet}18`:C.card,color:showL?C.violet:C.t2,fontSize:10,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
            <span style={{width:13,height:13,borderRadius:"50%",background:showL?`linear-gradient(135deg,${C.violet},${C.blue})`:C.b,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#fff",fontWeight:800}}>L</span>
            Lucien — Advisor
          </button>
          <button onClick={()=>setConfirmReset(true)} style={{width:"100%",padding:"5px 10px",borderRadius:6,border:`1px solid ${C.b}`,background:"transparent",color:C.t3,fontSize:9,cursor:"pointer",textAlign:"left"}}>↺ Reset to defaults</button>
        </div>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,overflow:"hidden"}}>
          {view==="dash"&&<Dashboard jobs={jobs} acts={acts} hots={hots} setView={setView}/>}
          {view==="jobs"&&<JobsView jobs={jobs} setJobs={setJobs}/>}
          {view==="hots"&&<HotsView hots={hots} setHots={setHots}/>}
          {view==="actions"&&<ActionsView acts={acts} setActs={setActs}/>}
          {view==="email"&&<EmailIntel jobs={jobs} setJobs={setJobs} acts={acts} setActs={setActs}/>}
          {view==="screenshots"&&<ScreenshotIntel jobs={jobs} setJobs={setJobs} acts={acts} setActs={setActs}/>}
        </div>
        {showL&&<Lucien onClose={()=>setShowL(false)}/>}
      </div>
    </div>
  );
}
