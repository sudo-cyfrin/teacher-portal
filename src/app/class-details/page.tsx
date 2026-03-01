'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { airtableService, Student } from '@/lib/airtable';
import { 
  Users, 
  Loader2, 
  Download, 
  TrendingUp, 
  Award,
  BookOpen,
  UserCheck
} from 'lucide-react';

export default function ClassDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadSubjects();
    }
  }, [status]);

  const loadSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) throw new Error();
      const availableSubjects = await response.json();
      setSubjects(availableSubjects);
    } catch (err) {
      setError('Failed to connect to Airtable.');
    }
  };

  const fetchClassDetails = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/students?subject=${encodeURIComponent(selectedSubject)}`);
      if (!response.ok) throw new Error();
      const classData = await response.json();
      setStudents(classData);
    } catch (err) {
      setError('Failed to fetch class details.');
    } finally {
      setLoading(false);
    }
  };

  const calculateClassStats = () => {
    if (students.length === 0) return { average: 0, highest: 0, lowest: 0, passed: 0 };

    // For class details, students are individual records per subject
    const scores = students
      .map(s => {
        // Handle both old single-subject and new multi-subject structures
        if (s.subjects && Object.keys(s.subjects).length > 0) {
          // New multi-subject structure - take first subject's scores
          const firstSubject = Object.values(s.subjects)[0];
          return firstSubject.assignmentScaled + firstSubject.labScaled + firstSubject.termTest1 + firstSubject.termTest2 + firstSubject.termTestTotal + firstSubject.termWork;
        } else {
          // Fallback for old structure (shouldn't happen with new API)
          return 0;
        }
      })
      .filter(s => s > 0);

    if (scores.length === 0) return { average: 0, highest: 0, lowest: 0, passed: 0 };

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = scores.filter(s => s >= 40).length;

    return { average, highest, lowest, passed };
  };

  const exportToCSV = () => {
    if (students.length === 0) return;

    const headers = ['Roll Number', 'Name', 'Faculty Name', 'Subject', 'CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6', 'Term Test 1', 'Term Test 2', 'Term Test Total', 'Term Work', 'Lab AVG', 'Lab Scaled', 'Assignment 1', 'Assignment 2', 'Assignment Avg', 'Assignment Scaled'];
    
    const csvContent = [
      headers.join(','),
      ...students.map(student => {
        // For class details, we need to extract subject data from the new structure
        let subjectData = null;
        let subjectName = '';
        
        if (student.subjects && Object.keys(student.subjects).length > 0) {
          // Get the first subject (for class details, we're showing one subject at a time)
          const subjectEntries = Object.entries(student.subjects);
          subjectName = subjectEntries[0][0];
          subjectData = subjectEntries[0][1];
        }
        
        if (!subjectData) return [];
        
        return [
          student.rollNumber,
          student.name,
          subjectData.facultyName,
          subjectName,
          subjectData.coScores.CO1.toFixed(2),
          subjectData.coScores.CO2.toFixed(2),
          subjectData.coScores.CO3.toFixed(2),
          subjectData.coScores.CO4.toFixed(2),
          subjectData.coScores.CO5.toFixed(2),
          subjectData.coScores.CO6.toFixed(2),
          subjectData.termTest1.toFixed(2),
          subjectData.termTest2.toFixed(2),
          subjectData.termTestTotal.toFixed(2),
          subjectData.termWork.toFixed(2),
          subjectData.labAvg.toFixed(2),
          subjectData.labScaled.toFixed(2),
          subjectData.assignment1.toFixed(2),
          subjectData.assignment2.toFixed(2),
          subjectData.assignmentAvg.toFixed(2),
          subjectData.assignmentScaled.toFixed(2)
        ];
      }).filter(row => row.length > 0).map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-details-${selectedSubject}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) return null;

  const stats = calculateClassStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Class Details</h1>
          <p className="text-gray-600 mt-2">View and analyze class performance by subject</p>
        </div>

        {/* Filter Card */}
        <Card className="mb-10 border border-gray-200 shadow-md bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center space-x-2 text-xl font-semibold text-gray-900">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span>Filter Class Data</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Select subject to view class performance
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg 
                            bg-white text-gray-900 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">
                    Select Subject
                  </option>
                  {subjects.map(subject => (
                    <option 
                      key={subject} 
                      value={subject}
                      className="text-gray-900"
                    >
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchClassDetails}
                  disabled={!selectedSubject || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-gray font-semibold py-3 rounded-lg shadow"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5" />
                      Fetch Details
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {students.length > 0 && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-blue-50 border border-blue-100 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-blue-700">Class Average</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.average.toFixed(1)}%</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border border-green-100 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-green-700">Highest Score</p>
                  <p className="text-3xl font-bold text-green-900">{stats.highest.toFixed(1)}</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border border-red-100 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-red-700">Lowest Score</p>
                  <p className="text-3xl font-bold text-red-900">{stats.lowest.toFixed(1)}</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border border-purple-100 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-purple-700">Students Passed</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.passed}/{students.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Students Table — EXACTLY YOUR ORIGINAL */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Student Performance</CardTitle>
                  <CardDescription>
                    {selectedSubject} • {students.length} students
                  </CardDescription>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Roll Number</th>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Faculty Name</th>
                        <th className="px-6 py-3">CO1</th>
                        <th className="px-6 py-3">CO2</th>
                        <th className="px-6 py-3">CO3</th>
                        <th className="px-6 py-3">CO4</th>
                        <th className="px-6 py-3">CO5</th>
                        <th className="px-6 py-3">CO6</th>
                        <th className="px-6 py-3">Term Test 1</th>
                        <th className="px-6 py-3">Term Test 2</th>
                        <th className="px-6 py-3">Term Test Total</th>
                        <th className="px-6 py-3">Lab AVG</th>
                        <th className="px-6 py-3">Lab Scaled</th>
                        <th className="px-6 py-3">Assignment 1</th>
                        <th className="px-6 py-3">Assignment 2</th>
                        <th className="px-6 py-3">Assignment Avg</th>
                        <th className="px-6 py-3">Assignment Scaled</th>
                        <th className="px-6 py-3">Term Work</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => {
                        // Extract subject data from the new structure
                        let subjectData = null;
                        
                        if (student.subjects && Object.keys(student.subjects).length > 0) {
                          // Get the first subject (for class details, we're showing one subject at a time)
                          const subjectEntries = Object.entries(student.subjects);
                          subjectData = subjectEntries[0][1];
                        }
                        
                        if (!subjectData) return null;
                        
                        const totalScore = subjectData.assignmentScaled + subjectData.labScaled + subjectData.termTest1 + subjectData.termTest2 + subjectData.termTestTotal + subjectData.termWork;
                        const averageScore = totalScore > 0 ? (totalScore / 6) : 0;
                        
                        return (
                          <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {student.rollNumber}
                            </td>
                            <td className="px-6 py-4">{student.name}</td>
                            <td className="px-6 py-4">{subjectData.facultyName}</td>
                            <td className="px-6 py-4">{subjectData.coScores.CO1.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.coScores.CO2.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.coScores.CO3.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.coScores.CO4.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.coScores.CO5.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.coScores.CO6.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.termTest1.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.termTest2.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.termTestTotal.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.labAvg.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.labScaled.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.assignment1.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.assignment2.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.assignmentAvg.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.assignmentScaled.toFixed(2)}</td>
                            <td className="px-6 py-4">{subjectData.termWork.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}