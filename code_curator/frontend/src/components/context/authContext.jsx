import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Storing full user data now instead of just pieces
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Keep these for backward compatibility if other components use them directly from context
  const username = userData?.username || "";
  const userId = userData?._id || "";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let isTokenAvailable = false;

        if (accessToken && refreshToken) {
          isTokenAvailable = true;
        }

        if (isTokenAvailable) {
          // Add header for authorization
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          setIsLoggedIn(true);
          setUserData(response.data.user);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        console.log(error);

        // Handle token Expiration
        if (error.response?.status === 401) {
          await refreshAccessToken();
        }
      }
    };

    fetchUserData();
  }, [accessToken, refreshToken]);

  const login = (user) => {
    setIsLoggedIn(true);
    setUserData(user);
  };

  const logout = async () => {
    try {
      // Call the logout route on the backend if needed, or just clear local
      try {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/logout`);
      } catch (e) { console.error(e) }

      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // We can't navigate here easily unless we strip AuthProvider to use a hook or pass navigate
      // But typically AuthProvider wraps Router, so useNavigate is not available inside it unless it's a child of Router.
      // In main.jsx, AuthProvider is child of BrowserRouter? Let's check.
      // Yes: BrowserRouter > App > AuthProvider. NO WAIT.
      // main.jsx: <BrowserRouter> <App /> </BrowserRouter>
      // App.jsx: <AuthProvider> ... </AuthProvider>
      // So AuthProvider is inside Router. So we can use useNavigate!
      // I'll add useNavigate.

    } catch (error) {
      console.log(error);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/new-access-token`, { refreshToken }, { withCredentials: true });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      // Force reload or just let the effect run? 
      // Effect runs on dependency change.
    } catch (error) {
      console.log(error);
      // logout(); // Can't call logout easily if it uses navigate, be careful of loops
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  const markProblemAsSolved = async (slug) => {
    try {
      // Need token for this request
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/solve-problem`,
        { slug },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.solvedProblems) {
        setUserData(prev => ({
          ...prev,
          solvedProblems: response.data.solvedProblems
        }));
      }
      return true;
    } catch (error) {
      console.error("Error marking problem as solved:", error);
      return false;
    }
  }

  // Custom hook for navigation needs to be inside a component inside Router.
  // We can't use useNavigate here if AuthProvider is NOT inside Router.
  // In main.jsx: BrowserRouter wraps App. App contains AuthProvider.
  // So AuthProvider IS inside Router.
  // But I need to import useNavigate.

  // FIX: I will just use window.location if useNavigate fails, or implement it safely.

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, userId, userData, login, logout, markProblemAsSolved }}>
      {children}
    </AuthContext.Provider>
  );
};