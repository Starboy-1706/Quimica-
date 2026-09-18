import React, { createContext, useContext, useEffect, useState } from "react";
import {
  type Course,
  type Material,
  type Notice,
  type AgendaEvent,
  type MaterialCategory,
  courses as seedCourses,
  materials as seedMaterials,
  notices as seedNotices,
  agendaEvents as seedAgenda,
  profile as seedProfile,
} from "../data/content";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "administrador" | "editor";
  avatar?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  course: string;
  message: string;
  date: string;
  read: boolean;
  replied?: boolean;
  replyNote?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  summary: string;
}

export interface ProfileData {
  name: string;
  role: string;
  department: string;
  office: string;
  officeHours: string;
  email: string;
  bio: string;
  specialties: string[];
}

export type SupabaseStatus = "connected" | "connecting" | "error" | "not_configured";

interface StoreContextType {
  // Auth
  user: User | null;
  login: (email: string, pass: string) => Promise<{ ok: boolean; error?: string }> | { ok: boolean; error?: string };
  logout: () => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;

  // Supabase Status
  supabaseStatus: SupabaseStatus;
  isSupabase: boolean;
  syncWithSupabase: () => Promise<void>;

  // Data
  courses: Course[];
  materials: Material[];
  notices: Notice[];
  agendaEvents: AgendaEvent[];
  inquiries: Inquiry[];
  auditLogs: AuditLog[];
  profile: ProfileData;

  // Actions
  addCourse: (course: Omit<Course, "materials">) => Promise<void> | void;
  updateCourse: (code: string, data: Partial<Course>) => Promise<void> | void;
  deleteCourse: (code: string) => Promise<void> | void;

  addMaterial: (mat: { title: string; course: string; category: MaterialCategory; format: Material["format"]; file?: File }) => Promise<void> | void;
  deleteMaterial: (id: number) => Promise<void> | void;

  addNotice: (notice: Omit<Notice, "id">) => Promise<void> | void;
  togglePinNotice: (id: number) => Promise<void> | void;
  deleteNotice: (id: number) => Promise<void> | void;

  submitInquiry: (inq: Omit<Inquiry, "id" | "date" | "read">) => Promise<void> | void;
  markInquiryRead: (id: string, read?: boolean) => Promise<void> | void;
  replyInquiry: (id: string, note: string) => Promise<void> | void;
  deleteInquiry: (id: string) => Promise<void> | void;

  updateProfile: (data: Partial<ProfileData>) => Promise<void> | void;
  exportBackup: () => void;
  importBackup: (jsonString: string) => boolean;
  resetToSeed: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  USER: "aula_user_session",
  COURSES: "aula_courses",
  MATERIALS: "aula_materials",
  NOTICES: "aula_notices",
  AGENDA: "aula_agenda",
  INQUIRIES: "aula_inquiries",
  AUDIT: "aula_audit_logs",
  PROFILE: "aula_profile",
};

const DEMO_USERS: Record<string, { pass: string; user: User }> = {
  "wilmer@aula.edu": {
    pass: "Aula#2026",
    user: { id: "u-1", name: "Prof. Wilmer", email: "wilmer@aula.edu", role: "administrador" },
  },
  "ayudante@aula.edu": {
    pass: "Ayudante#2026",
    user: { id: "u-2", name: "Dra. Sofía Ramos", email: "ayudante@aula.edu", role: "editor" },
  },
};

const initialInquiries: Inquiry[] = [
  {
    id: "inq-1",
    name: "Carlos Mendoza",
    email: "carlos.m@estudiante.edu",
    course: "QUI-205",
    message: "Profesor, ¿el rendimiento de la aspirina se calcula sobre la masa de ácido salicílico o del anhídrido acético?",
    date: "14 feb 2026 · 10:24",
    read: false,
  },
  {
    id: "inq-2",
    name: "Elena Vázquez",
    email: "elena.v@estudiante.edu",
    course: "QUI-101",
    message: "Buenos días, ¿las tutorías de este jueves son presenciales o por videollamada?",
    date: "13 feb 2026 · 16:45",
    read: true,
    replied: true,
    replyNote: "Respondido por correo: presenciales en despacho 3.12.",
  },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>(
    isSupabaseConfigured ? "connecting" : "not_configured"
  );

  // Auth state
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Entities
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.COURSES);
      return s ? JSON.parse(s) : seedCourses;
    } catch {
      return seedCourses;
    }
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return s ? JSON.parse(s) : seedMaterials;
    } catch {
      return seedMaterials;
    }
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.NOTICES);
      return s ? JSON.parse(s) : seedNotices;
    } catch {
      return seedNotices;
    }
  });

  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.AGENDA);
      return s ? JSON.parse(s) : seedAgenda;
    } catch {
      return seedAgenda;
    }
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      return s ? JSON.parse(s) : initialInquiries;
    } catch {
      return initialInquiries;
    }
  });

  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return s ? JSON.parse(s) : seedProfile;
    } catch {
      return seedProfile;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return s
        ? JSON.parse(s)
        : [
            {
              id: "aud-init",
              timestamp: "14 feb 2026 · 09:00",
              actorName: "Sistema",
              actorRole: "sistema",
              action: "sistema.arranque",
              entity: "plataforma",
              summary: "Base de datos inicializada",
            },
          ];
    } catch {
      return [];
    }
  });

  // Sync with Supabase on Mount
  const syncWithSupabase = async () => {
    if (!supabase || !isSupabaseConfigured) {
      setSupabaseStatus("not_configured");
      return;
    }

    try {
      setSupabaseStatus("connecting");

      // 1. Fetch Courses
      const { data: dbCourses, error: cErr } = await supabase.from("courses").select("*");
      if (!cErr && dbCourses && dbCourses.length > 0) {
        setCourses(
          dbCourses.map((c: any) => ({
            code: c.code,
            slug: c.slug || c.code.toLowerCase(),
            title: c.title,
            level: c.level || "Grado",
            semester: c.semester || "1.º semestre",
            credits: Number(c.credits) || 6,
            room: c.room || "Aula B-204",
            schedule: c.schedule || "Lun y Mié",
            description: c.description || "",
            formula: c.formula || "n = m / M",
            materials: Number(c.materials) || 0,
            accent: c.accent || "cyan",
          }))
        );
      }

      // 2. Fetch Materials
      const { data: dbMaterials, error: mErr } = await supabase.from("course_materials").select("*");
      if (!mErr && dbMaterials && dbMaterials.length > 0) {
        setMaterials(
          dbMaterials.map((m: any) => ({
            id: Number(m.id),
            title: m.title,
            course: m.course,
            category: m.category,
            format: m.format || "PDF",
            size: m.size || "1.4 MB",
            updated: m.updated || "Reciente",
            downloads: Number(m.downloads) || 0,
          }))
        );
      }

      // 3. Fetch Notices
      const { data: dbNotices, error: nErr } = await supabase.from("course_announcements").select("*");
      if (!nErr && dbNotices && dbNotices.length > 0) {
        setNotices(
          dbNotices.map((n: any) => ({
            id: Number(n.id),
            type: n.type || "general",
            course: n.course || "General",
            title: n.title,
            body: n.body,
            date: n.date || "Reciente",
            pinned: Boolean(n.pinned),
          }))
        );
      }

      // 4. Fetch Profile
      const { data: dbProfile, error: pErr } = await supabase.from("professor_profile").select("*").limit(1).single();
      if (!pErr && dbProfile) {
        setProfile({
          name: dbProfile.name || seedProfile.name,
          role: dbProfile.role || seedProfile.role,
          department: dbProfile.department || seedProfile.department,
          office: dbProfile.office || seedProfile.office,
          officeHours: dbProfile.office_hours || dbProfile.officeHours || seedProfile.officeHours,
          email: dbProfile.email || seedProfile.email,
          bio: dbProfile.bio || seedProfile.bio,
          specialties: Array.isArray(dbProfile.specialties) ? dbProfile.specialties : seedProfile.specialties,
        });
      }

      // 5. Fetch Inquiries
      const { data: dbInquiries, error: iErr } = await supabase.from("inquiries").select("*");
      if (!iErr && dbInquiries && dbInquiries.length > 0) {
        setInquiries(
          dbInquiries.map((i: any) => ({
            id: String(i.id),
            name: i.name,
            email: i.email,
            course: i.course,
            message: i.message,
            date: i.date,
            read: Boolean(i.read),
            replied: Boolean(i.replied),
            replyNote: i.reply_note || i.replyNote,
          }))
        );
      }

      setSupabaseStatus("connected");
    } catch (err) {
      console.warn("Error al sincronizar con Supabase, usando respaldo local:", err);
      setSupabaseStatus("error");
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      syncWithSupabase();
    }
  }, []);

  // Sync to localStorage as persistent offline cache
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch {}
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch {}
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    } catch {}
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENDA, JSON.stringify(agendaEvents));
    } catch {}
  }, [agendaEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch {}
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  // Audit helper
  const logAudit = async (action: string, entity: string, summary: string) => {
    const now = new Date();
    const formatted = `${now.getDate()} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][now.getMonth()]} ${now.getFullYear()} · ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: formatted,
      actorName: user ? user.name : "Anónimo",
      actorRole: user ? user.role : "público",
      action,
      entity,
      summary,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("audit_logs").insert([
          {
            timestamp: formatted,
            actor_name: newLog.actorName,
            actor_role: newLog.actorRole,
            action,
            entity,
            summary,
          },
        ]);
      } catch {}
    }
  };

  // Auth actions
  const login = async (email: string, pass: string) => {
    const trimmed = email.trim().toLowerCase();

    // 1. Try Supabase Auth if available
    if (supabase && isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: trimmed,
          password: pass,
        });
        if (!authError && authData.user) {
          const u: User = {
            id: authData.user.id,
            name: authData.user.user_metadata?.full_name || authData.user.email?.split("@")[0] || "Docente",
            email: authData.user.email || trimmed,
            role: "administrador",
          };
          setUser(u);
          logAudit("auth.login_supabase", "user", `${u.name} inició sesión vía Supabase Auth`);
          return { ok: true };
        }
      } catch {}
    }

    // 2. Fallback to demo users
    const found = DEMO_USERS[trimmed];
    if (found && found.pass === pass) {
      setUser(found.user);
      logAudit("auth.login", "user", `${found.user.name} inició sesión (${found.user.role})`);
      return { ok: true };
    }

    logAudit("auth.login_fallido", "user", `Intento fallido con correo ${trimmed}`);
    return { ok: false, error: "Credenciales incorrectas. Usa wilmer@aula.edu / Aula#2026" };
  };

  const logout = async () => {
    if (user) logAudit("auth.logout", "user", `${user.name} cerró sesión`);
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setIsAdminOpen(false);
  };

  // Course actions
  const addCourse = async (data: Omit<Course, "materials">) => {
    const newCourse: Course = { ...data, materials: 0 };
    setCourses((prev) => [newCourse, ...prev]);
    logAudit("curso.creado", "courses", `Creó la asignatura ${newCourse.code} · ${newCourse.title}`);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("courses").insert([newCourse]);
      } catch (err) {
        console.warn("Error guardando curso en Supabase:", err);
      }
    }
  };

  const updateCourse = async (code: string, data: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.code === code ? { ...c, ...data } : c)));
    logAudit("curso.actualizado", "courses", `Actualizó datos de ${code}`);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("courses").update(data).eq("code", code);
      } catch (err) {
        console.warn("Error actualizando curso en Supabase:", err);
      }
    }
  };

  const deleteCourse = async (code: string) => {
    setCourses((prev) => prev.filter((c) => c.code !== code));
    logAudit("curso.eliminado", "courses", `Eliminó la asignatura ${code}`);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("courses").delete().eq("code", code);
      } catch (err) {
        console.warn("Error eliminando curso en Supabase:", err);
      }
    }
  };

  // Material actions (supports Supabase Storage bucket 'materiales')
  const addMaterial = async (mat: {
    title: string;
    course: string;
    category: MaterialCategory;
    format: Material["format"];
    file?: File;
  }) => {
    const nextId = materials.length ? Math.max(...materials.map((m) => m.id)) + 1 : 1;
    const now = new Date();
    const formatted = `${String(now.getDate()).padStart(2, "0")} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][now.getMonth()]} ${now.getFullYear()}`;
    const sizeStr = mat.file ? `${(mat.file.size / (1024 * 1024)).toFixed(1).replace(".", ",")} MB` : "1,4 MB";

    let fileUrl = "";

    // Upload to Supabase Storage if file and credentials exist
    if (supabase && isSupabaseConfigured && mat.file) {
      try {
        const filePath = `${mat.course.toLowerCase()}/${Date.now()}-${mat.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("materiales")
          .upload(filePath, mat.file);

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage.from("materiales").getPublicUrl(uploadData.path);
          fileUrl = publicUrlData?.publicUrl || "";
        }
      } catch (err) {
        console.warn("Subida a Supabase Storage omitida:", err);
      }
    }

    const newMat: Material = {
      id: nextId,
      title: mat.title,
      course: mat.course,
      category: mat.category,
      format: mat.format,
      size: sizeStr,
      updated: formatted,
      downloads: 0,
    };

    setMaterials((prev) => [newMat, ...prev]);
    setCourses((prev) =>
      prev.map((c) => (c.code === mat.course ? { ...c, materials: c.materials + 1 } : c))
    );
    logAudit("material.subido", "course_materials", `Subió «${mat.title}» (${mat.format}) a ${mat.course}`);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("course_materials").insert([
          {
            ...newMat,
            file_url: fileUrl || null,
          },
        ]);
      } catch (err) {
        console.warn("Error guardando material en Supabase:", err);
      }
    }
  };

  const deleteMaterial = async (id: number) => {
    const mat = materials.find((m) => m.id === id);
    if (!mat) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setCourses((prev) =>
      prev.map((c) => (c.code === mat.course ? { ...c, materials: Math.max(0, c.materials - 1) } : c))
    );
    logAudit("material.eliminado", "course_materials", `Eliminó «${mat.title}» de ${mat.course}`);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("course_materials").delete().eq("id", id);
      } catch (err) {
        console.warn("Error eliminando material en Supabase:", err);
      }
    }
  };

  // Notice actions
  const addNotice = async (noticeData: Omit<Notice, "id">) => {
    const nextId = notices.length ? Math.max(...notices.map((n) => n.id)) + 1 : 1;
    const newNotice: Notice = { ...noticeData, id: nextId };
    setNotices((prev) => [newNotice, ...prev]);
    logAudit("aviso.creado", "course_announcements", `Publicó aviso «${newNotice.title}» (${newNotice.type})`);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("course_announcements").insert([newNotice]);
      } catch (err) {
        console.warn("Error guardando aviso en Supabase:", err);
      }
    }
  };

  const togglePinNotice = async (id: number) => {
    const notice = notices.find((n) => n.id === id);
    if (!notice) return;
    const updatedPinned = !notice.pinned;

    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: updatedPinned } : n))
    );

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("course_announcements").update({ pinned: updatedPinned }).eq("id", id);
      } catch {}
    }
  };

  const deleteNotice = async (id: number) => {
    const n = notices.find((item) => item.id === id);
    setNotices((prev) => prev.filter((item) => item.id !== id));
    if (n) {
      logAudit("aviso.eliminado", "course_announcements", `Eliminó aviso «${n.title}»`);
      if (supabase && isSupabaseConfigured) {
        try {
          await supabase.from("course_announcements").delete().eq("id", id);
        } catch {}
      }
    }
  };

  // Inquiry actions (from student contact form)
  const submitInquiry = async (inqData: Omit<Inquiry, "id" | "date" | "read">) => {
    const now = new Date();
    const formatted = `${now.getDate()} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][now.getMonth()]} ${now.getFullYear()} · ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const newInq: Inquiry = {
      id: `inq-${Date.now()}`,
      ...inqData,
      date: formatted,
      read: false,
    };
    setInquiries((prev) => [newInq, ...prev]);
    logAudit("consulta.recibida", "inquiries", `Nueva consulta de ${inqData.name} (${inqData.course})`);

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("inquiries").insert([
          {
            id: newInq.id,
            name: newInq.name,
            email: newInq.email,
            course: newInq.course,
            message: newInq.message,
            date: newInq.date,
            read: false,
          },
        ]);
      } catch (err) {
        console.warn("Error guardando consulta en Supabase:", err);
      }
    }
  };

  const markInquiryRead = async (id: string, read = true) => {
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, read } : inq)));
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("inquiries").update({ read }).eq("id", id);
      } catch {}
    }
  };

  const replyInquiry = async (id: string, note: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, replied: true, replyNote: note, read: true } : inq))
    );
    logAudit("consulta.respondida", "inquiries", `Registró respuesta interna a la consulta ${id}`);
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("inquiries").update({ replied: true, reply_note: note, read: true }).eq("id", id);
      } catch {}
    }
  };

  const deleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("inquiries").delete().eq("id", id);
      } catch {}
    }
  };

  // Profile actions
  const updateProfile = async (data: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...data }));
    logAudit("ajustes.perfil_actualizado", "professor_profile", "Actualizó los datos del perfil docente");

    if (supabase && isSupabaseConfigured) {
      try {
        const payload: any = { ...data };
        if (data.officeHours) {
          payload.office_hours = data.officeHours;
        }
        await supabase.from("professor_profile").upsert([payload]);
      } catch (err) {
        console.warn("Error guardando perfil en Supabase:", err);
      }
    }
  };

  // Backup actions
  const exportBackup = () => {
    const backup = {
      version: "aula-docente-glass-v1",
      exportedAt: new Date().toISOString(),
      supabaseConnected: isSupabaseConfigured,
      profile,
      courses,
      materials,
      notices,
      agendaEvents,
      inquiries,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aula-docente-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit("respaldo.exportado", "site_settings", "Descargó un respaldo completo de la base de datos");
  };

  const importBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== "object") return false;
      if (data.profile) setProfile(data.profile);
      if (Array.isArray(data.courses)) setCourses(data.courses);
      if (Array.isArray(data.materials)) setMaterials(data.materials);
      if (Array.isArray(data.notices)) setNotices(data.notices);
      if (Array.isArray(data.agendaEvents)) setAgendaEvents(data.agendaEvents);
      if (Array.isArray(data.inquiries)) setInquiries(data.inquiries);
      logAudit("respaldo.importado", "site_settings", "Restauró la base de datos desde un archivo JSON");
      return true;
    } catch {
      return false;
    }
  };

  const resetToSeed = () => {
    setCourses(seedCourses);
    setMaterials(seedMaterials);
    setNotices(seedNotices);
    setAgendaEvents(seedAgenda);
    setInquiries(initialInquiries);
    setProfile(seedProfile);
    logAudit("respaldo.reset_semilla", "site_settings", "Restauró la base de datos a los valores de semilla");
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        login,
        logout,
        isLoginOpen,
        setIsLoginOpen,
        isAdminOpen,
        setIsAdminOpen,
        supabaseStatus,
        isSupabase: isSupabaseConfigured,
        syncWithSupabase,
        courses,
        materials,
        notices,
        agendaEvents,
        inquiries,
        auditLogs,
        profile,
        addCourse,
        updateCourse,
        deleteCourse,
        addMaterial,
        deleteMaterial,
        addNotice,
        togglePinNotice,
        deleteNotice,
        submitInquiry,
        markInquiryRead,
        replyInquiry,
        deleteInquiry,
        updateProfile,
        exportBackup,
        importBackup,
        resetToSeed,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
};
