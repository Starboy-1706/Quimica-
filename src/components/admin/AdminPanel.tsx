import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Bell,
  Mail,
  ShieldAlert,
  Settings,
  Plus,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  X,
  LogOut,
  ExternalLink,
  Pin,
  RefreshCw,
  Database,
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import type { MaterialCategory, NoticeType, Level } from "../../data/content";

export default function AdminPanel() {
  const {
    isAdminOpen,
    setIsAdminOpen,
    user,
    logout,
    isSupabase,
    supabaseStatus,
    syncWithSupabase,
    courses,
    addCourse,
    deleteCourse,
    materials,
    addMaterial,
    deleteMaterial,
    notices,
    addNotice,
    togglePinNotice,
    deleteNotice,
    inquiries,
    markInquiryRead,
    replyInquiry,
    deleteInquiry,
    auditLogs,
    profile,
    updateProfile,
    exportBackup,
    importBackup,
    resetToSeed,
  } = useStore();
  const [syncing, setSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState<"courses" | "materials" | "notices" | "inquiries" | "audit" | "settings">("courses");

  // Sub-forms state
  // Course modal
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseLevel, setCourseLevel] = useState<Level>("Grado");
  const [courseSemester, setCourseSemester] = useState("1.º semestre");
  const [courseCredits, setCourseCredits] = useState(6);
  const [courseRoom, setCourseRoom] = useState("Aula B-204");
  const [courseSchedule, setCourseSchedule] = useState("Lun y Mié · 09:00 – 11:00");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseFormula, setCourseFormula] = useState("n = m / M");
  const [courseAccent, setCourseAccent] = useState<"cyan" | "violet" | "emerald" | "amber">("cyan");

  // Material modal
  const [showMatForm, setShowMatForm] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matCourse, setMatCourse] = useState(courses[0]?.code || "QUI-101");
  const [matCategory, setMatCategory] = useState<MaterialCategory>("Apuntes");
  const [matFormat, setMatFormat] = useState<"PDF" | "PPTX" | "XLSX" | "DOCX">("PDF");
  const [matFile, setMatFile] = useState<File | null>(null);

  // Notice modal
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [noticeCourse, setNoticeCourse] = useState("General");
  const [noticeType, setNoticeType] = useState<NoticeType>("general");
  const [noticeDate, setNoticeDate] = useState("24 feb 2026");
  const [noticePinned, setNoticePinned] = useState(false);

  // Inquiries reply
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Settings profile form
  const [profName, setProfName] = useState(profile.name);
  const [profRole, setProfRole] = useState(profile.role);
  const [profDept, setProfDept] = useState(profile.department);
  const [profOffice, setProfOffice] = useState(profile.office);
  const [profHours, setProfHours] = useState(profile.officeHours);
  const [profEmail, setProfEmail] = useState(profile.email);
  const [profBio, setProfBio] = useState(profile.bio);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isAdminOpen || !user) return null;

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse({
      code: courseCode.toUpperCase().trim(),
      slug: courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: courseTitle,
      level: courseLevel,
      semester: courseSemester,
      credits: Number(courseCredits),
      room: courseRoom,
      schedule: courseSchedule,
      description: courseDesc,
      formula: courseFormula,
      accent: courseAccent,
    });
    setShowCourseForm(false);
    setCourseCode("");
    setCourseTitle("");
    setCourseDesc("");
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    addMaterial({
      title: matTitle,
      course: matCourse,
      category: matCategory,
      format: matFormat,
      file: matFile || undefined,
    });
    setShowMatForm(false);
    setMatTitle("");
    setMatFile(null);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    addNotice({
      title: noticeTitle,
      body: noticeBody,
      course: noticeCourse,
      type: noticeType,
      date: noticeDate,
      pinned: noticePinned,
    });
    setShowNoticeForm(false);
    setNoticeTitle("");
    setNoticeBody("");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profName,
      role: profRole,
      department: profDept,
      office: profOffice,
      officeHours: profHours,
      email: profEmail,
      bio: profBio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const ok = importBackup(text);
      if (ok) alert("Respaldo importado con éxito");
      else alert("Error al importar el archivo JSON");
    };
    reader.readAsText(file);
  };

  const unreadInquiries = inquiries.filter((i) => !i.read).length;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-ink-950/95 backdrop-blur-xl">
      {/* Sidebar */}
      <aside className="glass flex w-64 shrink-0 flex-col border-r border-white/[0.08] p-5">
        {/* Brand */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div>
            <span className="font-display text-base font-semibold text-white">Panel Interno</span>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
              Aula Docente · {user.role}
            </p>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="glass-chip grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-white"
            title="Ver sitio público"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="my-4 glass-soft rounded-2xl p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-cyan-400/20 to-violet-500/20 font-display text-sm font-bold text-cyan-300">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
              <p className="font-mono text-[10px] capitalize text-slate-400">{user.role}</p>
            </div>
          </div>

          {/* Database indicator */}
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
              <Database className="h-3 w-3 text-cyan-300" />
              {isSupabase ? (
                <span className="text-emerald-300 font-medium">Supabase Cloud</span>
              ) : (
                <span className="text-amber-300 font-medium">Local Storage</span>
              )}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                supabaseStatus === "connected"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : supabaseStatus === "connecting"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-500"
              }`}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1">
          {[
            { id: "courses", label: "Asignaturas", icon: BookOpen, badge: courses.length },
            { id: "materials", label: "Repositorio", icon: FileText, badge: materials.length },
            { id: "notices", label: "Avisos", icon: Bell, badge: notices.length },
            { id: "inquiries", label: "Consultas", icon: Mail, badge: unreadInquiries, alert: unreadInquiries > 0 },
            { id: "audit", label: "Auditoría", icon: ShieldAlert, badge: auditLogs.length },
            { id: "settings", label: "Ajustes y Respaldos", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-cyan-400/20 to-violet-500/20 text-white ring-1 ring-cyan-300/30 font-semibold"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${active ? "text-cyan-300" : "text-slate-500"}`} />
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      item.alert
                        ? "bg-rose-500/20 text-rose-300 font-bold"
                        : "glass-chip text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="space-y-2 border-t border-white/[0.08] pt-4">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl glass-chip px-3 py-2 text-[12.5px] text-slate-300 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 text-cyan-300" />
            Ver web pública
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12.5px] text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.08] px-8 py-4">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-semibold capitalize text-white">
              {activeTab === "courses" && "Gestión de Asignaturas"}
              {activeTab === "materials" && "Repositorio de Materiales"}
              {activeTab === "notices" && "Tablón de Avisos"}
              {activeTab === "inquiries" && "Bandeja de Consultas"}
              {activeTab === "audit" && "Bitácora de Auditoría"}
              {activeTab === "settings" && "Ajustes y Respaldos"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "courses" && (
              <button
                onClick={() => setShowCourseForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-md hover:brightness-110"
              >
                <Plus className="h-4 w-4" /> Nueva Asignatura
              </button>
            )}
            {activeTab === "materials" && (
              <button
                onClick={() => setShowMatForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-md hover:brightness-110"
              >
                <Upload className="h-4 w-4" /> Subir Material
              </button>
            )}
            {activeTab === "notices" && (
              <button
                onClick={() => setShowNoticeForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-md hover:brightness-110"
              >
                <Plus className="h-4 w-4" /> Publicar Aviso
              </button>
            )}
          </div>
        </header>

        {/* Tab Views */}
        <div className="p-8">
          {/* ================= COURSES TAB ================= */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                  <div key={c.code} className="glass glass-edge group relative flex flex-col rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                      <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-300">
                        {c.code}
                      </span>
                      <span className="glass-chip rounded-full px-2 py-0.5 font-mono text-[10px] text-slate-400">
                        {c.level}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-semibold text-white">{c.title}</h3>
                    <p className="mt-1 flex-1 text-[12.5px] text-slate-400 line-clamp-2">{c.description}</p>

                    <div className="mt-4 space-y-1 border-t border-white/[0.06] pt-3 font-mono text-[11px] text-slate-500">
                      <p>{c.schedule}</p>
                      <p>{c.room} · {c.credits} ECTS</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                      <span className="text-[12px] text-slate-400">{c.materials} materiales</span>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la asignatura ${c.code}?`)) deleteCourse(c.code);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= MATERIALS TAB ================= */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              <div className="glass glass-edge overflow-hidden rounded-2xl">
                <table className="w-full text-left text-[13px]">
                  <thead className="border-b border-white/[0.08] bg-white/[0.02] font-mono text-[10.5px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">Título del material</th>
                      <th className="px-5 py-3.5">Asignatura</th>
                      <th className="px-5 py-3.5">Categoría</th>
                      <th className="px-5 py-3.5">Formato</th>
                      <th className="px-5 py-3.5">Tamaño</th>
                      <th className="px-5 py-3.5">Fecha</th>
                      <th className="px-5 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">{m.title}</td>
                        <td className="px-5 py-3.5 font-mono text-cyan-300">{m.course}</td>
                        <td className="px-5 py-3.5 text-slate-400">{m.category}</td>
                        <td className="px-5 py-3.5">
                          <span className="glass-chip rounded px-1.5 py-0.5 font-mono text-[10.5px]">
                            {m.format}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{m.size}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{m.updated}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar «${m.title}»?`)) deleteMaterial(m.id);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= NOTICES TAB ================= */}
          {activeTab === "notices" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {notices.map((n) => (
                  <div key={n.id} className="glass glass-edge relative rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="glass-chip rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase text-cyan-300">
                          {n.type}
                        </span>
                        <span className="font-mono text-xs text-slate-400">{n.course} · {n.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePinNotice(n.id)}
                          className={`p-1.5 rounded-lg ${n.pinned ? "text-amber-300 glass-chip" : "text-slate-500 hover:text-slate-300"}`}
                          title={n.pinned ? "Desfijar" : "Fijar arriba"}
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteNotice(n.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 font-display text-base font-semibold text-white">{n.title}</h3>
                    <p className="mt-1 text-[13px] text-slate-400">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= INQUIRIES TAB ================= */}
          {activeTab === "inquiries" && (
            <div className="space-y-4">
              <p className="text-[13px] text-slate-400">
                Dudas enviadas en tiempo real por los estudiantes desde el formulario de contacto público.
              </p>
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className={`glass glass-edge rounded-2xl p-5 transition-all ${
                      !inq.read ? "ring-1 ring-cyan-300/40 bg-white/[0.04]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{inq.name}</span>
                          <span className="font-mono text-xs text-cyan-300">{inq.email}</span>
                          <span className="glass-chip rounded-full px-2 py-0.5 font-mono text-[10px] text-slate-400">
                            {inq.course}
                          </span>
                          {!inq.read && (
                            <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase text-cyan-300">
                              Nuevo
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{inq.date}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markInquiryRead(inq.id, !inq.read)}
                          className="glass-chip rounded-lg px-2.5 py-1 text-[11px] text-slate-300 hover:text-white"
                        >
                          {inq.read ? "Marcar no leído" : "Marcar leído"}
                        </button>
                        <button
                          onClick={() => deleteInquiry(inq.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-[13.5px] text-slate-200">{inq.message}</p>

                    {/* Reply note */}
                    {inq.replied && inq.replyNote && (
                      <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-[12.5px] text-emerald-300">
                        <span className="font-semibold">Respuesta interna:</span> {inq.replyNote}
                      </div>
                    )}

                    {/* Reply form */}
                    {replyId === inq.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escribe una nota o respuesta..."
                          className="glass-soft w-full rounded-xl p-3 text-[13px] text-white outline-none focus:ring-1 focus:ring-cyan-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (replyText.trim()) {
                                replyInquiry(inq.id, replyText);
                                setReplyId(null);
                                setReplyText("");
                              }
                            }}
                            className="rounded-lg bg-cyan-400 px-3 py-1 text-[12px] font-semibold text-ink-950"
                          >
                            Guardar nota
                          </button>
                          <button
                            onClick={() => setReplyId(null)}
                            className="glass-chip rounded-lg px-3 py-1 text-[12px] text-slate-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      !inq.replied && (
                        <button
                          onClick={() => {
                            setReplyId(inq.id);
                            setReplyText("");
                          }}
                          className="mt-3 text-[12px] text-cyan-300 hover:underline"
                        >
                          + Añadir nota / respuesta interna
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= AUDIT TAB ================= */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-slate-400">
                  Bitácora inmutable de todas las acciones del aula (quién, qué y cuándo).
                </p>
                <span className="font-mono text-xs text-slate-500">{auditLogs.length} eventos registrados</span>
              </div>

              <div className="glass glass-edge divide-y divide-white/[0.04] rounded-2xl overflow-hidden font-mono text-[12px]">
                {auditLogs.map((l) => (
                  <div key={l.id} className="flex items-start justify-between gap-4 p-4 hover:bg-white/[0.02]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-cyan-300">
                          {l.action}
                        </span>
                        <span className="text-slate-400">{l.actorName} ({l.actorRole})</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500">{l.entity}</span>
                      </div>
                      <p className="mt-1 font-sans text-[13px] text-slate-200">{l.summary}</p>
                    </div>
                    <span className="text-slate-500 text-[11px] shrink-0">{l.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SETTINGS & BACKUPS TAB ================= */}
          {activeTab === "settings" && (
            <div className="space-y-8 max-w-2xl">
              {/* Profile section */}
              <form onSubmit={handleSaveProfile} className="glass glass-edge rounded-3xl p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold text-white">Perfil del Profesor</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Nombre público</label>
                    <input
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="glass-soft w-full rounded-xl p-2.5 text-[13px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Cargo / Título</label>
                    <input
                      value={profRole}
                      onChange={(e) => setProfRole(e.target.value)}
                      className="glass-soft w-full rounded-xl p-2.5 text-[13px] text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Departamento</label>
                    <input
                      value={profDept}
                      onChange={(e) => setProfDept(e.target.value)}
                      className="glass-soft w-full rounded-xl p-2.5 text-[13px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Correo institucional</label>
                    <input
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      className="glass-soft w-full rounded-xl p-2.5 text-[13px] text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Despacho</label>
                    <input
                      value={profOffice}
                      onChange={(e) => setProfOffice(e.target.value)}
                      className="glass-soft w-full rounded-xl p-2.5 text-[13px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Horario de tutorías</label>
                    <input
                      value={profHours}
                      onChange={(e) => setProfHours(e.target.value)}
                      className="glass-soft w-full rounded-xl p-2.5 text-[13px] text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-slate-400">Biografía / Mensaje</label>
                  <textarea
                    rows={3}
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    className="glass-soft w-full rounded-xl p-2.5 text-[13px] text-white outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {savedSuccess && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Guardado en la base de datos
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 text-[13px] font-semibold text-ink-950"
                  >
                    Guardar Perfil
                  </button>
                </div>
              </form>

              {/* Database Status & Supabase */}
              <div className="glass glass-edge rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">Conexión a Base de Datos</h3>
                    <p className="text-[12.5px] text-slate-400">
                      {isSupabase
                        ? "Conectado directamente a tu proyecto de Supabase en la nube."
                        : "Funcionando con base de datos local (localStorage). Para conectar Supabase, añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."}
                    </p>
                  </div>
                  {isSupabase && (
                    <button
                      type="button"
                      disabled={syncing}
                      onClick={async () => {
                        setSyncing(true);
                        await syncWithSupabase();
                        setSyncing(false);
                      }}
                      className="glass-chip flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-cyan-300 hover:text-white"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                      Sincronizar
                    </button>
                  )}
                </div>

                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4 text-[12px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Motor de datos:</span>
                    <span className="font-mono font-semibold text-white">
                      {isSupabase ? "Supabase PostgreSQL + Storage" : "Navegador (Offline Indexed/LocalStorage)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estado de sincronización:</span>
                    <span className="font-mono text-emerald-300">
                      {supabaseStatus === "connected" && "🟢 Conectado y sincronizado"}
                      {supabaseStatus === "connecting" && "🟡 Sincronizando..."}
                      {supabaseStatus === "error" && "🔴 Error de conexión (usando réplica local)"}
                      {supabaseStatus === "not_configured" && "⚪ Modo local activo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Database Backups */}
              <div className="glass glass-edge rounded-3xl p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold text-white">Respaldos JSON</h3>
                <p className="text-[13px] text-slate-400">
                  Descarga un respaldo completo en JSON o restaura datos previos.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={exportBackup}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400/20 border border-cyan-400/40 px-4 py-2.5 text-[13px] font-semibold text-cyan-200 hover:bg-cyan-400/30"
                  >
                    <Download className="h-4 w-4" /> Exportar respaldo JSON
                  </button>

                  <label className="inline-flex items-center gap-2 rounded-xl glass-chip px-4 py-2.5 text-[13px] font-semibold text-slate-200 hover:text-white cursor-pointer">
                    <Upload className="h-4 w-4" /> Importar respaldo JSON
                    <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                  </label>

                  <button
                    onClick={() => {
                      if (confirm("¿Restaurar la base de datos a los valores de semilla iniciales? Se perderán los cambios no respaldados.")) {
                        resetToSeed();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] text-rose-400 hover:bg-rose-500/10"
                  >
                    <RefreshCw className="h-4 w-4" /> Restaurar semilla
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: CREATE COURSE ================= */}
      {showCourseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <div className="glass glass-edge w-full max-w-lg rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-white">Nueva Asignatura</h3>
              <button onClick={() => setShowCourseForm(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Código</label>
                  <input
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="QUI-301"
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Nivel</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as Level)}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none [&>option]:bg-ink-900"
                  >
                    <option value="Grado">Grado</option>
                    <option value="Máster">Máster</option>
                    <option value="Doctorado">Doctorado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400">Título</label>
                <input
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Química Inorgánica II"
                  className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Semestre</label>
                  <input
                    value={courseSemester}
                    onChange={(e) => setCourseSemester(e.target.value)}
                    placeholder="1.º semestre"
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Créditos</label>
                  <input
                    type="number"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(Number(e.target.value))}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Color</label>
                  <select
                    value={courseAccent}
                    onChange={(e) => setCourseAccent(e.target.value as any)}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none [&>option]:bg-ink-900"
                  >
                    <option value="cyan">Cyan</option>
                    <option value="violet">Violeta</option>
                    <option value="emerald">Esmeralda</option>
                    <option value="amber">Ámbar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Horario</label>
                  <input
                    value={courseSchedule}
                    onChange={(e) => setCourseSchedule(e.target.value)}
                    placeholder="Lun y Mié · 10:00 – 12:00"
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Aula</label>
                  <input
                    value={courseRoom}
                    onChange={(e) => setCourseRoom(e.target.value)}
                    placeholder="Aula B-204"
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400">Fórmula destacada</label>
                <input
                  value={courseFormula}
                  onChange={(e) => setCourseFormula(e.target.value)}
                  placeholder="ΔG = ΔH − TΔS"
                  className="glass-soft w-full rounded-xl p-2.5 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400">Descripción</label>
                <textarea
                  rows={2}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Descripción de la materia..."
                  className="glass-soft w-full rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className="glass-chip rounded-xl px-4 py-2 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 font-semibold text-ink-950"
                >
                  Crear Asignatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPLOAD MATERIAL ================= */}
      {showMatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <div className="glass glass-edge w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-white">Subir Material al Repositorio</h3>
              <button onClick={() => setShowMatForm(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[11px] font-mono text-slate-400">Título del archivo</label>
                <input
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Guía Práctica 6 · Espectroscopía"
                  className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Asignatura</label>
                  <select
                    value={matCourse}
                    onChange={(e) => setMatCourse(e.target.value)}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none [&>option]:bg-ink-900"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Categoría</label>
                  <select
                    value={matCategory}
                    onChange={(e) => setMatCategory(e.target.value as MaterialCategory)}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none [&>option]:bg-ink-900"
                  >
                    <option value="Apuntes">Apuntes</option>
                    <option value="Guías de laboratorio">Guías de laboratorio</option>
                    <option value="Ejercicios resueltos">Ejercicios resueltos</option>
                    <option value="Presentaciones">Presentaciones</option>
                    <option value="Programas">Programas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Formato</label>
                  <select
                    value={matFormat}
                    onChange={(e) => setMatFormat(e.target.value as any)}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none [&>option]:bg-ink-900"
                  >
                    <option value="PDF">PDF</option>
                    <option value="PPTX">PPTX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="DOCX">DOCX</option>
                  </select>
                </div>
              </div>

              {/* Real file drag & drop */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Archivo (opcional)</label>
                <label className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 p-5 hover:bg-white/[0.04] cursor-pointer transition-colors">
                  <Upload className="h-6 w-6 text-cyan-300 mb-2" />
                  <span className="text-xs text-slate-300">
                    {matFile ? matFile.name : "Haz clic o arrastra un archivo aquí"}
                  </span>
                  <span className="text-[10.5px] text-slate-500 mt-1">Máx. 25 MB</span>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setMatFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMatForm(false)}
                  className="glass-chip rounded-xl px-4 py-2 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2 font-semibold text-ink-950"
                >
                  Guardar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NOTICE ================= */}
      {showNoticeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <div className="glass glass-edge w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-white">Publicar Aviso</h3>
              <button onClick={() => setShowNoticeForm(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[11px] font-mono text-slate-400">Título</label>
                <input
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="Segundo parcial · Temas 5 a 8"
                  className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Tipología</label>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value as NoticeType)}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none [&>option]:bg-ink-900"
                  >
                    <option value="general">General</option>
                    <option value="examen">Examen</option>
                    <option value="entrega">Entrega</option>
                    <option value="cambio">Cambio de aula</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400">Asignatura</label>
                  <select
                    value={noticeCourse}
                    onChange={(e) => setNoticeCourse(e.target.value)}
                    className="glass-soft w-full rounded-xl p-2.5 text-white outline-none [&>option]:bg-ink-900"
                  >
                    <option value="General">General</option>
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400">Fecha del evento</label>
                <input
                  value={noticeDate}
                  onChange={(e) => setNoticeDate(e.target.value)}
                  placeholder="28 feb 2026"
                  className="glass-soft w-full rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400">Cuerpo del aviso</label>
                <textarea
                  required
                  rows={3}
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  placeholder="Detalles sobre el examen, lugar, hora y material permitido..."
                  className="glass-soft w-full rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={noticePinned}
                  onChange={(e) => setNoticePinned(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-slate-300">Fijar aviso en la parte superior</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoticeForm(false)}
                  className="glass-chip rounded-xl px-4 py-2 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 px-5 py-2 font-semibold text-ink-950"
                >
                  Publicar Aviso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
