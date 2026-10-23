"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Check, ChevronDown, Circle, Clock3, Plus, Search, UserRound, X } from "lucide-react";

type DeliverableStatus = "Not Started" | "In Progress" | "In Review" | "Approved" | "Blocked";
type Deliverable = {
  id: number;
  phase: number;
  name: string;
  owner: string;
  due: string;
  status: DeliverableStatus;
  mandatory: boolean;
};

const initialDeliverables: Deliverable[] = [
  { id: 1, phase: 1, name: "Voice of Customer / customer requirements", owner: "Program Manager", due: "2026-10-27", status: "Approved", mandatory: true },
  { id: 2, phase: 1, name: "Preliminary bill of materials", owner: "Product Engineering", due: "2026-10-29", status: "Approved", mandatory: true },
  { id: 3, phase: 1, name: "Manufacturing feasibility review", owner: "Manufacturing Engineering", due: "2026-10-30", status: "In Review", mandatory: true },
  { id: 4, phase: 2, name: "Design FMEA (DFMEA)", owner: "Product Engineering", due: "2026-11-02", status: "In Progress", mandatory: true },
  { id: 5, phase: 2, name: "Engineering drawings and specifications", owner: "Product Engineering", due: "2026-11-04", status: "In Progress", mandatory: true },
  { id: 6, phase: 2, name: "Design verification plan and report", owner: "Validation Team", due: "2026-11-06", status: "Not Started", mandatory: true },
  { id: 7, phase: 3, name: "Process flow diagram", owner: "Process Engineering", due: "2026-11-07", status: "In Progress", mandatory: true },
  { id: 8, phase: 3, name: "Process FMEA (PFMEA)", owner: "Quality Engineering", due: "2026-11-10", status: "In Review", mandatory: true },
  { id: 9, phase: 3, name: "Pre-launch Control Plan", owner: "Quality Engineering", due: "2026-11-12", status: "Not Started", mandatory: true },
  { id: 10, phase: 3, name: "Work instructions and operator training", owner: "Production", due: "2026-11-13", status: "Not Started", mandatory: false },
  { id: 11, phase: 4, name: "Measurement system analysis (MSA)", owner: "Metrology", due: "2026-11-16", status: "Not Started", mandatory: true },
  { id: 12, phase: 4, name: "Initial process capability study (SPC)", owner: "Quality Engineering", due: "2026-11-18", status: "Not Started", mandatory: true },
  { id: 13, phase: 4, name: "Dimensional and material test results", owner: "Laboratory", due: "2026-11-20", status: "Not Started", mandatory: true },
  { id: 14, phase: 4, name: "PPAP submission package", owner: "APQP Lead", due: "2026-11-23", status: "Not Started", mandatory: true },
  { id: 15, phase: 5, name: "Production trial / significant production run", owner: "Production", due: "2026-11-25", status: "Not Started", mandatory: true },
  { id: 16, phase: 5, name: "Lessons learned and handover", owner: "APQP Lead", due: "2026-11-30", status: "Not Started", mandatory: false }
];

const phases = [
  { id: 1, name: "Planning & Program Definition", short: "Planning" },
  { id: 2, name: "Product Design & Development", short: "Product Design" },
  { id: 3, name: "Process Design & Development", short: "Process Design" },
  { id: 4, name: "Product & Process Validation", short: "Validation" },
  { id: 5, name: "Launch, Assessment & Improvement", short: "Launch" }
];

const statusOptions: DeliverableStatus[] = ["Not Started", "In Progress", "In Review", "Approved", "Blocked"];
const statusColors: Record<DeliverableStatus, string> = {
  "Not Started": "gray", "In Progress": "blue", "In Review": "amber", "Approved": "green", "Blocked": "red"
};

export default function PhasePlanning() {
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showAdd, setShowAdd] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftOwner, setDraftOwner] = useState("Quality Engineering");
  const [draftDue, setDraftDue] = useState("2026-11-30");
  const [draftMandatory, setDraftMandatory] = useState(true);
  const [message, setMessage] = useState("");

  const phaseRows = useMemo(() => deliverables.filter(d => d.phase === selectedPhase), [deliverables, selectedPhase]);
  const visibleRows = phaseRows.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === "All statuses" || d.status === statusFilter)
  );
  const allCount = phaseRows.length;
  const approvedCount = phaseRows.filter(d => d.status === "Approved").length;
  const inProgressCount = phaseRows.filter(d => d.status === "In Progress" || d.status === "In Review").length;
  const blockedCount = phaseRows.filter(d => d.status === "Blocked").length;
  const percent = allCount ? Math.round(approvedCount / allCount * 100) : 0;

  function updateStatus(id: number, status: DeliverableStatus) {
    setDeliverables(current => current.map(d => d.id === id ? { ...d, status } : d));
  }

  function addDeliverable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Deliverable = {
      id: Math.max(0, ...deliverables.map(d => d.id)) + 1,
      phase: selectedPhase,
      name: draftName.trim(),
      owner: draftOwner,
      due: draftDue,
      status: "Not Started",
      mandatory: draftMandatory
    };
    setDeliverables(current => [...current, next]);
    setShowAdd(false);
    setDraftName("");
    setMessage("Deliverable added to this demo plan. It will reset on refresh until database persistence is implemented.");
    window.setTimeout(() => setMessage(""), 5000);
  }

  return (
    <section>
      <div className="phase-workspace-head">
        <div>
          <div className="eyebrow">APQP PROJECT PLAN · DEMO PROJECT APQP-026</div>
          <h2 className="panel-title" style={{fontSize:19}}>Phase Planning & Deliverables</h2>
          <p className="subtitle">Assign owners, track due dates, and update deliverable review status across the APQP lifecycle.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15}/> Add deliverable</button>
      </div>

      <div className="phase-cards">
        {phases.map(phase => {
          const rows = deliverables.filter(d => d.phase === phase.id);
          const approved = rows.filter(d => d.status === "Approved").length;
          const ratio = rows.length ? Math.round(approved / rows.length * 100) : 0;
          return <button key={phase.id} className={`phase-card ${selectedPhase === phase.id ? "selected" : ""}`} onClick={() => setSelectedPhase(phase.id)}>
            <div className="phase-card-top"><span>PHASE 0{phase.id}</span><span>{ratio}%</span></div>
            <div className="phase-card-name">{phase.name}</div>
            <div className="progress"><span style={{width: `${ratio}%`}}/></div>
            <div className="phase-card-foot">{approved} of {rows.length} approved</div>
          </button>;
        })}
      </div>

      <div className="phase-metrics">
        <div className="phase-metric"><span>Total deliverables</span><strong>{allCount}</strong></div>
        <div className="phase-metric"><span>Approved</span><strong style={{color:"#15836b"}}>{approvedCount}</strong></div>
        <div className="phase-metric"><span>In progress / review</span><strong style={{color:"#3268e8"}}>{inProgressCount}</strong></div>
        <div className="phase-metric"><span>Blocked</span><strong style={{color:blockedCount ? "#c34850" : "inherit"}}>{blockedCount}</strong></div>
      </div>

      <section className="panel phase-deliverables-panel">
        <div className="panel-header">
          <div><div className="panel-title">{phases.find(p => p.id === selectedPhase)?.name}</div><div className="panel-subtitle">Deliverable status is editable in this demo. Formal approvals and evidence links are not enabled yet.</div></div>
          <span className="status blue">{percent}% approved</span>
        </div>
        <div className="phase-table-toolbar">
          <div className="phase-search"><Search size={15}/><input aria-label="Search deliverables" placeholder="Search deliverables..." value={search} onChange={e => setSearch(e.target.value)}/></div>
          <select className="phase-select" aria-label="Filter deliverable status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All statuses</option>{statusOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Deliverable</th><th>Owner</th><th>Due date</th><th>Requirement</th><th>Status</th></tr></thead>
            <tbody>
              {visibleRows.map(row => <tr key={row.id}>
                <td><div className="deliverable-name">{row.name}</div><div className="deliverable-sub">APQP-{String(row.id).padStart(3,"0")}</div></td>
                <td><span className="owner-inline"><UserRound size={13}/>{row.owner}</span></td>
                <td><span className="owner-inline"><CalendarDays size={13}/>{new Date(row.due + "T12:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span></td>
                <td><span className={`status ${row.mandatory ? "amber" : "gray"}`}>{row.mandatory ? "Required" : "Optional"}</span></td>
                <td><select aria-label={`Status for ${row.name}`} className={`deliverable-status ${statusColors[row.status]}`} value={row.status} onChange={e => updateStatus(row.id, e.target.value as DeliverableStatus)}>{statusOptions.map(s => <option key={s}>{s}</option>)}</select></td>
              </tr>)}
              {!visibleRows.length && <tr><td colSpan={5}><div className="empty-state">No deliverables match these filters.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <p className="footer-note"><Clock3 size={14}/> This is an interactive UI milestone using illustrative data. Changes are not persisted and do not represent formal quality approvals.</p>

      {message && <div role="status" className="toast" style={{maxWidth:420,lineHeight:1.6}}>{message}</div>}
      {showAdd && <div className="modal-backdrop" onMouseDown={e => {if(e.target===e.currentTarget)setShowAdd(false);}}>
        <form className="modal" onSubmit={addDeliverable}>
          <div className="modal-head"><div><h2>Add phase deliverable</h2><p>Phase {selectedPhase}: {phases[selectedPhase-1].name}</p></div><button type="button" className="icon-btn" aria-label="Close" onClick={() => setShowAdd(false)}><X size={16}/></button></div>
          <div className="modal-body">
            <label className="field full">Deliverable name<input required minLength={3} maxLength={160} value={draftName} onChange={e => setDraftName(e.target.value)} placeholder="Enter deliverable or milestone"/></label>
            <label className="field full">Responsible owner<select value={draftOwner} onChange={e => setDraftOwner(e.target.value)}><option>Quality Engineering</option><option>Product Engineering</option><option>Process Engineering</option><option>Manufacturing Engineering</option><option>Validation Team</option><option>Production</option><option>APQP Lead</option><option>Program Manager</option></select></label>
            <label className="field full">Due date<input type="date" required value={draftDue} onChange={e => setDraftDue(e.target.value)}/></label>
            <label className="field full" style={{display:"flex",flexDirection:"row",alignItems:"center"}}><input type="checkbox" checked={draftMandatory} onChange={e => setDraftMandatory(e.target.checked)} style={{width:15}}/> Required deliverable for this project</label>
          </div>
          <div className="modal-foot"><button className="btn" type="button" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" type="submit"><Plus size={14}/>Add deliverable</button></div>
        </form>
      </div>}
    </section>
  );
}
