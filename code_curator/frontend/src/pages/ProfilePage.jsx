import React, { useContext, useState } from 'react';
import Navbar_1 from "@/components/Navbar_1";
import { AuthContext } from "@/components/context/authContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Save, User, Award, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ProfilePage = () => {
    const { userData, username: contextUsername, login } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);

    // Local state for editing
    const [fullname, setFullname] = useState(userData?.fullname || "");
    const [username, setUsername] = useState(userData?.username || contextUsername || "");
    const [email, setEmail] = useState(userData?.email || "");

    const updateProfile = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.patch(`${import.meta.env.VITE_BASE_URL}/user/update-profile`,
                { fullname, username, email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.user) {
                // Update context
                login(response.data.user);
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar_1 />
                <div className="flex justify-center items-center h-[80vh]">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-24 w-24 bg-muted rounded-full mb-4"></div>
                        <div className="h-6 w-48 bg-muted rounded mb-2"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/20">
            <Navbar_1 />
            <div className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Profile Header */}
                <Card className="mb-8 border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-24 gradient-bg opacity-80" />
                    <div className="relative pt-12 px-6 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                            <AvatarImage src={userData.profileImage} />
                            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                                {userData.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-bold text-foreground">{userData.fullname}</h1>
                            <p className="text-muted-foreground font-medium">@{userData.username}</p>
                        </div>

                        <div className="flex gap-4">
                            {!isEditing ? (
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button onClick={updateProfile} className="bg-primary hover:bg-primary/90">
                                        <Save className="w-4 h-4 mr-2" /> Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Stats Card */}
                            <Card className="col-span-1 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
                                    <Award className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{userData.solvedProblems?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">Keep pushing!</p>
                                </CardContent>
                            </Card>

                            {/* Profile Details (Read Only) */}
                            <Card className="col-span-1 md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Profile Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="font-medium text-muted-foreground">Username</div>
                                        <div className="col-span-2">{userData.username}</div>

                                        <div className="font-medium text-muted-foreground">Email</div>
                                        <div className="col-span-2">{userData.email}</div>

                                        <div className="font-medium text-muted-foreground">Role</div>
                                        <div className="col-span-2 capitalize"><Badge variant="secondary">{userData.role}</Badge></div>

                                        <div className="font-medium text-muted-foreground">Joined</div>
                                        <div className="col-span-2">{new Date(userData.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Solved Problems List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Solved Problems</CardTitle>
                                <CardDescription>A list of all the battlefield victories you've claimed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {userData.solvedProblems?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {userData.solvedProblems.map((slug, index) => (
                                            <Badge key={index} variant="outline" className="text-sm py-1 px-3 border-emerald-500/30 bg-emerald-500/5 text-emerald-500">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                {slug} // Since we store slug, we display slug.
                                                {/* Ideally we would map slug to Title if we had a map, but Slug is readable enough usually */}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No problems solved yet.</p>
                                        <Button variant="link" asChild className="mt-2">
                                            <a href="/problems">Go solve some!</a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                                <CardDescription>Make changes to your profile here. Click save when you're done.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullname">Full Name</Label>
                                    <Input id="fullname" value={fullname} onChange={(e) => setFullname(e.target.value)} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!isEditing} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ProfilePage;
