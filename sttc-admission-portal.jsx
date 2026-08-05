import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, GraduationCap, ClipboardList, Search, Users, ShieldCheck, Upload,
  Check, X, Clock, ChevronRight, ChevronLeft, Plus, Trash2, LogOut, Phone,
  CreditCard, FileCheck, Menu, Copy, CheckCircle2, XCircle, Loader2,
  UserCircle2, ImagePlus, IdCard, Award, ArrowRight, MapPin
} from "lucide-react";

/* ---------------------------------------------------------------
   Static data
--------------------------------------------------------------- */
const FREE_COURSES = [
  { id: "f1", name: "ফ্রিল্যান্সিং ও আউটসোর্সিং", duration: "৩ মাস", seats: 30, desc: "অনলাইন মার্কেটপ্লেসে কাজ পাওয়ার কৌশল, প্রোফাইল তৈরি ও ক্লায়েন্ট যোগাযোগ।" },
  { id: "f2", name: "গ্রাফিক ডিজাইন", duration: "৩ মাস", seats: 25, desc: "ফটোশপ, ইলাস্ট্রেটর দিয়ে লোগো, পোস্টার ও ব্র্যান্ডিং ডিজাইন।" },
  { id: "f3", name: "ওয়েব ডিজাইন ও ডেভেলপমেন্ট", duration: "৪ মাস", seats: 25, desc: "HTML, CSS, জাভাস্ক্রিপ্ট দিয়ে সম্পূর্ণ ওয়েবসাইট তৈরি।" },
  { id: "f4", name: "মোবাইল সার্ভিসিং", duration: "২ মাস", seats: 20, desc: "স্মার্টফোন মেরামত, হার্ডওয়্যার ও সফটওয়্যার সমস্যা সমাধান।" },
];

const RPL_COURSES = [
  { id: "r1", name: "ইলেকট্রিক্যাল ওয়্যারিং", fee: 2000, desc: "ঘরোয়া ও শিল্প বৈদ্যুতিক ওয়্যারিং কাজের অভিজ্ঞতা সনদায়ন।" },
  { id: "r2", name: "ওয়েল্ডিং টেকনোলজি", fee: 2500, desc: "আর্ক ও গ্যাস ওয়েল্ডিং কাজের দক্ষতা যাচাই ও সনদায়ন।" },
  { id: "r3", name: "রেফ্রিজারেশন ও এসি টেকনিশিয়ান", fee: 3000, desc: "ফ্রিজ, এসি মেরামত কাজের বাস্তব অভিজ্ঞতার স্বীকৃতি।" },
  { id: "r4", name: "প্লাম্বিং ও পাইপ ফিটিং", fee: 2000, desc: "পানি ও গ্যাস লাইন স্থাপনের দক্ষতা সনদায়ন।" },
  { id: "r5", name: "সেলাই ও পোশাক তৈরি", fee: 1500, desc: "দর্জি কাজের অভিজ্ঞতাকে স্বীকৃত সনদে রূপান্তর।" },
];

const ALL_COURSES = [...FREE_COURSES.map(c => ({ ...c, type: "free" })), ...RPL_COURSES.map(c => ({ ...c, type: "rpl" }))];
const findCourse = (id) => ALL_COURSES.find(c => c.id === id);

const ADMIN_PASSWORD = "sttc2026";

const STATUS_META = {
  pending: { label: "পর্যালোচনাধীন", color: "var(--gold-600)", bg: "var(--gold-light)", Icon: Clock },
  approved: { label: "অনুমোদিত", color: "var(--green-700)", bg: "var(--green-light)", Icon: CheckCircle2 },
  rejected: { label: "বাতিল", color: "var(--brick)", bg: "var(--brick-light)", Icon: XCircle },
};

const bnDigits = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
const toBn = (n) => String(n).split("").map(c => (/[0-9]/.test(c) ? bnDigits[c] : c)).join("");

function genTrackingId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `STTC-${s}`;
}

function resizeImage(file, maxWidth = 640, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------------------------------------
   Seal / stamp signature element
--------------------------------------------------------------- */
function Seal({ size = 96, color = "var(--gold-500)", ink = "var(--green-900)", icon: SealIcon = Award, label }) {
  return (
    <div className="seal-wrap" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="47" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="39" fill="none" stroke={ink} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="34" fill="none" stroke={color} strokeWidth="1" />
      </svg>
      <div className="seal-center" style={{ color: ink }}>
        <SealIcon size={size * 0.28} strokeWidth={1.6} color={ink} />
      </div>
      {label && <div className="seal-label" style={{ color: ink }}>{label}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------
   Small shared UI bits
--------------------------------------------------------------- */
function Badge({ type }) {
  const isFree = type === "free";
  return (
    <span className={`badge ${isFree ? "badge-free" : "badge-rpl"}`}>
      {isFree ? "ফ্রি কোর্স" : "RPL সনদায়ন"}
    </span>
  );
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const { Icon } = meta;
  return (
    <span className="status-pill" style={{ color: meta.color, background: meta.bg, borderColor: meta.color }}>
      <Icon size={15} /> {meta.label}
    </span>
  );
}

function UploadBox({ label, required, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      onChange(dataUrl);
    } catch {
      onChange("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="upload-box" onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden-input" onChange={handleFile} />
      {value ? (
        <img src={value} alt={label} className="upload-preview" />
      ) : (
        <div className="upload-placeholder">
          {busy ? <Loader2 className="spin" size={22} /> : <ImagePlus size={22} />}
          <span>{label}{required && <span className="req-star"> *</span>}</span>
          {hint && <span className="upload-hint">{hint}</span>}
        </div>
      )}
      {value && (
        <button type="button" className="upload-retake" onClick={(e) => { e.stopPropagation(); onChange(""); }}>
          পরিবর্তন করুন
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Main App
--------------------------------------------------------------- */
export default function App() {
  const [view, setView] = useState("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [applications, setApplications] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [teachersLoaded, setTeachersLoaded] = useState(false);
  const [storageWarned, setStorageWarned] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  // ---- load shared data on mount ----
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("applications-data", true);
        setApplications(res?.value ? JSON.parse(res.value) : []);
      } catch {
        setApplications([]);
      } finally {
        setAppsLoaded(true);
      }
    })();
    (async () => {
      try {
        const res = await window.storage.get("teachers-data", true);
        setTeachers(res?.value ? JSON.parse(res.value) : []);
      } catch {
        setTeachers([]);
      } finally {
        setTeachersLoaded(true);
      }
    })();
  }, []);

  const saveApplications = useCallback(async (next) => {
    setApplications(next);
    try {
      await window.storage.set("applications-data", JSON.stringify(next), true);
    } catch {
      setStorageWarned(true);
    }
  }, []);

  const saveTeachers = useCallback(async (next) => {
    setTeachers(next);
    try {
      await window.storage.set("teachers-data", JSON.stringify(next), true);
    } catch {
      setStorageWarned(true);
    }
  }, []);

  const goto = (v) => { setView(v); setMobileNavOpen(false); window.scrollTo?.(0, 0); };

  const [prefillCourse, setPrefillCourse] = useState(null);

  const navItems = [
    { id: "home", label: "হোম", Icon: Home },
    { id: "courses", label: "কোর্সসমূহ", Icon: GraduationCap },
    { id: "admission", label: "ভর্তি ফরম", Icon: ClipboardList },
    { id: "status", label: "স্ট্যাটাস দেখুন", Icon: Search },
    { id: "teachers", label: "শিক্ষকবৃন্দ", Icon: Users },
  ];

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Hind+Siliguri:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root{
          --green-950:#0B2A1F;
          --green-900:#0F3D2E;
          --green-800:#154A37;
          --green-700:#1B5A42;
          --green-light:#E1EEE6;
          --gold-500:#C89B3C;
          --gold-600:#A9832F;
          --gold-light:#F6ECD3;
          --paper:#F6F1E4;
          --paper-dark:#EAE2CC;
          --ink:#1A2A20;
          --ink-soft:#4B5D53;
          --brick:#9C3B2E;
          --brick-light:#F3DED9;
          --line:#D8CCA8;
        }
        .app-root{
          font-family:'Hind Siliguri', sans-serif;
          background:var(--paper);
          color:var(--ink);
          min-height:100vh;
          line-height:1.55;
        }
        .font-display{ font-family:'Tiro Bangla', serif; }
        .font-mono{ font-family:'JetBrains Mono', monospace; }
        *{ box-sizing:border-box; }
        button{ font-family:inherit; cursor:pointer; }
        input, select, textarea{ font-family:inherit; }
        ::selection{ background:var(--gold-500); color:var(--green-950); }

        /* header */
        .site-header{
          position:sticky; top:0; z-index:40;
          background:var(--green-900);
          border-bottom:3px solid var(--gold-500);
        }
        .header-inner{
          max-width:1120px; margin:0 auto; padding:14px 20px;
          display:flex; align-items:center; justify-content:space-between;
        }
        .logo-row{ display:flex; align-items:center; gap:10px; cursor:pointer; }
        .logo-mark{
          width:38px; height:38px; border-radius:999px; background:var(--gold-500);
          display:flex; align-items:center; justify-content:center; color:var(--green-950);
          font-family:'Tiro Bangla', serif; font-weight:700; font-size:18px;
          border:2px solid var(--paper);
        }
        .logo-text{ color:var(--paper); }
        .logo-text .t1{ font-family:'Tiro Bangla', serif; font-size:19px; line-height:1.1; }
        .logo-text .t2{ font-size:11px; color:var(--gold-light); letter-spacing:.4px; }
        .nav-desktop{ display:none; gap:4px; }
        @media(min-width:920px){ .nav-desktop{ display:flex; } .nav-mobile-btn{ display:none; } }
        .nav-link{
          padding:9px 14px; border-radius:8px; background:transparent; border:none;
          color:var(--paper); opacity:.82; font-size:14.5px; display:flex; align-items:center; gap:6px;
          transition:.15s;
        }
        .nav-link:hover{ opacity:1; background:rgba(255,255,255,.08); }
        .nav-link.active{ opacity:1; background:var(--gold-500); color:var(--green-950); font-weight:600; }
        .nav-admin{
          padding:9px 14px; border-radius:8px; border:1px solid var(--gold-500); background:transparent;
          color:var(--gold-light); font-size:14px; display:flex; align-items:center; gap:6px;
        }
        .nav-mobile-btn{ background:transparent; border:none; color:var(--paper); padding:6px; }
        .nav-mobile-panel{
          background:var(--green-900); border-bottom:3px solid var(--gold-500); padding:8px 16px 14px;
          display:flex; flex-direction:column; gap:2px;
        }
        @media(min-width:920px){ .nav-mobile-panel{ display:none; } }

        /* footer */
        .site-footer{
          background:var(--green-950); color:var(--paper); margin-top:60px;
          padding:36px 20px 24px;
        }
        .footer-inner{ max-width:1120px; margin:0 auto; display:flex; flex-wrap:wrap; gap:24px; justify-content:space-between; }
        .footer-note{ color:var(--gold-light); font-size:12.5px; opacity:.8; margin-top:18px; }

        /* generic layout */
        .container{ max-width:1120px; margin:0 auto; padding:0 20px; }
        .section{ padding:56px 0; }
        .eyebrow{
          display:inline-flex; align-items:center; gap:8px; font-size:12.5px; letter-spacing:.6px;
          color:var(--green-700); background:var(--green-light); padding:5px 12px; border-radius:999px;
          font-weight:600; margin-bottom:14px;
        }
        .h1{ font-family:'Tiro Bangla', serif; font-size:38px; line-height:1.25; color:var(--green-950); }
        .h2{ font-family:'Tiro Bangla', serif; font-size:28px; color:var(--green-950); margin-bottom:6px; }
        .lead{ color:var(--ink-soft); font-size:16.5px; max-width:640px; }
        @media(min-width:720px){ .h1{ font-size:48px; } }

        .btn{
          display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:9px;
          border:none; font-size:15px; font-weight:600; transition:.15s;
        }
        .btn-primary{ background:var(--gold-500); color:var(--green-950); }
        .btn-primary:hover{ background:var(--gold-600); }
        .btn-outline{ background:transparent; border:1.5px solid var(--green-900); color:var(--green-900); }
        .btn-outline:hover{ background:var(--green-900); color:var(--paper); }
        .btn-ghost{ background:transparent; color:var(--green-900); border:1px solid var(--line); }
        .btn:disabled{ opacity:.5; cursor:not-allowed; }

        /* hero */
        .hero{
          background:linear-gradient(180deg, var(--green-900), var(--green-950));
          color:var(--paper); position:relative; overflow:hidden;
        }
        .hero-inner{
          max-width:1120px; margin:0 auto; padding:64px 20px 56px;
          display:grid; gap:32px; align-items:center;
        }
        @media(min-width:900px){ .hero-inner{ grid-template-columns:1.2fr .8fr; padding:88px 20px 72px; } }
        .hero-eyebrow{ color:var(--gold-500); font-size:13px; letter-spacing:1px; font-weight:600; margin-bottom:14px; }
        .hero h1{ color:var(--paper); }
        .hero .lead{ color:#CFE0D6; margin-top:16px; }
        .hero-cta{ display:flex; flex-wrap:wrap; gap:12px; margin-top:26px; }
        .hero-seal-wrap{ display:flex; justify-content:center; }
        .hero-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:36px; max-width:520px; }
        .stat-num{ font-family:'Tiro Bangla', serif; font-size:26px; color:var(--gold-500); }
        .stat-label{ font-size:12px; color:#B9CFC1; }

        .seal-wrap{ position:relative; }
        .seal-center{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
        .seal-label{ position:absolute; bottom:-20px; width:100%; text-align:center; font-size:10px; letter-spacing:.5px; }

        /* cards */
        .grid{ display:grid; gap:18px; }
        .grid-2{ grid-template-columns:1fr; } @media(min-width:700px){ .grid-2{ grid-template-columns:1fr 1fr; } }
        .grid-3{ grid-template-columns:1fr; } @media(min-width:700px){ .grid-3{ grid-template-columns:repeat(3,1fr); } }
        .card{
          background:#fff; border:1px solid var(--line); border-radius:12px; padding:22px;
          position:relative;
        }
        .card::before{
          content:''; position:absolute; top:10px; bottom:10px; left:0; width:3px; background:var(--gold-500); border-radius:2px;
        }
        .course-card{ padding-left:26px; display:flex; flex-direction:column; gap:10px; }
        .course-name{ font-family:'Tiro Bangla', serif; font-size:19px; color:var(--green-950); }
        .course-meta{ font-size:13px; color:var(--ink-soft); display:flex; gap:14px; flex-wrap:wrap; }
        .course-desc{ font-size:14px; color:var(--ink-soft); flex:1; }
        .course-fee{ font-family:'JetBrains Mono', monospace; font-weight:600; color:var(--brick); font-size:15px; }

        .badge{ font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:999px; letter-spacing:.3px; width:fit-content; }
        .badge-free{ background:var(--green-light); color:var(--green-700); }
        .badge-rpl{ background:var(--gold-light); color:var(--gold-600); }

        .course-tabs{ display:inline-flex; background:var(--paper-dark); padding:4px; border-radius:10px; gap:4px; margin-bottom:26px; }
        .course-tab{ padding:9px 18px; border-radius:8px; border:none; background:transparent; color:var(--ink-soft); font-weight:600; font-size:14px; }
        .course-tab.active{ background:var(--green-900); color:var(--paper); }

        /* form */
        .form-shell{ max-width:720px; margin:0 auto; }
        .steps-track{ display:flex; align-items:center; margin-bottom:34px; }
        .step-dot{
          width:30px; height:30px; border-radius:999px; display:flex; align-items:center; justify-content:center;
          font-size:13px; font-weight:700; border:2px solid var(--line); background:#fff; color:var(--ink-soft); flex-shrink:0;
        }
        .step-dot.active{ border-color:var(--green-900); background:var(--green-900); color:#fff; }
        .step-dot.done{ border-color:var(--gold-500); background:var(--gold-500); color:var(--green-950); }
        .step-line{ flex:1; height:2px; background:var(--line); margin:0 4px; }
        .step-line.done{ background:var(--gold-500); }
        .step-label{ text-align:center; font-size:12px; color:var(--ink-soft); margin-top:20px; }

        .field{ margin-bottom:16px; }
        .field label{ display:block; font-size:13.5px; font-weight:600; color:var(--green-950); margin-bottom:6px; }
        .field input[type=text], .field input[type=tel], .field input[type=date], .field textarea, .field select{
          width:100%; padding:11px 13px; border-radius:8px; border:1.5px solid var(--line); background:#fff;
          font-size:14.5px; color:var(--ink);
        }
        .field input:focus, .field textarea:focus, .field select:focus{ outline:2px solid var(--gold-500); outline-offset:1px; border-color:var(--gold-500); }
        .field-error{ color:var(--brick); font-size:12.5px; margin-top:4px; }
        .field-hint{ font-size:12px; color:var(--ink-soft); margin-top:4px; }
        .req-star{ color:var(--brick); }

        .course-pick-grid{ display:grid; gap:10px; }
        .course-pick{
          border:1.5px solid var(--line); border-radius:10px; padding:14px 16px; display:flex; justify-content:space-between;
          align-items:center; gap:10px; background:#fff;
        }
        .course-pick.selected{ border-color:var(--green-900); background:var(--green-light); }
        .course-pick input{ accent-color:var(--green-900); width:17px; height:17px; }

        .upload-box{
          border:2px dashed var(--line); border-radius:12px; min-height:150px; display:flex; align-items:center;
          justify-content:center; cursor:pointer; position:relative; overflow:hidden; background:#fff;
        }
        .upload-box:hover{ border-color:var(--gold-500); }
        .hidden-input{ display:none; }
        .upload-placeholder{ display:flex; flex-direction:column; align-items:center; gap:6px; color:var(--ink-soft); font-size:13.5px; padding:16px; text-align:center; }
        .upload-hint{ font-size:11.5px; color:var(--ink-soft); opacity:.75; }
        .upload-preview{ width:100%; height:150px; object-fit:cover; }
        .upload-retake{
          position:absolute; bottom:6px; right:6px; background:var(--green-950); color:#fff; border:none;
          padding:5px 10px; border-radius:6px; font-size:11.5px;
        }
        .spin{ animation:spin 1s linear infinite; }
        @keyframes spin{ to{ transform:rotate(360deg); } }

        .step-actions{ display:flex; justify-content:space-between; margin-top:26px; }
        .pay-box{ background:var(--gold-light); border:1px solid var(--gold-500); border-radius:10px; padding:16px 18px; margin-bottom:20px; }
        .pay-amount{ font-family:'JetBrains Mono', monospace; font-size:22px; color:var(--green-950); font-weight:700; }

        .review-row{ display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-bottom:1px dashed var(--line); font-size:14px; }
        .review-row span:first-child{ color:var(--ink-soft); }
        .review-row span:last-child{ font-weight:600; text-align:right; }

        .success-box{ text-align:center; padding:40px 20px; }
        .tracking-id{
          font-family:'JetBrains Mono', monospace; font-size:24px; font-weight:700; background:var(--green-950);
          color:var(--gold-500); padding:12px 22px; border-radius:10px; display:inline-flex; align-items:center; gap:10px;
          margin:18px 0;
        }
        .copy-btn{ background:transparent; border:none; color:var(--gold-500); }

        /* status page */
        .status-search{ display:flex; gap:10px; max-width:480px; margin:0 auto 30px; }
        .status-search input{
          flex:1; padding:13px 15px; border-radius:9px; border:1.5px solid var(--line); font-size:15px;
          font-family:'JetBrains Mono', monospace;
        }
        .status-result{ max-width:560px; margin:0 auto; background:#fff; border:1px solid var(--line); border-radius:14px; padding:28px; text-align:center; }
        .status-pill{
          display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; font-weight:700;
          font-size:13.5px; border:1.5px solid;
        }

        /* teacher card */
        .teacher-card{ background:#fff; border:1px solid var(--line); border-radius:12px; overflow:hidden; text-align:center; padding-bottom:18px; }
        .teacher-photo{ width:100%; height:190px; object-fit:cover; background:var(--paper-dark); }
        .teacher-photo-fallback{ width:100%; height:190px; display:flex; align-items:center; justify-content:center; background:var(--green-light); color:var(--green-700); }
        .teacher-name{ font-family:'Tiro Bangla', serif; font-size:18px; margin-top:14px; color:var(--green-950); }
        .teacher-role{ font-size:13px; color:var(--gold-600); font-weight:600; margin-top:2px; }
        .teacher-subject{ font-size:12.5px; color:var(--ink-soft); margin-top:6px; padding:0 14px; }

        .empty-state{ text-align:center; padding:60px 20px; color:var(--ink-soft); }

        /* admin */
        .admin-gate{ max-width:380px; margin:80px auto; background:#fff; border:1px solid var(--line); border-radius:14px; padding:32px; text-align:center; }
        .admin-topbar{ display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
        .admin-tabs{ display:flex; gap:8px; }
        .admin-tab{ padding:9px 16px; border-radius:8px; border:1px solid var(--line); background:#fff; font-size:14px; font-weight:600; color:var(--ink-soft); }
        .admin-tab.active{ background:var(--green-900); color:#fff; border-color:var(--green-900); }
        .filters-row{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; }
        .filter-select{ padding:8px 12px; border-radius:8px; border:1.5px solid var(--line); font-size:13.5px; background:#fff; }
        .app-table{ width:100%; border-collapse:collapse; background:#fff; border-radius:10px; overflow:hidden; border:1px solid var(--line); }
        .app-table th{ text-align:left; font-size:12px; color:var(--ink-soft); background:var(--paper-dark); padding:10px 14px; }
        .app-table td{ padding:11px 14px; font-size:13.5px; border-top:1px solid var(--line); }
        .app-table tr:hover td{ background:var(--green-light); cursor:pointer; }
        .tid-mono{ font-family:'JetBrains Mono', monospace; font-size:12.5px; }

        .modal-overlay{ position:fixed; inset:0; background:rgba(11,42,31,.55); display:flex; align-items:flex-start; justify-content:center; padding:30px 16px; overflow-y:auto; z-index:100; }
        .modal-box{ background:#fff; border-radius:14px; max-width:640px; width:100%; padding:28px; margin-top:20px; }
        .modal-close{ float:right; background:transparent; border:none; color:var(--ink-soft); }
        .modal-photos{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:16px 0; }
        .modal-photos img{ width:100%; height:100px; object-fit:cover; border-radius:8px; border:1px solid var(--line); }
        .modal-photo-label{ font-size:11px; color:var(--ink-soft); text-align:center; margin-top:3px; }
        .modal-actions{ display:flex; gap:10px; margin-top:20px; }
        .btn-approve{ background:var(--green-700); color:#fff; flex:1; justify-content:center; }
        .btn-reject{ background:var(--brick); color:#fff; flex:1; justify-content:center; }

        .teacher-form{ background:#fff; border:1px solid var(--line); border-radius:12px; padding:22px; margin-bottom:26px; }
        .teacher-admin-row{ display:flex; align-items:center; gap:14px; background:#fff; border:1px solid var(--line); border-radius:10px; padding:12px 16px; margin-bottom:10px; }
        .teacher-admin-row img{ width:48px; height:48px; border-radius:999px; object-fit:cover; }
        .teacher-admin-avatar{ width:48px; height:48px; border-radius:999px; background:var(--green-light); color:var(--green-700); display:flex; align-items:center; justify-content:center; }

        .why-grid{ display:grid; gap:16px; grid-template-columns:1fr; } @media(min-width:700px){ .why-grid{ grid-template-columns:repeat(3,1fr); } }
        .why-card{ background:#fff; border:1px solid var(--line); border-radius:12px; padding:20px; }
        .why-icon{ width:40px; height:40px; border-radius:10px; background:var(--green-light); color:var(--green-700); display:flex; align-items:center; justify-content:center; margin-bottom:10px; }

        .banner-note{ background:var(--gold-light); border:1px solid var(--gold-500); color:var(--green-950); padding:10px 16px; border-radius:9px; font-size:13px; text-align:center; }
      `}</style>

      <Header view={view} goto={goto} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} navItems={navItems} />

      {view === "home" && <HomeView goto={goto} />}
      {view === "courses" && (
        <CoursesView
          goto={(v, course) => { setPrefillCourse(course || null); goto(v); }}
        />
      )}
      {view === "admission" && (
        <AdmissionView
          appsLoaded={appsLoaded}
          applications={applications}
          saveApplications={saveApplications}
          prefillCourse={prefillCourse}
        />
      )}
      {view === "status" && <StatusView applications={applications} appsLoaded={appsLoaded} />}
      {view === "teachers" && <TeachersView teachers={teachers} teachersLoaded={teachersLoaded} />}
      {view === "admin" && (
        <AdminView
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          applications={applications}
          saveApplications={saveApplications}
          teachers={teachers}
          saveTeachers={saveTeachers}
        />
      )}

      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="logo-row">
              <div className="logo-mark">স</div>
              <div className="logo-text">
                <div className="t1">সোনালী টেকনিক্যাল ট্রেনিং সেন্টার</div>
                <div className="t2">STTC · দক্ষতাই স্বীকৃতি</div>
              </div>
            </div>
            <div className="footer-note">© {new Date().getFullYear()} STTC — ডেমো পোর্টাল, প্রকৃত প্রতিষ্ঠান নয়।</div>
          </div>
          <div style={{ fontSize: 13.5, color: "#CFE0D6", display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} /> রংপুর, বাংলাদেশ</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={14} /> ০১৭০০-০০০০০০</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------
   Header
--------------------------------------------------------------- */
function Header({ view, goto, mobileNavOpen, setMobileNavOpen, navItems }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo-row" onClick={() => goto("home")}>
          <div className="logo-mark">স</div>
          <div className="logo-text">
            <div className="t1">সোনালী টেকনিক্যাল ট্রেনিং সেন্টার</div>
            <div className="t2">STTC · দক্ষতাই স্বীকৃতি</div>
          </div>
        </div>
        <nav className="nav-desktop">
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} className={`nav-link ${view === id ? "active" : ""}`} onClick={() => goto(id)}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <button className="nav-admin" onClick={() => goto("admin")}>
            <ShieldCheck size={15} /> অ্যাডমিন
          </button>
        </nav>
        <button className="nav-mobile-btn" onClick={() => setMobileNavOpen(v => !v)} aria-label="মেনু">
          <Menu size={24} />
        </button>
      </div>
      {mobileNavOpen && (
        <div className="nav-mobile-panel">
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} className={`nav-link ${view === id ? "active" : ""}`} onClick={() => goto(id)}>
              <Icon size={15} /> {label}
            </button>
          ))}
          <button className="nav-admin" onClick={() => goto("admin")}>
            <ShieldCheck size={15} /> অ্যাডমিন
          </button>
        </div>
      )}
    </header>
  );
}

/* ---------------------------------------------------------------
   Home
--------------------------------------------------------------- */
function HomeView({ goto }) {
  const why = [
    { Icon: Award, title: "স্বীকৃত সনদ", desc: "পূর্ব অভিজ্ঞতাকে RPL পদ্ধতিতে আনুষ্ঠানিক সনদে রূপান্তর করুন।" },
    { Icon: GraduationCap, title: "বিনামূল্যে প্রশিক্ষণ", desc: "নির্বাচিত ট্রেডে সম্পূর্ণ ফ্রি হাতে-কলমে প্রশিক্ষণ।" },
    { Icon: ClipboardList, title: "সহজ আবেদন", desc: "অনলাইনে আবেদন করুন, ট্র্যাকিং আইডি দিয়ে অগ্রগতি দেখুন।" },
  ];
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">রংপুর বিভাগীয় কারিগরি প্রশিক্ষণ কেন্দ্র</div>
            <h1 className="h1">অভিজ্ঞতা থাকুক বা না থাকুক —<br />আপনার দক্ষতার আনুষ্ঠানিক স্বীকৃতি এখানে।</h1>
            <p className="lead">ফ্রি কারিগরি কোর্স অথবা RPL (Recognition of Prior Learning)-এর মাধ্যমে আপনার বিদ্যমান দক্ষতাকে সরকার অনুমোদিত সনদে রূপান্তর করুন।</p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => goto("admission")}>ভর্তি ফরম পূরণ করুন <ArrowRight size={16} /></button>
              <button className="btn btn-outline" style={{ borderColor: "var(--paper)", color: "var(--paper)" }} onClick={() => goto("courses")}>কোর্সসমূহ দেখুন</button>
            </div>
            <div className="hero-stats">
              <div><div className="stat-num">{toBn(9)}+</div><div className="stat-label">মোট কোর্স</div></div>
              <div><div className="stat-num">{toBn(4)}</div><div className="stat-label">ফ্রি ট্রেড</div></div>
              <div><div className="stat-num">{toBn(5)}</div><div className="stat-label">RPL ট্রেড</div></div>
            </div>
          </div>
          <div className="hero-seal-wrap">
            <Seal size={210} label="স্বীকৃতি · প্রশিক্ষণ · সনদ" />
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="eyebrow">কেন আমাদের বেছে নেবেন</div>
        <h2 className="h2">শেখা থেকে সনদায়ন — একটাই ঠিকানা</h2>
        <div className="why-grid" style={{ marginTop: 24 }}>
          {why.map(({ Icon, title, desc }) => (
            <div className="why-card" key={title}>
              <div className="why-icon"><Icon size={20} /></div>
              <div style={{ fontWeight: 700, marginBottom: 4, color: "var(--green-950)" }}>{title}</div>
              <div style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="eyebrow">জনপ্রিয় কোর্স</div>
        <h2 className="h2">কয়েকটি বাছাই করা ট্রেড</h2>
        <div className="grid grid-3" style={{ marginTop: 24 }}>
          {[...FREE_COURSES.slice(0, 1), ...RPL_COURSES.slice(0, 2)].map(c => {
            const type = FREE_COURSES.includes(c) ? "free" : "rpl";
            return (
              <div className="card course-card" key={c.id}>
                <Badge type={type} />
                <div className="course-name">{c.name}</div>
                <div className="course-desc">{c.desc}</div>
                <button className="btn btn-ghost" onClick={() => goto("courses")}>বিস্তারিত দেখুন <ChevronRight size={14} /></button>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------
   Courses
--------------------------------------------------------------- */
function CoursesView({ goto }) {
  const [tab, setTab] = useState("free");
  const list = tab === "free" ? FREE_COURSES : RPL_COURSES;
  return (
    <section className="section container">
      <div className="eyebrow">কোর্সসমূহ</div>
      <h2 className="h2">আপনার পছন্দের ট্রেড বাছাই করুন</h2>
      <p className="lead" style={{ marginBottom: 22 }}>ফ্রি কোর্সে সম্পূর্ণ নতুন করে প্রশিক্ষণ নিন, অথবা আপনার আগে থেকে থাকা দক্ষতাকে RPL-এর মাধ্যমে সনদায়ন করুন।</p>
      <div className="course-tabs">
        <button className={`course-tab ${tab === "free" ? "active" : ""}`} onClick={() => setTab("free")}>ফ্রি কোর্স</button>
        <button className={`course-tab ${tab === "rpl" ? "active" : ""}`} onClick={() => setTab("rpl")}>RPL (পেইড)</button>
      </div>
      <div className="grid grid-3">
        {list.map(c => (
          <div className="card course-card" key={c.id}>
            <Badge type={tab} />
            <div className="course-name">{c.name}</div>
            <div className="course-meta">
              {c.duration && <span>মেয়াদ: {c.duration}</span>}
              {c.seats && <span>আসন: {toBn(c.seats)}টি</span>}
            </div>
            <div className="course-desc">{c.desc}</div>
            {tab === "rpl" && <div className="course-fee">সনদায়ন ফি: ৳{toBn(c.fee.toLocaleString("en-US"))}</div>}
            <button className="btn btn-primary" onClick={() => goto("admission", { type: tab, id: c.id })}>
              এখনই আবেদন করুন <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Admission form (multi-step)
--------------------------------------------------------------- */
const emptyForm = {
  name: "", fatherName: "", dob: "", phone: "", address: "",
  courseType: "free", courseId: "",
  photo: "", nidPhoto: "", certPhoto: "",
  paymentMethod: "bkash", paymentNumber: "", transactionId: "",
};

function AdmissionView({ appsLoaded, applications, saveApplications, prefillCourse }) {
  const [form, setForm] = useState(() => prefillCourse
    ? { ...emptyForm, courseType: prefillCourse.type, courseId: prefillCourse.id }
    : emptyForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [copied, setCopied] = useState(false);

  const isRpl = form.courseType === "rpl";
  const stepLabels = isRpl
    ? ["ব্যক্তিগত তথ্য", "কোর্স নির্বাচন", "ডকুমেন্ট", "পেমেন্ট", "পর্যালোচনা"]
    : ["ব্যক্তিগত তথ্য", "কোর্স নির্বাচন", "ডকুমেন্ট", "পর্যালোচনা"];
  const totalSteps = stepLabels.length;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = "নাম আবশ্যক";
      if (!form.fatherName.trim()) e.fatherName = "পিতা/অভিভাবকের নাম আবশ্যক";
      if (!form.dob) e.dob = "জন্ম তারিখ আবশ্যক";
      if (!/^01[0-9]{9}$/.test(form.phone.trim())) e.phone = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (০১...)";
      if (!form.address.trim()) e.address = "ঠিকানা আবশ্যক";
    }
    if (s === 2) {
      if (!form.courseId) e.courseId = "একটি কোর্স নির্বাচন করুন";
    }
    if (s === 3) {
      if (!form.photo) e.photo = "নিজের ছবি আপলোড করুন";
      if (!form.nidPhoto) e.nidPhoto = "NID/জন্মনিবন্ধনের ছবি আপলোড করুন";
      if (isRpl && !form.certPhoto) e.certPhoto = "অভিজ্ঞতার সনদ আপলোড করুন";
    }
    if (s === 4 && isRpl) {
      if (!form.paymentNumber.trim()) e.paymentNumber = "bKash/Nagad নম্বর দিন";
      if (!form.transactionId.trim()) e.transactionId = "ট্রান্স্যাকশন আইডি দিন";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => Math.min(totalSteps, s + 1)); };
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleCourseTypeChange = (type) => {
    setForm(f => ({ ...f, courseType: type, courseId: "" }));
  };

  const submit = async () => {
    if (!validateStep(step)) return;
    setSubmitting(true);
    const course = findCourse(form.courseId);
    const trackingId = genTrackingId();
    const record = {
      trackingId,
      name: form.name, fatherName: form.fatherName, dob: form.dob, phone: form.phone, address: form.address,
      courseType: form.courseType, courseId: form.courseId, courseName: course?.name || "",
      photo: form.photo, nidPhoto: form.nidPhoto, certPhoto: isRpl ? form.certPhoto : "",
      paymentMethod: isRpl ? form.paymentMethod : "", paymentNumber: isRpl ? form.paymentNumber : "",
      transactionId: isRpl ? form.transactionId : "", amount: isRpl ? course?.fee || 0 : 0,
      status: "pending", submittedAt: new Date().toISOString(),
    };
    try {
      await saveApplications([...applications, record]);
      setSubmittedId(trackingId);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <section className="section container">
        <div className="form-shell success-box card">
          <Seal size={90} label="সফলভাবে জমা" icon={CheckCircle2} />
          <h2 className="h2" style={{ marginTop: 22 }}>আবেদন সফলভাবে জমা হয়েছে</h2>
          <p className="lead" style={{ margin: "0 auto" }}>আপনার ট্র্যাকিং আইডিটি সংরক্ষণ করুন — এটি দিয়ে "স্ট্যাটাস দেখুন" পেজে আবেদনের অবস্থা যাচাই করতে পারবেন।</p>
          <div className="tracking-id">
            {submittedId}
            <button className="copy-btn" onClick={() => { navigator.clipboard?.writeText(submittedId); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              <Copy size={18} />
            </button>
          </div>
          {copied && <div style={{ fontSize: 12.5, color: "var(--green-700)" }}>কপি হয়েছে!</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="section container">
      <div className="form-shell">
        <div className="eyebrow">ভর্তি ফরম</div>
        <h2 className="h2">আবেদন করুন</h2>
        <div className="steps-track">
          {stepLabels.map((_, i) => (
            <React.Fragment key={i}>
              <div className={`step-dot ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
                {step > i + 1 ? <Check size={14} /> : toBn(i + 1)}
              </div>
              {i < stepLabels.length - 1 && <div className={`step-line ${step > i + 1 ? "done" : ""}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="step-label">ধাপ {toBn(step)}/{toBn(totalSteps)}: {stepLabels[step - 1]}</div>

        {!appsLoaded && <div style={{ textAlign: "center", padding: 30, color: "var(--ink-soft)" }}><Loader2 className="spin" /> লোড হচ্ছে…</div>}

        {appsLoaded && step === 1 && (
          <div>
            <div className="field">
              <label>পূর্ণ নাম <span className="req-star">*</span></label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="যেমন: মোঃ করিম উদ্দিন" />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>
            <div className="field">
              <label>পিতা/অভিভাবকের নাম <span className="req-star">*</span></label>
              <input type="text" value={form.fatherName} onChange={e => set("fatherName", e.target.value)} />
              {errors.fatherName && <div className="field-error">{errors.fatherName}</div>}
            </div>
            <div className="field">
              <label>জন্ম তারিখ <span className="req-star">*</span></label>
              <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} />
              {errors.dob && <div className="field-error">{errors.dob}</div>}
            </div>
            <div className="field">
              <label>মোবাইল নম্বর <span className="req-star">*</span></label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="01XXXXXXXXX" />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>
            <div className="field">
              <label>বর্তমান ঠিকানা <span className="req-star">*</span></label>
              <textarea rows={3} value={form.address} onChange={e => set("address", e.target.value)} />
              {errors.address && <div className="field-error">{errors.address}</div>}
            </div>
          </div>
        )}

        {appsLoaded && step === 2 && (
          <div>
            <div className="field">
              <label>কোর্সের ধরন</label>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className={`btn ${form.courseType === "free" ? "btn-primary" : "btn-ghost"}`} onClick={() => handleCourseTypeChange("free")}>ফ্রি কোর্স</button>
                <button type="button" className={`btn ${form.courseType === "rpl" ? "btn-primary" : "btn-ghost"}`} onClick={() => handleCourseTypeChange("rpl")}>RPL (পেইড)</button>
              </div>
            </div>
            <div className="field">
              <label>কোর্স নির্বাচন করুন <span className="req-star">*</span></label>
              <div className="course-pick-grid">
                {(form.courseType === "free" ? FREE_COURSES : RPL_COURSES).map(c => (
                  <label key={c.id} className={`course-pick ${form.courseId === c.id ? "selected" : ""}`}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                        {c.duration ? `মেয়াদ: ${c.duration}` : `সনদায়ন ফি: ৳${toBn(c.fee.toLocaleString("en-US"))}`}
                      </div>
                    </div>
                    <input type="radio" name="courseId" checked={form.courseId === c.id} onChange={() => set("courseId", c.id)} />
                  </label>
                ))}
              </div>
              {errors.courseId && <div className="field-error">{errors.courseId}</div>}
            </div>
          </div>
        )}

        {appsLoaded && step === 3 && (
          <div>
            <div className="grid grid-2">
              <div className="field">
                <label>নিজের ছবি <span className="req-star">*</span></label>
                <UploadBox label="ছবি আপলোড করুন" required value={form.photo} onChange={v => set("photo", v)} hint="সম্প্রতি তোলা পাসপোর্ট সাইজ ছবি" />
                {errors.photo && <div className="field-error">{errors.photo}</div>}
              </div>
              <div className="field">
                <label>NID / জন্মনিবন্ধন <span className="req-star">*</span></label>
                <UploadBox label="ডকুমেন্ট আপলোড করুন" required value={form.nidPhoto} onChange={v => set("nidPhoto", v)} hint="স্পষ্ট স্ক্যান/ছবি" />
                {errors.nidPhoto && <div className="field-error">{errors.nidPhoto}</div>}
              </div>
            </div>
            {isRpl && (
              <div className="field">
                <label>অভিজ্ঞতার সনদ <span className="req-star">*</span></label>
                <UploadBox label="সনদ আপলোড করুন" required value={form.certPhoto} onChange={v => set("certPhoto", v)} hint="পূর্ববর্তী কর্মস্থল বা প্রশিক্ষণের সনদ" />
                {errors.certPhoto && <div className="field-error">{errors.certPhoto}</div>}
              </div>
            )}
          </div>
        )}

        {appsLoaded && step === 4 && isRpl && (
          <div>
            <div className="pay-box">
              <div style={{ fontSize: 13, color: "var(--green-950)" }}>পরিশোধযোগ্য সনদায়ন ফি</div>
              <div className="pay-amount">৳{toBn((findCourse(form.courseId)?.fee || 0).toLocaleString("en-US"))}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>উপরের নম্বরে bKash/Nagad-এর মাধ্যমে "Send Money" করে ট্রান্স্যাকশন আইডি নিচে দিন।</div>
            </div>
            <div className="field">
              <label>পেমেন্ট মাধ্যম</label>
              <select value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)}>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
              </select>
            </div>
            <div className="field">
              <label>আপনার {form.paymentMethod === "bkash" ? "bKash" : "Nagad"} নম্বর <span className="req-star">*</span></label>
              <input type="tel" value={form.paymentNumber} onChange={e => set("paymentNumber", e.target.value)} placeholder="01XXXXXXXXX" />
              {errors.paymentNumber && <div className="field-error">{errors.paymentNumber}</div>}
            </div>
            <div className="field">
              <label>ট্রান্স্যাকশন আইডি <span className="req-star">*</span></label>
              <input type="text" value={form.transactionId} onChange={e => set("transactionId", e.target.value)} placeholder="যেমন: 8N7A6B5C4D" />
              {errors.transactionId && <div className="field-error">{errors.transactionId}</div>}
            </div>
          </div>
        )}

        {appsLoaded && step === totalSteps && (
          <div>
            <div className="card" style={{ paddingLeft: 22 }}>
              <div className="review-row"><span>নাম</span><span>{form.name}</span></div>
              <div className="review-row"><span>পিতা/অভিভাবক</span><span>{form.fatherName}</span></div>
              <div className="review-row"><span>জন্ম তারিখ</span><span>{form.dob}</span></div>
              <div className="review-row"><span>মোবাইল</span><span>{form.phone}</span></div>
              <div className="review-row"><span>ঠিকানা</span><span>{form.address}</span></div>
              <div className="review-row"><span>কোর্স</span><span>{findCourse(form.courseId)?.name}</span></div>
              <div className="review-row"><span>ধরন</span><span>{isRpl ? "RPL (পেইড)" : "ফ্রি"}</span></div>
              {isRpl && <div className="review-row"><span>ফি</span><span>৳{toBn((findCourse(form.courseId)?.fee || 0).toLocaleString("en-US"))}</span></div>}
              {isRpl && <div className="review-row"><span>ট্রান্স্যাকশন আইডি</span><span>{form.transactionId}</span></div>}
            </div>
            <div className="banner-note" style={{ marginTop: 16 }}>সাবমিট করার আগে সব তথ্য যাচাই করে নিন — জমা দেওয়ার পর একটি ট্র্যাকিং আইডি পাবেন।</div>
          </div>
        )}

        {appsLoaded && (
          <div className="step-actions">
            {step > 1 ? (
              <button className="btn btn-ghost" onClick={back}><ChevronLeft size={16} /> পূর্ববর্তী</button>
            ) : <span />}
            {step < totalSteps ? (
              <button className="btn btn-primary" onClick={next}>পরবর্তী <ChevronRight size={16} /></button>
            ) : (
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? <><Loader2 className="spin" size={16} /> জমা হচ্ছে…</> : <>আবেদন জমা দিন <Check size={16} /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Status check
--------------------------------------------------------------- */
function StatusView({ applications, appsLoaded }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(undefined); // undefined = not searched, null = not found, obj = found

  const search = () => {
    const found = applications.find(a => a.trackingId.toLowerCase() === query.trim().toLowerCase());
    setResult(found || null);
  };

  return (
    <section className="section container">
      <div className="eyebrow">স্ট্যাটাস চেক</div>
      <h2 className="h2" style={{ textAlign: "center" }}>আপনার আবেদনের অবস্থা দেখুন</h2>
      <p className="lead" style={{ margin: "0 auto 26px", textAlign: "center" }}>আবেদন জমা দেওয়ার সময় পাওয়া ট্র্যাকিং আইডিটি লিখুন।</p>
      <div className="status-search">
        <input
          placeholder="STTC-XXXXXX"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
        />
        <button className="btn btn-primary" onClick={search} disabled={!appsLoaded}>
          {!appsLoaded ? <Loader2 className="spin" size={16} /> : <Search size={16} />} খুঁজুন
        </button>
      </div>

      {result === null && (
        <div className="status-result">
          <XCircle size={30} color="var(--brick)" />
          <div style={{ marginTop: 10, fontWeight: 600 }}>এই ট্র্যাকিং আইডিতে কোনো আবেদন পাওয়া যায়নি।</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>আইডিটি সঠিকভাবে লিখেছেন কিনা যাচাই করুন।</div>
        </div>
      )}

      {result && (
        <div className="status-result">
          <StatusPill status={result.status} />
          <div style={{ fontFamily: "'Tiro Bangla', serif", fontSize: 21, marginTop: 14, color: "var(--green-950)" }}>{result.name}</div>
          <div style={{ fontSize: 13.5, color: "var(--ink-soft)", marginTop: 4 }}>{result.courseName}</div>
          <div className="tid-mono" style={{ marginTop: 12, fontSize: 13, color: "var(--ink-soft)" }}>{result.trackingId}</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10 }}>
            আবেদনের তারিখ: {new Date(result.submittedAt).toLocaleDateString("bn-BD")}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------
   Teachers
--------------------------------------------------------------- */
function TeachersView({ teachers, teachersLoaded }) {
  return (
    <section className="section container">
      <div className="eyebrow">শিক্ষকবৃন্দ</div>
      <h2 className="h2">আমাদের প্রশিক্ষকগণ</h2>
      {!teachersLoaded && <div style={{ textAlign: "center", padding: 40, color: "var(--ink-soft)" }}><Loader2 className="spin" /> লোড হচ্ছে…</div>}
      {teachersLoaded && teachers.length === 0 && (
        <div className="empty-state">
          <Users size={30} style={{ marginBottom: 10, opacity: .5 }} />
          <div>এখনো কোনো শিক্ষক যুক্ত করা হয়নি।</div>
        </div>
      )}
      {teachersLoaded && teachers.length > 0 && (
        <div className="grid grid-3">
          {teachers.map(t => (
            <div className="teacher-card" key={t.id}>
              {t.photo ? <img src={t.photo} alt={t.name} className="teacher-photo" /> : (
                <div className="teacher-photo-fallback"><UserCircle2 size={54} /></div>
              )}
              <div className="teacher-name">{t.name}</div>
              <div className="teacher-role">{t.designation}</div>
              <div className="teacher-subject">{t.subject}</div>
              {t.bio && <div className="teacher-subject" style={{ marginTop: 6 }}>{t.bio}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------
   Admin
--------------------------------------------------------------- */
function AdminView({ isAdmin, setIsAdmin, applications, saveApplications, teachers, saveTeachers }) {
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  if (!isAdmin) {
    return (
      <section className="section container">
        <div className="admin-gate">
          <Seal size={70} icon={ShieldCheck} label="প্রশাসন" />
          <h2 className="h2" style={{ marginTop: 18 }}>অ্যাডমিন লগইন</h2>
          <div className="field" style={{ textAlign: "left" }}>
            <label>পাসওয়ার্ড</label>
            <input
              type="text"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(""); }}
              onKeyDown={e => e.key === "Enter" && (pw === ADMIN_PASSWORD ? setIsAdmin(true) : setPwError("ভুল পাসওয়ার্ড"))}
              placeholder="পাসওয়ার্ড লিখুন"
            />
            {pwError && <div className="field-error">{pwError}</div>}
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
            onClick={() => (pw === ADMIN_PASSWORD ? setIsAdmin(true) : setPwError("ভুল পাসওয়ার্ড"))}>
            প্রবেশ করুন
          </button>
          <div className="banner-note" style={{ marginTop: 18 }}>এটি একটি ডেমো — প্রোডাকশনে প্রকৃত অথেনটিকেশন প্রয়োজন।</div>
        </div>
      </section>
    );
  }

  return <AdminDashboard
    applications={applications} saveApplications={saveApplications}
    teachers={teachers} saveTeachers={saveTeachers}
    onLogout={() => setIsAdmin(false)}
  />;
}

function AdminDashboard({ applications, saveApplications, teachers, saveTeachers, onLogout }) {
  const [tab, setTab] = useState("applications");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = applications.filter(a =>
    (statusFilter === "all" || a.status === statusFilter) &&
    (typeFilter === "all" || a.courseType === typeFilter)
  ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const updateStatus = async (trackingId, status) => {
    const next = applications.map(a => a.trackingId === trackingId ? { ...a, status } : a);
    await saveApplications(next);
    setSelected(s => s ? { ...s, status } : s);
  };

  return (
    <section className="section container">
      <div className="admin-topbar">
        <div>
          <div className="eyebrow">অ্যাডমিন প্যানেল</div>
          <h2 className="h2" style={{ marginBottom: 0 }}>ড্যাশবোর্ড</h2>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="admin-tabs">
            <button className={`admin-tab ${tab === "applications" ? "active" : ""}`} onClick={() => setTab("applications")}>আবেদনসমূহ</button>
            <button className={`admin-tab ${tab === "teachers" ? "active" : ""}`} onClick={() => setTab("teachers")}>শিক্ষকবৃন্দ</button>
          </div>
          <button className="btn btn-ghost" onClick={onLogout}><LogOut size={15} /> লগআউট</button>
        </div>
      </div>

      {tab === "applications" && (
        <>
          <div className="filters-row">
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">সব স্ট্যাটাস</option>
              <option value="pending">পর্যালোচনাধীন</option>
              <option value="approved">অনুমোদিত</option>
              <option value="rejected">বাতিল</option>
            </select>
            <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">সব ধরন</option>
              <option value="free">ফ্রি</option>
              <option value="rpl">RPL</option>
            </select>
            <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--ink-soft)", alignSelf: "center" }}>
              মোট {toBn(filtered.length)}টি আবেদন
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">এই ফিল্টারে কোনো আবেদন পাওয়া যায়নি।</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>ট্র্যাকিং আইডি</th>
                    <th>নাম</th>
                    <th>কোর্স</th>
                    <th>ধরন</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.trackingId} onClick={() => setSelected(a)}>
                      <td className="tid-mono">{a.trackingId}</td>
                      <td>{a.name}</td>
                      <td>{a.courseName}</td>
                      <td><Badge type={a.courseType} /></td>
                      <td><StatusPill status={a.status} /></td>
                      <td>{new Date(a.submittedAt).toLocaleDateString("bn-BD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "teachers" && <TeacherAdmin teachers={teachers} saveTeachers={saveTeachers} />}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            <StatusPill status={selected.status} />
            <h2 className="h2" style={{ marginTop: 12, marginBottom: 4 }}>{selected.name}</h2>
            <div className="tid-mono" style={{ fontSize: 13, color: "var(--ink-soft)" }}>{selected.trackingId}</div>

            <div className="modal-photos">
              <div>
                {selected.photo ? <img src={selected.photo} /> : <div className="teacher-photo-fallback" style={{ height: 100, borderRadius: 8 }}><UserCircle2 size={26} /></div>}
                <div className="modal-photo-label">নিজের ছবি</div>
              </div>
              <div>
                {selected.nidPhoto ? <img src={selected.nidPhoto} /> : <div className="teacher-photo-fallback" style={{ height: 100, borderRadius: 8 }}><IdCard size={26} /></div>}
                <div className="modal-photo-label">NID/জন্মনিবন্ধন</div>
              </div>
              {selected.courseType === "rpl" && (
                <div>
                  {selected.certPhoto ? <img src={selected.certPhoto} /> : <div className="teacher-photo-fallback" style={{ height: 100, borderRadius: 8 }}><FileCheck size={26} /></div>}
                  <div className="modal-photo-label">অভিজ্ঞতার সনদ</div>
                </div>
              )}
            </div>

            <div className="review-row"><span>পিতা/অভিভাবক</span><span>{selected.fatherName}</span></div>
            <div className="review-row"><span>জন্ম তারিখ</span><span>{selected.dob}</span></div>
            <div className="review-row"><span>মোবাইল</span><span>{selected.phone}</span></div>
            <div className="review-row"><span>ঠিকানা</span><span>{selected.address}</span></div>
            <div className="review-row"><span>কোর্স</span><span>{selected.courseName}</span></div>
            <div className="review-row"><span>ধরন</span><span>{selected.courseType === "rpl" ? "RPL (পেইড)" : "ফ্রি"}</span></div>
            {selected.courseType === "rpl" && (
              <>
                <div className="review-row"><span>ফি</span><span>৳{toBn(selected.amount.toLocaleString("en-US"))}</span></div>
                <div className="review-row"><span>পেমেন্ট মাধ্যম</span><span>{selected.paymentMethod === "bkash" ? "bKash" : "Nagad"}</span></div>
                <div className="review-row"><span>পেমেন্ট নম্বর</span><span>{selected.paymentNumber}</span></div>
                <div className="review-row"><span>ট্রান্স্যাকশন আইডি</span><span>{selected.transactionId}</span></div>
              </>
            )}

            <div className="modal-actions">
              <button className="btn btn-approve" onClick={() => updateStatus(selected.trackingId, "approved")}><CheckCircle2 size={16} /> অনুমোদন করুন</button>
              <button className="btn btn-reject" onClick={() => updateStatus(selected.trackingId, "rejected")}><XCircle size={16} /> বাতিল করুন</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TeacherAdmin({ teachers, saveTeachers }) {
  const [form, setForm] = useState({ name: "", designation: "", subject: "", bio: "", photo: "" });
  const [adding, setAdding] = useState(false);

  const addTeacher = async () => {
    if (!form.name.trim() || !form.designation.trim()) return;
    setAdding(true);
    const rec = { id: `t_${Date.now()}`, ...form };
    try {
      await saveTeachers([...teachers, rec]);
      setForm({ name: "", designation: "", subject: "", bio: "", photo: "" });
    } finally {
      setAdding(false);
    }
  };

  const removeTeacher = async (id) => {
    await saveTeachers(teachers.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="teacher-form">
        <div style={{ fontWeight: 700, color: "var(--green-950)", marginBottom: 14 }}>নতুন শিক্ষক যুক্ত করুন</div>
        <div className="grid grid-2">
          <div className="field">
            <label>নাম <span className="req-star">*</span></label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field">
            <label>পদবি <span className="req-star">*</span></label>
            <input type="text" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="যেমন: প্রধান প্রশিক্ষক" />
          </div>
        </div>
        <div className="field">
          <label>বিষয়</label>
          <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="যেমন: ইলেকট্রিক্যাল ওয়্যারিং" />
        </div>
        <div className="field">
          <label>সংক্ষিপ্ত পরিচিতি</label>
          <textarea rows={2} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
        </div>
        <div className="field">
          <label>ছবি</label>
          <div style={{ maxWidth: 220 }}>
            <UploadBox label="ছবি আপলোড করুন" value={form.photo} onChange={v => setForm(f => ({ ...f, photo: v }))} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={addTeacher} disabled={adding}>
          {adding ? <Loader2 className="spin" size={16} /> : <Plus size={16} />} শিক্ষক যুক্ত করুন
        </button>
      </div>

      {teachers.length === 0 ? (
        <div className="empty-state">এখনো কোনো শিক্ষক যুক্ত করা হয়নি।</div>
      ) : (
        teachers.map(t => (
          <div className="teacher-admin-row" key={t.id}>
            {t.photo ? <img src={t.photo} /> : <div className="teacher-admin-avatar"><UserCircle2 size={26} /></div>}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{t.designation}{t.subject ? ` · ${t.subject}` : ""}</div>
            </div>
            <button className="btn btn-ghost" onClick={() => removeTeacher(t.id)}><Trash2 size={15} /></button>
          </div>
        ))
      )}
    </div>
  );
}
