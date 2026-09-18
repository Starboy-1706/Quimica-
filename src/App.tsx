import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Courses from "./components/Courses";
import Materials from "./components/Materials";
import Announcements from "./components/Announcements";
import Agenda from "./components/Agenda";
import Professor from "./components/Professor";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import LoginModal from "./components/admin/LoginModal";
import AdminPanel from "./components/admin/AdminPanel";
import { StoreProvider } from "./context/StoreContext";

export default function App() {
  return (
    <StoreProvider>
      <div className="noise relative min-h-screen">
        <Background />
        <Navbar />
        <main className="relative z-10">
          <Hero />
          <Courses />
          <Materials />
          <Announcements />
          <Agenda />
          <Professor />
          <Contact />
        </main>
        <div className="relative z-10">
          <Footer />
        </div>

        {/* Modals administrativos */}
        <LoginModal />
        <AdminPanel />
      </div>
    </StoreProvider>
  );
}
