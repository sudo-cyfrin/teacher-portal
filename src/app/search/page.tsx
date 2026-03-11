'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { airtableService, Student } from '@/lib/airtable';
import { 
  Search, 
  Loader2, 
  User, 
  BookOpen,
  TrendingUp,
  Award,
  GraduationCap
} from 'lucide-react';

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

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
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const availableSubjects = await response.json();
      setSubjects(availableSubjects);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setError('Failed to connect to Airtable. Please check your environment configuration.');
    }
  };

  const searchStudent = async () => {
    if (!rollNumber.trim()) {
      setError('Please enter roll number');
      return;
    }

    setLoading(true);
    setError('');
    setStudents([]);

    try {
      const response = await fetch(`/api/students?rollNumber=${encodeURIComponent(rollNumber.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to search student');
      }
      const studentData = await response.json();
      setStudents(studentData);
      setSearched(true);
    } catch (err) {
      setError('Failed to search student. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchStudent();
    }
  };

  const getGradeColor = (average: number) => {
    if (average >= 70) return 'bg-green-100 text-green-800';
    if (average >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getGradeLabel = (average: number) => {
    if (average >= 70) return 'Excellent';
    if (average >= 60) return 'Good';
    if (average >= 40) return 'Average';
    return 'Needs Improvement';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Search</h1>
          <p className="text-gray-600">Search for individual students and view their complete academic records</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <Search className="h-6 w-6 text-blue-600" />
              <span>Search Student</span>
            </CardTitle>
            <CardDescription className="text-base font-medium text-gray-700">
              Enter roll number to find student records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">
                  Roll Number
                </label>
                <Input
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="Enter roll number (e.g., B014)"
                  onKeyPress={handleKeyPress}
                  className="p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-300 font-large"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={searchStudent}
                  disabled={!rollNumber.trim() || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Search Student
                    </>
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {searched && (
          <>
            {students.length > 0 ? (
              <>
                {students.map((student) => (
                  <div key={student.id}>
                    {/* Student Basic Info */}
                    <Card className="mb-8 border-2 border-gray-200 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-600 rounded-full shadow-md">
                            <User className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                            <p className="text-base font-medium text-gray-700">
                              Roll Number: <span className="text-blue-600 font-bold">{student.rollNumber}</span> • 
                              <span className="ml-2 text-indigo-600 font-semibold">{Object.keys(student.subjects).length} subjects</span>
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                              <GraduationCap className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                              <p className="text-sm font-semibold text-blue-800 mb-2">Total Subjects</p>
                              <p className="text-3xl font-bold text-blue-900">
                                {Object.keys(student.subjects).length}
                              </p>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
                              <Award className="h-10 w-10 text-green-600 mx-auto mb-3" />
                              <p className="text-sm font-semibold text-green-800 mb-2">Total Lab Scaled</p>
                              <p className="text-3xl font-bold text-green-900">
                                {Object.values(student.subjects).reduce((sum, subject) => sum + subject.labScaled, 0)}
                              </p>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
                              <BookOpen className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                              <p className="text-sm font-semibold text-purple-800 mb-2">Total Assignment Scaled</p>
                              <p className="text-3xl font-bold text-purple-900">
                                {Object.values(student.subjects).reduce((sum, subject) => sum + subject.assignmentScaled, 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Subject-wise Performance */}
                    <Card className="border-2 border-gray-200 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                        <CardTitle className="text-2xl font-bold text-gray-900">Subject Performance</CardTitle>
                        <CardDescription className="text-base font-medium text-gray-700">
                          Detailed performance across all subjects
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-8">
                          {Object.entries(student.subjects).map(([subjectName, subjectData]) => (
                            <div key={subjectName} className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-md">
                              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-900">{subjectName}</h3>
                                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                                  <span className="text-sm font-semibold text-blue-800">Faculty: {subjectData.facultyName}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                  <p className="text-sm font-bold text-blue-800 mb-2">Lab Scaled</p>
                                  <p className="text-2xl font-bold text-blue-900">{subjectData.labScaled}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                  <p className="text-sm font-bold text-green-800 mb-2">Assignment Scaled</p>
                                  <p className="text-2xl font-bold text-green-900">{subjectData.assignmentScaled}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                  <p className="text-sm font-bold text-purple-800 mb-2">Termwork</p>
                                  <p className="text-2xl font-bold text-purple-900">{subjectData.termWork}</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                  <p className="text-sm font-bold text-orange-800 mb-2">Term Test 1</p>
                                  <p className="text-2xl font-bold text-orange-900">{subjectData.termTest1}</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                                  <p className="text-sm font-bold text-red-800 mb-2">Term Test 2</p>
                                  <p className="text-2xl font-bold text-red-900">{subjectData.termTest2}</p>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                                  <p className="text-sm font-bold text-yellow-800 mb-2">Term Test Total</p>
                                  <p className="text-2xl font-bold text-yellow-900">{subjectData.termTestTotal}</p>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Found</h3>
                  <p className="text-gray-600">
                    No student records found for the provided roll number.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
