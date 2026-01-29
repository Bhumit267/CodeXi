import React, { useEffect, useState } from 'react';
import Navbar_1 from "@/components/Navbar_1";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import axios from 'axios';
import { Code2, Hash, Signal, Tags, Search, Loader2, CheckCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/components/context/authContext";
import { useContext } from 'react';

const ProblemsPage = () => {
    const { userData } = useContext(AuthContext);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                // Fetching first 50 problems
                const response = await axios.get('https://alfa-leetcode-api.onrender.com/problems?limit=50');
                if (response.data && response.data.problemsetQuestionList) {
                    setProblems(response.data.problemsetQuestionList);
                }
            } catch (error) {
                console.error("Error fetching problems:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
            case 'hard': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            default: return 'bg-primary/10 text-primary';
        }
    };

    const filteredProblems = problems.filter(prob =>
        prob.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prob.questionFrontendId.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/20">
            <Navbar_1 />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="mb-8 text-center sm:text-left">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="gradient-text">Problem Set</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Sharpen your coding skills with our curated list of challenges.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search problems by title or ID..."
                        className="pl-10 h-12 bg-card/50 border-primary/20 focus:border-primary focus:ring-primary/20 transition-all text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Problems List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse">Loading amazing problems...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {/* Table Header - for larger screens */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-muted-foreground bg-muted/30 rounded-lg">
                            <div className="col-span-1">#</div>
                            <div className="col-span-5">Title</div>
                            <div className="col-span-2">Difficulty</div>
                            <div className="col-span-3">Tags</div>
                            <div className="col-span-1 text-center">Action</div>
                        </div>

                        {/* Problem Items */}
                        {filteredProblems.map((problem) => (
                            <Link
                                to={`/playground?problem=${problem.titleSlug}`}
                                key={problem.questionFrontendId}
                                className="group"
                            >
                                <div className="card-glow grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-4 bg-card hover:bg-accent/5 border border-border rounded-xl items-center transition-all duration-300">
                                    {/* ID */}
                                    <div className="flex items-center gap-2 col-span-1">
                                        <Hash className="w-4 h-4 text-muted-foreground md:hidden" />
                                        <span className="font-mono text-muted-foreground group-hover:text-primary transition-colors">
                                            {problem.questionFrontendId}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <div className="col-span-12 md:col-span-5 font-semibold text-lg md:text-base group-hover:text-primary transition-colors">
                                        {problem.title}
                                    </div>

                                    {/* Difficulty */}
                                    <div className="col-span-6 md:col-span-2">
                                        <Badge variant="outline" className={`${getDifficultyColor(problem.difficulty)} border-0`}>
                                            {problem.difficulty}
                                        </Badge>
                                    </div>

                                    {/* Tags */}
                                    <div className="col-span-6 md:col-span-3 flex flex-wrap gap-1">
                                        {problem.topicTags?.slice(0, 2).map(tag => (
                                            <span
                                                key={tag.slug}
                                                className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                        {problem.topicTags?.length > 2 && (
                                            <span className="text-xs text-muted-foreground px-1">
                                                +{problem.topicTags.length - 2}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center">
                                        {userData?.solvedProblems?.includes(problem.titleSlug) ? (
                                            <div className="flex flex-col items-center justify-center text-emerald-500 font-medium">
                                                <CheckCircle className="w-6 h-6" />
                                                <span className="text-[10px] uppercase tracking-wider mt-1">Solved</span>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="w-full md:w-auto gradient-bg text-white shadow-lg opacity-90 group-hover:opacity-100 transition-opacity"
                                            >
                                                Solve
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && filteredProblems.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">No problems found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemsPage;
