import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { usersApi, Subject } from "@/api/usersApi";

const StudentSubjectPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await usersApi.getStudentSubjects();
        setSubjects(response.subjects);
        setEmail(response.email);
      } catch (err: any) {
        setError("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-red-500">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">My Subjects</h1>
       

        {subjects.length === 0 ? (
          <p className="text-muted-foreground">No subjects found.</p>
        ) : (
          subjects.map((subject) => (
            <Card key={subject.subjectCode} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{subject.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Subject Code: {subject.subjectCode}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentSubjectPage;
