import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type UserRole = Database["public"]["Enums"]["user_role"];

export default function Settings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRole>("doctor");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      
      setFullName(data.full_name || "");
      setDepartment(data.department || "");
      setRole(data.role || "doctor");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          department: department,
          role: role,
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-primary"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="backdrop-blur-sm bg-card/50 shadow-xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. John Smith"
                    className="transition-all focus:scale-[1.01]"
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Radiology"
                    className="transition-all focus:scale-[1.01]"
                  />
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="radiologist">Radiologist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" disabled={loading} className="shadow-lg">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-card/50 shadow-xl">
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Manage AI processing settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["RAG Mode", "Chain-of-Thought Reasoning"].map((feature, i) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent"
                  >
                    <div>
                      <p className="font-medium">{feature}</p>
                      <p className="text-sm text-muted-foreground">
                        {i === 0 ? "Retrieval-Augmented Generation for enhanced analysis" : "Step-by-step AI reasoning in summaries"}
                      </p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
