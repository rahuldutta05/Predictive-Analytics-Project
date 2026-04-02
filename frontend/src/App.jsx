import React, { useMemo, useState } from "react";
import "./index.css";
import "./styles/AppShell.css";

import Header    from "./components/Header";
import BottomNav from "./components/BottomNav";

import Login        from "./pages/Login";
import FarmerTools  from "./pages/FarmerTools";
import CropRecommend from "./pages/CropRecommend";
import History      from "./pages/History";
import { t }        from "./i18n";

function App() {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // "croprecommend" is now the landing / home page (replaces dashboard)
  const [page, setPage] = useState("croprecommend");
  const isAuthed = useMemo(() => Boolean(localStorage.getItem("token")), []);
  const [lang, setLang] = useState(() => localStorage.getItem("ct_lang") || "en");

  // Lifted cropResult so FarmerTools can show crop-specific advice
  const [cropResult, setCropResult] = useState(null);

  const handleChangeLang = (next) => {
    setLang(next);
    localStorage.setItem("ct_lang", next);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("full_name");
    localStorage.removeItem("user_email");
    setPage("croprecommend");
    window.location.reload();
  };

  if (!isAuthed) {
    return (
      <div className="app-shell" data-theme={theme}>
        <div className="app-content app-pad-bottom">
          <Login
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            onChangeLang={handleChangeLang}
            onLogin={() => {
              setPage("croprecommend");
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "croprecommend", label: t(lang, "navCropAI"),   icon: "🌾" },
    { id: "farmertools",   label: t(lang, "navTools"),     icon: "🧰", farmerTab: true },
    { id: "history",       label: t(lang, "navHistory"),   icon: "📈" },
  ];

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="app-content app-pad-bottom">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          lang={lang}
          onChangeLang={handleChangeLang}
        />

        <div>
          {page === "croprecommend" && (
            <CropRecommend
              theme={theme}
              lang={lang}
              onCropResultChange={setCropResult}
            />
          )}
          {page === "farmertools" && (
            <FarmerTools
              lang={lang}
              recommendedCrops={cropResult?.top_crops || null}
            />
          )}
          {page === "history" && <History lang={lang} />}
        </div>

        <BottomNav
          active={page}
          items={navItems.concat([{ id: "logout", label: t(lang, "navLogout"), icon: "🚪" }])}
          onNavigate={(id) => {
            if (id === "logout") handleLogout();
            else setPage(id);
          }}
        />
      </div>
    </div>
  );
}

export default App;
