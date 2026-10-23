"use client";

import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  CalendarDays, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck,
  Clock3, Download, FileCheck2, FileText, Filter, FolderKanban, Gauge,
  LayoutDashboard, Menu, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal,
  Sparkles, Target, Users, X
} from "lucide-react";
import { FormEvent, useMemo, useState, type ReactNode } from "react";

type ProjectStatus = "On Track" | "At Risk" | "Delayed" | "Completed";
type Project = {
  id: string; code: string; name: string; customer: string; owner: string;
  initials: string; phase: string; progress: number; due: string;
  status: ProjectStatus; plant: string;
};
type ActionItem = { id: number; title: string; project: string; due: string; overdue: boolean; done: boolean };

const initialProjects: Project[] = [
  { id:"P-2601", code:"APQP-026", name:"Front Fork Dust Seal", customer:"Orion Mobility", owner:"Aarav Shah", initials:"AS", phase:"Process Design", progress:68, due:"12 Nov 2026", status:"On Track", plant:"Plant 1" },
  { id:"P-2602", code:"APQP-025", name:"Battery Cover Gasket", customer:"VoltEdge Motors", owner:"Neha Kulkarni", initials:"NK", phase:"Product Design", progress:42, due:"06 Nov 2026", status:"At Risk", plant:"Plant 2" },
  { id:"P-2603", code:"APQP-024", name:"Suspension Bush Set", customer:"Apex Auto", owner:"Rohan Patil", initials:"RP", phase:"Product Validation", progress:84, due:"30 Oct 2026", status:"Delayed", plant:"Plant 1" },
  { id:"P-2604", code:"APQP-023", name:"Silicone Housing Seal", customer:"Nova Components", owner:"Priya Joshi", initials:"PJ", phase:"Launch", progress:96, due:"24 Oct 2026", status:"On Track", plant:"Plant 3" },
  { id:"P-2605", code:"APQP-022", name:"EV Cable Grommet", customer:"VoltEdge Motors", owner:"Aarav Shah", initials:"AS", phase:"Planning", progress:24, due:"20 Nov 2026", status:"On Track", plant:"Plant 2" }
];

const phaseData = [
  { id:1, name:"Planning & Program Definition", sub:"Phase 1 · 12 deliverables", percent:100, color:"#18866d" },
  { id:2, name:"Product Design & Development", sub:"Phase 2 · 18 deliverables", percent:78, color:"#3268e8" },
  { id:3, name:"Process Design & Development", sub:"Phase 3 · 16 deliverables", percent:56, color:"#3268e8" },
  { id:4, name:"Product & Process Validation", sub:"Phase 4 · 14 deliverables", percent:31, color:"#d79a38" },
  { id:5, name:"Launch, Assessment & Improvement", sub:"Phase 5 · 9 deliverables", percent:12, color:"#a5b1c4" }
];

const initialActions: ActionItem[] = [
  { id:1, title:"Approve PFMEA revision 02", project:"Front Fork Dust Seal", due:"Today", overdue:false, done:false },
  { id:2, title:"Complete measurement system study", project:"Suspension Bush Set", due:"1 day overdue", overdue:true, done:false },
  { id:3, title:"Upload dimensional inspection report", project:"Silicone Housing Seal", due:"Tomorrow", overdue:false, done:false },
  { id:4, title:"Confirm customer feasibility review", project:"Battery Cover Gasket", due:"27 Oct", overdue:false, done:true }
];

const navItems = [
  { name:"Overview", icon:LayoutDashboard },
  { name:"APQP Projects", icon:FolderKanban },
  { name:"Phase Planning", icon:CalendarDays },
  { name:"Quality Tools", icon:ClipboardCheck },
  { name:"Documents", icon:FileText },
  { name:"PPAP Management", icon:FileCheck2 },
  { name:"Reports & Analytics", icon:Gauge }
];

const statusClass: Record<ProjectStatus, string> = {
  "On Track":"green", "At Risk":"amber", "Delayed":"red", "Completed":"blue"
};
const currencylessDate = new Intl.DateTimeFormat("en-IN", { day:"2-digit", month:"short", year:"numeric" });

export default function Home() {
  const [projects, setProjects] = useState(initialProjects);
  const [actions, setActions] = useState(initialActions);
  const [activeNav, setActiveNav] = useState("Overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [plantFilter, setPlantFilter] = useState("All plants");
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newPlant, setNewPlant] = useState("Plant 1");
  const [newOwner, setNewOwner] = useState("Quality Engineering");
  const [newDue, setNewDue] = useState("2026-11-20");

  const filtered = useMemo(() => projects.filter((p) => {
    const matchSearch = [p.name,p.customer,p.code,p.owner,p.id].some((v) => v.toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (statusFilter === "All statuses" || p.status === statusFilter) && (plantFilter === "All plants" || p.plant === plantFilter);
  }), [projects, search, statusFilter, plantFilter]);

  const overdueActions = actions.filter(a => a.overdue && !a.done).length;
  const activeProjects = projects.filter(p => p.status !== "Completed").length;
  const atRisk = projects.filter(p => p.status === "At Risk" || p.status === "Delayed").length;
  const avgProgress = projects.length ? Math.round(projects.reduce((sum,p)=>sum+p.progress,0)/projects.length) : 0;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = `APQP-${String(26 + projects.length).padStart(3,"0")}`;
    const dueDate = new Date(`${newDue}T12:00:00`);
    const project: Project = {
      id: `P-${new Date().getFullYear()}-${String(projects.length + 1).padStart(2,"0")}`,
      code,
      name:newName.trim(),
      customer:newCustomer.trim(),
      owner:newOwner,
      initials:newOwner.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase(),
      phase:"Planning",
      progress:0,
      due:currencylessDate.format(dueDate),
      status:"On Track",
      plant:newPlant
    };
    setProjects(current => [project,...current]);
    setShowCreate(false);
    setNewName("");
    setNewCustomer("");
    setActiveNav("APQP Projects");
    notify("Project added to this demo dashboard.");
  }

  function toggleAction(id:number) {
    setActions(current => current.map(a => a.id === id ? {...a,done:!a.done} : a));
  }

  function exportCsv() {
    const header = ["Project ID","Project Code","Project Name","Customer","Owner","Plant","Phase","Progress %","Due Date","Status"];
    const rows = filtered.map(p => [p.id,p.code,p.name,p.customer,p.owner,p.plant,p.phase,p.progress,p.due,p.status]);
    const csv = [header,...rows].map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href=url;
    anchor.download="vibes-apqp-projects.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Project CSV exported.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" style={mobileNav ? {display:"flex",position:"fixed",inset:"0 auto 0 0",width:250,zIndex:15,boxShadow:"0 0 0 100vmax #0c193b77"} : undefined}>
        <div className="brand">
          <div className="brand-mark">V</div>
          <div><div className="brand-name">VIBES <span style={{fontWeight:500}}>APQP</span></div><div className="brand-caption">QUALITY MANAGEMENT</div></div>
        </div>
        <div>
          <div className="nav-label">WORKSPACE</div>
          <nav className="nav-list">
            {navItems.map(({name,icon:Icon}) => (
              <button key={name} className={`nav-item ${activeNav===name?"active":""}`} onClick={()=>{setActiveNav(name);setMobileNav(false);}}>
                <Icon size={17}/><span>{name}</span>{name==="APQP Projects" && <span style={{marginLeft:"auto",fontSize:10,color:"#9fb2d1"}}>{projects.length}</span>}
              </button>
            ))}
          </nav>
        </div>
        <div>
          <div className="nav-label">SYSTEM</div>
          <nav className="nav-list">
            <button className={`nav-item ${activeNav==="Settings"?"active":""}`} onClick={()=>setActiveNav("Settings")}><Settings2 size={17}/>Settings</button>
            <button className={`nav-item ${activeNav==="Help & Support"?"active":""}`} onClick={()=>setActiveNav("Help & Support")}><CircleHelp size={17}/>Help & Support</button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div style={{display:"flex",alignItems:"center",gap:8}}><Sparkles size={15} color="#90b4ff"/><strong>APQP workspace</strong></div>
            <p>Keep project deliverables, quality records and reviews aligned in one place.</p>
            <button onClick={()=>notify("Help centre will be configured in a future milestone.")}>Explore guide <ArrowRight size={12} style={{verticalAlign:"middle",marginLeft:5}}/></button>
          </div>
          <div style={{padding:"17px 10px 0",fontSize:10,color:"#8196b5"}}>Vibes Components · Demo workspace</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={()=>setMobileNav(v=>!v)}><Menu/></button>
            <span>Workspace</span><span>/</span><b>{activeNav}</b>
          </div>
          <div className="top-actions">
            <div style={{position:"relative"}}>
              <Search size={15} style={{position:"absolute",left:11,top:11,color:"#8594a8"}}/>
              <input className="search" aria-label="Search projects" placeholder="Search projects..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:34}}/>
            </div>
            <button className="icon-btn" aria-label="Notifications" onClick={()=>notify(`${overdueActions} overdue action(s) need attention.`)}><Bell/><span className="notification-dot"/></button>
            <div className="avatar" title="Demo user">VC</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ADVANCED PRODUCT QUALITY PLANNING</div>
              <h1>{activeNav === "Overview" ? "APQP Overview" : activeNav}</h1>
              <p className="subtitle">{activeNav === "Overview" ? "Your program health, phase readiness and key actions at a glance." : `Manage ${activeNav.toLowerCase()} in the Vibes APQP demo workspace.`}</p>
            </div>
            <div className="heading-actions">
              <button className="btn" onClick={exportCsv}><Download size={15}/>Export CSV</button>
              <button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Plus size={16}/>New APQP Project</button>
            </div>
          </div>

          {activeNav !== "Overview" && activeNav !== "APQP Projects" && (
            <div className="panel" style={{padding:25,marginBottom:20}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div className="kpi-icon" style={{background:"#edf3ff",color:"#3268e8"}}><Sparkles size={18}/></div>
                <div><div className="panel-title">{activeNav} module — planned workspace</div><p className="subtitle" style={{lineHeight:1.7,maxWidth:680}}>This module is represented in the product roadmap, but its full workflow is not implemented yet. The current working area below shows the shared project portfolio demo. Project changes are held in page state and reset when the page is refreshed.</p><button className="btn" onClick={()=>setActiveNav("Overview")} style={{marginTop:10}}>Return to overview <ArrowRight size={14}/></button></div>
              </div>
            </div>
          )}

          <div className="filter-row">
            <div className="filter-chip"><SlidersHorizontal size={13}/><strong>Filters</strong></div>
            <label className="filter-chip"><Filter size={13}/><select aria-label="Status filter" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{border:0,outline:0,background:"transparent",color:"#56677f",fontSize:11}}><option>All statuses</option><option>On Track</option><option>At Risk</option><option>Delayed</option><option>Completed</option></select></label>
            <label className="filter-chip"><Users size={13}/><select aria-label="Plant filter" value={plantFilter} onChange={e=>setPlantFilter(e.target.value)} style={{border:0,outline:0,background:"transparent",color:"#56677f",fontSize:11}}><option>All plants</option><option>Plant 1</option><option>Plant 2</option><option>Plant 3</option></select></label>
            <div style={{marginLeft:"auto",fontSize:10,color:"#8794a7"}}><Activity size={13} style={{verticalAlign:"middle",marginRight:5}}/>Data as of 23 Oct 2026</div>
          </div>

          <div className="kpi-grid">
            <Kpi label="Active APQP Projects" value={String(activeProjects)} detail="Across all plants" icon={<FolderKanban/>} color="#edf3ff" ink="#3268e8" trend="Portfolio" trendType="positive"/>
            <Kpi label="On-Time / On-Track" value={`${projects.length ? Math.round(projects.filter(p=>p.status==="On Track"||p.status==="Completed").length/projects.length*100) : 0}%`} detail="Project status indicator" icon={<Target/>} color="#e7f7f1" ink="#16836a" trend={`${projects.filter(p=>p.status==="On Track").length} on track`} trendType="positive"/>
            <Kpi label="At Risk / Delayed" value={String(atRisk)} detail="Need active monitoring" icon={<AlertCircle/>} color="#fff4df" ink="#c08323" trend={atRisk ? "Review needed" : "No flagged projects"} trendType={atRisk?"warning":"positive"}/>
            <Kpi label="Avg. Deliverable Progress" value={`${avgProgress}%`} detail="Illustrative portfolio average" icon={<Gauge/>} color="#f0ebff" ink="#7455ca" trend="Demo metric" trendType="positive"/>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-header">
                <div><div className="panel-title">APQP Phase Readiness</div><div className="panel-subtitle">Illustrative completion across the five APQP phases</div></div>
                <button className="text-link" onClick={()=>setActiveNav("Phase Planning")}>Phase details <ArrowRight size={12} style={{verticalAlign:"middle",marginLeft:4}}/></button>
              </div>
              <div className="phase-list">
                {phaseData.map((phase) => <div className="phase-row" key={phase.id}>
                  <div className="phase-number" style={phase.percent===100?{background:"#e7f7f1",color:"#15836b"}:undefined}>{phase.percent===100?<Check size={15}/>:String(phase.id).padStart(2,"0")}</div>
                  <div><div className="phase-name">{phase.name}</div><div className="phase-meta">{phase.sub}</div><div className="progress"><span style={{width:`${phase.percent}%`,background:phase.color}}/></div></div>
                  <div className="phase-percent">{phase.percent}%</div>
                </div>)}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div><div className="panel-title">Risk & Attention</div><div className="panel-subtitle">Items requiring project team review</div></div>
                <span className="status amber">{atRisk+overdueActions} items</span>
              </div>
              <div className="risk-list">
                {[
                  {title:"PFMEA review overdue",meta:"Suspension Bush Set · Quality",kind:"red",icon:AlertCircle},
                  {title:"Feasibility approval pending",meta:"Battery Cover Gasket · Customer",kind:"amber",icon:Clock3},
                  {title:"Validation milestone approaching",meta:"Silicone Housing Seal · Launch",kind:"blue",icon:CalendarDays}
                ].map((item,i)=><div className="risk-item" key={item.title}>
                  <div className="risk-symbol" style={{background:item.kind==="red"?"#ffedef":item.kind==="amber"?"#fff4df":"#edf3ff",color:item.kind==="red"?"#c34850":item.kind==="amber"?"#b7791f":"#3268e8"}}><item.icon/></div>
                  <div className="risk-copy"><div className="risk-title">{item.title}</div><div className="risk-meta">{item.meta}</div></div>
                  <span className={`status ${item.kind}`}>{i===0?"High":i===1?"Medium":"Watch"}</span>
                </div>)}
                <button className="btn" style={{width:"100%",marginTop:12}} onClick={()=>notify("Risk register is planned for a future milestone.")}>Open risk register <ArrowRight size={14}/></button>
              </div>
            </section>
          </div>

          <section className="panel projects-panel">
            <div className="panel-header">
              <div><div className="panel-title">Active APQP Projects</div><div className="panel-subtitle">{filtered.length} project(s) match the current search and filters</div></div>
              <button className="text-link" onClick={()=>{setActiveNav("APQP Projects");setStatusFilter("All statuses");setPlantFilter("All plants");setSearch("");}}>View all projects <ArrowRight size={12} style={{verticalAlign:"middle",marginLeft:4}}/></button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Project / Code</th><th>Customer</th><th>Project Owner</th><th>Current Phase</th><th>Progress</th><th>Target Date</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map(p=><tr key={p.id}>
                    <td><div className="project-name">{p.name}</div><div className="project-code">{p.code} · {p.id}</div></td>
                    <td><span className="customer-name">{p.customer}</span></td>
                    <td><div className="owner-cell"><div className="owner-mini">{p.initials}</div><span>{p.owner}</span></div></td>
                    <td>{p.phase}</td>
                    <td><div className="progress-cell"><div className="mini-progress"><span style={{width:`${p.progress}%`}}/></div><span className="progress-number">{p.progress}%</span></div></td>
                    <td style={{whiteSpace:"nowrap"}}>{p.due}</td>
                    <td><span className={`status ${statusClass[p.status]}`}>{p.status}</span></td>
                  </tr>)}
                  {!filtered.length && <tr><td colSpan={7}><div className="empty-state">No projects match the current filters. Try clearing your search or add a project.</div></td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <div className="bottom-grid">
            <section className="panel">
              <div className="panel-header"><div><div className="panel-title">My Action Items</div><div className="panel-subtitle">Illustrative tasks assigned to the project team</div></div><span className="status blue">{actions.filter(a=>!a.done).length} open</span></div>
              <div className="action-list">
                {actions.map(a=><div className="action-row" key={a.id}>
                  <button className={`action-check ${a.done?"done":""}`} aria-label={a.done?"Mark task incomplete":"Complete task"} onClick={()=>toggleAction(a.id)}>{a.done && <Check size={12}/>}</button>
                  <div className="action-copy"><div className="action-title" style={a.done?{color:"#8794a7",textDecoration:"line-through"}:undefined}>{a.title}</div><div className="action-sub">{a.project}</div></div>
                  <div className={`due ${a.overdue&&!a.done?"overdue":""}`}>{a.done?"Completed":a.due}</div>
                </div>)}
                <button className="text-link" style={{marginTop:8}} onClick={()=>notify("Action-item assignment and persistence will be added in the workflow milestone.")}>Manage all actions <ArrowRight size={12} style={{verticalAlign:"middle",marginLeft:4}}/></button>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header"><div><div className="panel-title">Portfolio by Plant</div><div className="panel-subtitle">Illustrative project distribution</div></div><button className="text-link" onClick={()=>setPlantFilter("All plants")}>Reset</button></div>
              <div className="distribution">
                {["Plant 1","Plant 2","Plant 3"].map((plant,i)=>{
                  const count=projects.filter(p=>p.plant===plant).length;
                  const pct=projects.length?Math.round(count/projects.length*100):0;
                  return <button key={plant} onClick={()=>setPlantFilter(plant)} style={{display:"contents"}}>
                    <div className="distribution-row"><span style={{fontWeight:plantFilter===plant?700:500,color:plantFilter===plant?"#3268e8":undefined}}>{plant}</span><div className="distribution-bar"><span style={{width:`${pct}%`,background:["#3268e8","#21a184","#8668d9"][i]}}/></div><span className="distribution-count">{count}</span></div>
                  </button>;
                })}
                <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid #eef2f7",display:"flex",gap:11,alignItems:"flex-start"}}>
                  <div className="kpi-icon" style={{background:"#eef8f5",color:"#16836a",width:31,height:31,flex:"none"}}><ShieldCheck size={16}/></div>
                  <div style={{fontSize:10,lineHeight:1.7,color:"#78869b"}}><strong style={{color:"#43546c"}}>Traceability focus</strong><br/>Link process flow, PFMEA, Control Plan and validation evidence before reporting gate readiness.</div>
                </div>
              </div>
            </section>
          </div>

          <div className="footer-note"><AlertCircle size={14}/> Demo interface with illustrative records only. No authentication, database persistence, or approved quality workflows are enabled yet.</div>
        </div>
      </main>

      {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false);}}>
        <form className="modal" onSubmit={createProject}>
          <div className="modal-head"><div><h2>Create APQP project</h2><p>Start a program record in this demo workspace.</p></div><button className="icon-btn" type="button" aria-label="Close" onClick={()=>setShowCreate(false)}><X size={16}/></button></div>
          <div className="modal-body">
            <label className="field full">Component / Project name<input required minLength={2} maxLength={100} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Rear shock absorber seal"/></label>
            <label className="field full">Customer name<input required minLength={2} maxLength={100} value={newCustomer} onChange={e=>setNewCustomer(e.target.value)} placeholder="Enter customer / OEM"/></label>
            <label className="field">Project owner<select value={newOwner} onChange={e=>setNewOwner(e.target.value)}><option>Quality Engineering</option><option>Aarav Shah</option><option>Neha Kulkarni</option><option>Rohan Patil</option><option>Priya Joshi</option></select></label>
            <label className="field">Plant<select value={newPlant} onChange={e=>setNewPlant(e.target.value)}><option>Plant 1</option><option>Plant 2</option><option>Plant 3</option></select></label>
            <label className="field full">Target date<input type="date" required min="2026-10-23" value={newDue} onChange={e=>setNewDue(e.target.value)}/></label>
          </div>
          <div className="modal-foot"><button className="btn" type="button" onClick={()=>setShowCreate(false)}>Cancel</button><button className="btn btn-primary" type="submit"><Plus size={14}/>Create project</button></div>
        </form>
      </div>}
      {toast && <div role="status" className="toast">{toast}</div>}
    </div>
  );
}

function Kpi({label,value,detail,icon,color,ink,trend,trendType}:{label:string;value:string;detail:string;icon:ReactNode;color:string;ink:string;trend:string;trendType:"positive"|"warning"|"negative"}) {
  return <div className="kpi-card">
    <div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon" style={{background:color,color:ink}}>{icon}</span></div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-bottom"><span className={`trend ${trendType}`}>{trendType==="positive"?<ArrowUpRight size={12}/>:trendType==="warning"?<ArrowDownRight size={12}/>:<ArrowDownRight size={12}/>} {trend}</span><span>· {detail}</span></div>
  </div>;
}
