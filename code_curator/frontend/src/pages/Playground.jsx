import Navbar_1 from "@/components/Navbar_1";
import React, { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GearIcon, Pencil2Icon, TriangleRightIcon, UploadIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Editor from '@monaco-editor/react';
import axios from "axios";
import { useSnippet } from "@/components/context/snippetContext";
import { AuthContext } from "@/components/context/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BookOpen, List, Loader2, CheckCircle2, RotateCcw } from "lucide-react";

const Playground = () => {

  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello World");');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // Problem Solving State
  const [problemData, setProblemData] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);

  const { createSnippet, updateSnippet, getSnippetById } = useSnippet();
  const [snippetId, setSnippetId] = useState(null);
  const [title, setTitle] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const problemSlug = params.get('problem');

    if (id) {
      setSnippetId(id);
      loadSnippet(id);
    } else if (problemSlug) {
      loadProblem(problemSlug);
    }
  }, [location]);

  const loadSnippet = async (id) => {
    const snippet = await getSnippetById(id);
    if (snippet) {
      setSelectedLanguage(snippet.language);
      setCode(snippet.code);
      setTitle(snippet.title);
    }
  }

  const getBoilerplate = (lang, problem) => {
    // 1. Check if the API provided official LeetCode code snippets
    if (problem && problem.codeSnippets && Array.isArray(problem.codeSnippets)) {
      const langMap = {
        'javascript': ['JavaScript', 'javascript'],
        'python': ['Python3', 'Python', 'python'],
        'cpp': ['C++', 'cpp'],
        'java': ['Java', 'java']
      };

      const possibleNames = langMap[lang] || [lang];
      const snippet = problem.codeSnippets.find(s => 
        possibleNames.some(name => s.lang === name || s.lang.toLowerCase() === name.toLowerCase())
      );
      
      if (snippet && snippet.code) {
        return snippet.code;
      }
    }

    // 2. Fallback to enhanced custom boilerplate
    const title = problem?.questionTitle || "Problem";
    const slug = problem?.titleSlug || problem?.questionTitleSlug || "solution";
    const functionName = slug.replace(/-/g, '_');

    switch (lang) {
      case 'python':
        return `# Solve: ${title}\nimport sys\n\ndef ${functionName}():\n    """\n    TODO: Implement your solution here\n    """\n    # Example reading from stdin:\n    # data = sys.stdin.read().split()\n    pass\n\nif __name__ == "__main__":\n    ${functionName}()`;
      
      case 'cpp':
        return `// Solve: ${title}\n#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <map>\n#include <set>\n\nusing namespace std;\n\nvoid solve() {\n    // Write your code here\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    solve();\n    return 0;\n}`;
      
      case 'java':
        return `// Solve: ${title}\nimport java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}`;
      
      case 'javascript':
      default:
        return `// Solve: ${title}\n\n/**\n * @param {any} input\n * @return {any}\n */\nconst solve = () => {\n  // Write your code here\n  console.log("Solution for ${title}");\n};\n\nsolve();`;
    }
  };

  const getStandaloneBoilerplate = (lang) => {
    switch (lang) {
      case 'python':
        return `# Write your code here\nprint("Hello World")`;
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "Hello World" << endl;\n    return 0;\n}`;
      case 'java':
        return `class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello World");\n    }\n}`;
      case 'javascript':
      default:
        return `// Write your code here\nconsole.log("Hello World");`;
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    if (problemData) {
      setCode(getBoilerplate(newLang, problemData));
    } else if (!snippetId) {
      setCode(getStandaloneBoilerplate(newLang));
    }
  };

  const loadProblem = async (slug) => {
    setLoadingProblem(true);
    try {
      // Using /select api to get problem details
      const response = await axios.get(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${slug}`);
      if (response.data) {
        setProblemData(response.data);
        setTitle(response.data.questionTitle || slug);
        setCode(getBoilerplate(selectedLanguage, response.data));
      }
    } catch (error) {
      console.error("Error loading problem:", error);
      toast.error("Failed to load problem details");
    } finally {
      setLoadingProblem(false);
    }
  }

  const saveSnippet = async () => {
    try {
      if (!title) {
        toast.warning("Please enter a title for the snippet, then only you can save !")
        return;
      }

      const snippetData = {
        title,
        language: selectedLanguage,
        code,
        input
      };
      if (snippetId) {
        const response = await updateSnippet(snippetId, snippetData);
        toast.success("Snippet updated successfully.");
      } else {
        const newSnippet = await createSnippet(snippetData);
        toast.success("Snippet saved successfully.");
        setSnippetId(newSnippet._id);
        navigate(`/playground?id=${newSnippet._id}`);
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast.error("Error saving snippet.");
    }
  }


  const { markProblemAsSolved } = React.useContext(AuthContext || {}); // Safe access if context not imported yet, but we need to import it.

  const executeCode = async () => {
    try {
      const compilerMap = {
        'javascript': 'nodejs-20.17.0',
        'python': 'cpython-3.14.0',
        'cpp': 'gcc-head',
        'java': 'openjdk-jdk-22+36'
      };
      
      const compiler = compilerMap[selectedLanguage] || 'nodejs-20.17.0';

      const res = await axios.post("https://wandbox.org/api/compile.json", {
        compiler: compiler,
        code: code,
        stdin: input
      });

      console.log(res.data);
      
      let finalOutput = "";
      if (res.data.compiler_error) {
        finalOutput = res.data.compiler_error;
      } else if (res.data.program_error) {
        finalOutput = res.data.program_error;
      } else if (res.data.program_output) {
        finalOutput = res.data.program_output;
      } else if (res.data.status !== "0") {
        finalOutput = "Error: " + (res.data.compiler_message || "Execution failed.");
      } else {
        finalOutput = "Executed successfully with no output.";
      }
      
      setOutput(finalOutput);
      return finalOutput;
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput("Error executing code. " + (error.response?.data?.message || error.message));
      return "Error";
    }
  };

  const handleSubmit = async () => {
    // 1. Run the code first (optional, but good practice)
    const runOutput = await executeCode();

    // 2. Mark as solved
    // Ideally we check if output matches expected, but we don't have test cases easily available to run locally without complex setup.
    // So for now, "Submit" just marks it as solved (Trust based).

    const success = await markProblemAsSolved(problemData.titleSlug || problemData.questionTitleSlug);
    if (success) {
      toast.success("Problem marked as solved! 🎉");
    } else {
      toast.error("Failed to mark problem as solved.");
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div>
      <Toaster closeButton richColors position="top-center" />
      <Navbar_1 />
      <div className="w-[99vw] m-auto h-[92vh] pt-2">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border h-[100%] w-full"
        >
          {/* Left Panel - Only shown if Problem is loaded */}
          {problemData && (
            <>
              <ResizablePanel defaultSize={35} minSize={20} className="bg-card">
                <div className="h-full flex flex-col">
                  {/* Problem Header */}
                  <div className="p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold truncate">{problemData.questionTitle}</h2>
                      <Badge variant="outline" className={getDifficultyColor(problemData.difficulty)}>
                        {problemData.difficulty}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <List className="w-3 h-3" /> Question ID: {problemData.questionFrontendId}
                      </span>
                    </div>
                  </div>

                  {/* Problem Content */}
                  <div className="flex-1 overflow-auto p-6 prose dark:prose-invert max-w-none text-sm leading-relaxed">
                    {problemData.question ? (
                      <div dangerouslySetInnerHTML={{ __html: problemData.question }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        {loadingProblem ? <Loader2 className="animate-spin" /> : "No description available"}
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}


          <ResizablePanel defaultSize={problemData ? 65 : 100} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="p-2 border-b border-border bg-background">
                <div className="nav gradient-bg h-[5vh] flex items-center w-full px-3 justify-between m-1 rounded-lg shadow-md">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {!problemData && (
                      <Input
                        className="p-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 h-[3.7vh] max-w-[200px]"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Snippet Title..."
                      />
                    )}
                    <Button className="mx-1 bg-white/20 border-white/30 text-white hover:bg-white/30" variant="outline" size="sm" onClick={saveSnippet}>
                      <UploadIcon className="mr-1 h-4 w-4" /> Save
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="border-2 border-white/30 bg-white/10 text-white h-[3.7vh] w-[120px]">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="mx-1 bg-white/20 border-white/30 text-white hover:bg-white/30" variant="outline" size="sm" onClick={() => setCode(getBoilerplate(selectedLanguage, problemData))}>
                      <RotateCcw className="mr-1 h-4 w-4" /> Reset
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg h-[3.7vh]" onClick={executeCode}>
                      Run <TriangleRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                    {problemData && (
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg h-[3.7vh]" onClick={handleSubmit}>
                        Submit <CheckCircle2 className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor & Output Split */}
              <ResizablePanelGroup direction="vertical" className="flex-1">
                <ResizablePanel defaultSize={70}>
                  <div className="editor h-full editor-container">
                    <Editor
                      height="100%"
                      language={selectedLanguage}
                      theme="vs-dark"
                      value={code}
                      onChange={setCode}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 }
                      }}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={30}>
                  <div className="h-full flex flex-col bg-card border-t border-border">
                    <div className="flex border-b border-border">
                      <div className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">Output</div>
                      <div className="px-4 py-2 text-sm font-medium text-muted-foreground opacity-50">Input</div> {/* Can implement tab switching later */}
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                      <div className="flex-1 p-2 border-r border-border overflow-auto font-mono text-sm">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Console Output</div>
                        <pre className={cn("whitespace-pre-wrap", !output && "text-muted-foreground italic")}>
                          {output || "Run code to see output..."}
                        </pre>
                      </div>
                      <div className="w-1/3 p-2 flex flex-col">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Stdin / Input</div>
                        <textarea
                          className="flex-1 bg-secondary/30 rounded p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Input here..."
                        />
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Playground;
