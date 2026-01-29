import { useState } from "react";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import { Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import { ThemeProvider } from "@/components/context/theme-provider";
import LogInPage from "./pages/LogInPage";
import { AuthProvider } from "./components/context/authContext";
import Playground from "./pages/Playground";
import { SnippetProvider } from "./components/context/snippetContext";
import ProblemsPage from "./pages/ProblemsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <SnippetProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LogInPage />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </SnippetProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
