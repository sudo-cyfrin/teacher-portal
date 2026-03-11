import { NextResponse } from 'next/server';
import { airtableService } from '@/lib/airtable';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get('subject');
  const rollNumber = searchParams.get('rollNumber');

  try {
    if (subject === 'all') {
      // Get all students for dashboard stats
      const allRecords = await airtableService().getAllStudentRecords();
      return NextResponse.json(allRecords);
    }
    
    if (rollNumber) {
      // Search by roll number - get all records for this student
      const allRecords = await airtableService().getAllStudentRecords();
      const studentRecords = allRecords.filter(record => 
        record.fields['Roll Number'] === rollNumber
      );
      
      if (studentRecords.length === 0) {
        return NextResponse.json([]);
      }

      // Aggregate all subjects for this student
      const aggregatedStudent = aggregateStudentData(studentRecords);
      return NextResponse.json([aggregatedStudent]);
    } else if (subject) {
      // Get students by subject - return individual records for this subject
      const students = await airtableService().getStudentsBySubject(subject);
      return NextResponse.json(students);
    } else {
      return NextResponse.json(
        { error: 'Missing subject or rollNumber parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

function aggregateStudentData(records: any[]) {
  // Group by roll number and aggregate subjects
  const studentMap = new Map();
  
  records.forEach(record => {
    const rollNumber = record.fields['Roll Number'];
    const subject = record.fields.Subject;
    
    if (!studentMap.has(rollNumber)) {
      studentMap.set(rollNumber, {
        id: record.id,
        name: record.fields['Student Name'],
        rollNumber: rollNumber,
        subjects: {}
      });
    }
    
    const student = studentMap.get(rollNumber);
    student.subjects[subject] = {
      id: record.id,
      timestamp: record.fields.Timestamp ? record.fields.Timestamp.toString() : '',
      facultyName: record.fields['Faculty Name'] || '',
      coScores: {
        CO1: parseFloat(record.fields.CO1) || 0,
        CO2: parseFloat(record.fields.CO2) || 0,
        CO3: parseFloat(record.fields.CO3) || 0,
        CO4: parseFloat(record.fields.CO4) || 0,
        CO5: parseFloat(record.fields.CO5) || 0,
        CO6: parseFloat(record.fields.CO6) || 0,
      },
      termTest1: parseFloat(record.fields['Term Test 1']) || 0,
      termTest2: parseFloat(record.fields['Term Test 2']) || 0,
      termTestTotal: parseFloat(record.fields['Term Test Total']) || 0,
      termWork: parseFloat(record.fields['Term Work']) || 0,
      experiments: {
        exp1: parseFloat(record.fields.Exp1) || 0,
        exp2: parseFloat(record.fields.Exp2) || 0,
        exp3: parseFloat(record.fields.Exp3) || 0,
        exp4: parseFloat(record.fields.Exp4) || 0,
        exp5: parseFloat(record.fields.Exp5) || 0,
        exp6: parseFloat(record.fields.Exp6) || 0,
        exp7: parseFloat(record.fields.Exp7) || 0,
        exp8: parseFloat(record.fields.Exp8) || 0,
      },
      labAvg: parseFloat(record.fields['Lab AVG']) || 0,
      labScaled: parseFloat(record.fields['Lab Scaled(15)']) || 0,
      assignment1: parseFloat(record.fields['Assignment 1']) || 0,
      assignment2: parseFloat(record.fields['Assignment 2']) || 0,
      assignmentAvg: parseFloat(record.fields['Assignment Avg']) || 0,
      assignmentScaled: parseFloat(record.fields['Assignment Scaled(10)']) || 0,
    };
  });
  
  return Array.from(studentMap.values())[0];
}
