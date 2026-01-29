import Navbar_1 from "@/components/Navbar_1";
import { AuthContext } from "@/components/context/authContext";
import { useSnippet } from "@/components/context/snippetContext";
import { Button } from "@/components/ui/button";
import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Code2, User, FolderCode, Sparkles } from "lucide-react";

const LandingPage = () => {
  const { username, isLoggedIn } = useContext(AuthContext);
  const { snippets, fetchSnippets, deleteSnippet } = useSnippet();

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn) {
        await fetchSnippets();
      }
    };

    fetchData();
  }, [isLoggedIn, fetchSnippets]);

  const handleDelete = async (id) => {
    try {
      await deleteSnippet(id);
      await fetchSnippets();
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <Navbar_1 />

      {/* Hero Section */}
      <div className="w-full px-4 py-12 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Welcome to CodeYourWay</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            Hi, <span className="gradient-text">{isLoggedIn ? username : "Developer"}</span> 👋
          </h1>
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground/90">
            Let's Code Your Way to <span className="gradient-text">Success!</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Write, compile, and run code in multiple languages directly in your browser.
            Save your snippets and access them anywhere.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {/* Online Compiler Card */}
          <Link to="/playground" className="group">
            <div className="card-glow border border-border rounded-xl p-8 bg-card hover:border-primary/50 transition-all duration-300 h-full">
              <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Online Compiler</h3>
              <p className="text-muted-foreground mb-4">
                Write and execute code in JavaScript, Python, C++, and Java with our powerful online IDE.
              </p>
              <Button className="gradient-bg text-white hover:opacity-90 btn-glow">
                Start Coding →
              </Button>
            </div>
          </Link>

          {/* Profile Card */}
          <Link to="/profile" className="block h-full group">
            <div className="card-glow border border-border rounded-xl p-8 bg-card h-full hover:border-primary/50 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                <User className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your Profile</h3>
              <p className="text-muted-foreground mb-4">
                {isLoggedIn
                  ? `Logged in as ${username}. Manage your account and preferences.`
                  : "Sign in to save your work and track your progress."}
              </p>
              {!isLoggedIn && (
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Sign In
                </Button>
              )}
            </div>
          </Link>
        </div>

        {/* Snippets Section */}
        <div className="card-glow border border-border rounded-xl p-8 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
              <FolderCode className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Your Snippets</h2>
            <span className="ml-auto text-sm text-muted-foreground">
              {snippets.length} {snippets.length === 1 ? 'snippet' : 'snippets'}
            </span>
          </div>

          {snippets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No snippets yet</p>
              <p className="text-sm">Start coding and save your first snippet!</p>
              <Link to="/playground">
                <Button className="mt-4 gradient-bg text-white hover:opacity-90">
                  Create Snippet
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {snippets.map(snippet => (
                <div
                  key={snippet._id}
                  className="group p-4 border border-border rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-200 flex justify-between items-center"
                >
                  <Link to={`/playground?id=${snippet._id}`} className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {snippet.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {snippet.language}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(snippet._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;