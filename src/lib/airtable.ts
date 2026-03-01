import Airtable from 'airtable';

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  subjects: {
    [subjectName: string]: {
      id: string;
      timestamp: string;
      facultyName: string;
      coScores: {
        CO1: number;
        CO2: number;
        CO3: number;
        CO4: number;
        CO5: number;
        CO6: number;
      };
      termTest1: number;
      termTest2: number;
      termTestTotal: number;
      termWork: number;
      experiments: {
        exp1: number;
        exp2: number;
        exp3: number;
        exp4: number;
        exp5: number;
        exp6: number;
        exp7: number;
        exp8: number;
      };
      labAvg: number;
      labScaled: number;
      assignment1: number;
      assignment2: number;
      assignmentAvg: number;
      assignmentScaled: number;
    };
  };
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
}

class AirtableService {
  private base: any;

  constructor() {
    // Don't throw error in constructor, handle it gracefully
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.warn('Airtable credentials not configured');
      this.base = null;
      return;
    }

    try {
      this.base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
        .base(process.env.AIRTABLE_BASE_ID);
    } catch (error) {
      console.error('Failed to initialize Airtable:', error);
      this.base = null;
    }
  }

  private ensureInitialized() {
    if (!this.base) {
      throw new Error('Airtable service not initialized. Please check your environment variables.');
    }
  }

  async getAllStudentRecords(): Promise<any[]> {
    this.ensureInitialized();
    try {
      const records = await this.base(process.env.AIRTABLE_STUDENTS_TABLE || 'TyMarks')
        .select({
          sort: [{ field: 'Roll Number', direction: 'asc' }]
        })
        .all();
      return records;
    } catch (error) {
      console.error('Error fetching all student records:', error);
      throw new Error('Failed to fetch student records from Airtable');
    }
  }

  async getStudentsBySubject(subject: string): Promise<Student[]> {
    this.ensureInitialized();
    try {
      const records = await this.base(process.env.AIRTABLE_STUDENTS_TABLE || 'TyMarks')
        .select({
          filterByFormula: `{Subject} = "${subject}"`,
          sort: [{ field: 'Roll Number', direction: 'asc' }]
        })
        .all();

      // For class details, return individual records with single subject structure
      return records.map((record: { id: string; fields: any }) => {
        const fields = record.fields;

        return {
          id: record.id,
          name: fields['Student Name'] || '',
          rollNumber: fields['Roll Number'] || '',
          subjects: {
            [fields.Subject || '']: {
              id: record.id,
              timestamp: fields.Timestamp ? fields.Timestamp.toString() : '',
              facultyName: fields['Faculty Name'] || '',
              coScores: {
                CO1: parseFloat(fields.CO1) || 0,
                CO2: parseFloat(fields.CO2) || 0,
                CO3: parseFloat(fields.CO3) || 0,
                CO4: parseFloat(fields.CO4) || 0,
                CO5: parseFloat(fields.CO5) || 0,
                CO6: parseFloat(fields.CO6) || 0,
              },
              termTest1: parseFloat(fields['Term Test 1']) || 0,
              termTest2: parseFloat(fields['Term Test 2']) || 0,
              termTestTotal: parseFloat(fields['Term Test Total']) || 0,
              termWork: parseFloat(fields['Term Work']) || 0,
              experiments: {
                exp1: parseFloat(fields.Exp1) || 0,
                exp2: parseFloat(fields.Exp2) || 0,
                exp3: parseFloat(fields.Exp3) || 0,
                exp4: parseFloat(fields.Exp4) || 0,
                exp5: parseFloat(fields.Exp5) || 0,
                exp6: parseFloat(fields.Exp6) || 0,
                exp7: parseFloat(fields.Exp7) || 0,
                exp8: parseFloat(fields.Exp8) || 0,
              },
              labAvg: parseFloat(fields['Lab AVG']) || 0,
              labScaled: parseFloat(fields['Lab Scaled(15)']) || 0,
              assignment1: parseFloat(fields['Assignment 1']) || 0,
              assignment2: parseFloat(fields['Assignment 2']) || 0,
              assignmentAvg: parseFloat(fields['Assignment Avg']) || 0,
              assignmentScaled: parseFloat(fields['Assignment Scaled(10)']) || 0,
            }
          }
        };
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error('Failed to fetch students from Airtable');
    }
  }

  async searchStudent(rollNumber: string): Promise<Student | null> {
    this.ensureInitialized();
    try {
      const records = await this.base(process.env.AIRTABLE_STUDENTS_TABLE || 'TyMarks')
        .select({
          filterByFormula: `{Roll Number} = "${rollNumber}"`,
          maxRecords: 1
        })
        .all();

      if (records.length === 0) {
        return null;
      }

      return this.transformStudentRecord(records[0] as { id: string; fields: any });
    } catch (error) {
      console.error('Error searching student:', error);
      throw new Error('Failed to search student in Airtable');
    }
  }

  async getTeacherByEmail(email: string): Promise<Teacher | null> {
    this.ensureInitialized();
    try {
      const records = await this.base(process.env.AIRTABLE_TEACHERS_TABLE || 'Teachers')
        .select({
          filterByFormula: `{Email} = "${email}"`,
          maxRecords: 1
        })
        .all();

      if (records.length === 0) {
        return null;
      }

      const record = records[0];
      return {
        id: record.id,
        name: record.fields.Name || '',
        email: record.fields.Email || '',
        department: record.fields.Department || ''
      };
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw new Error('Failed to fetch teacher from Airtable');
    }
  }

  private transformStudentRecord(record: { id: string; fields: any }): Student {
    const fields = record.fields;

    return {
      id: record.id,
      name: fields['Student Name'] || '',
      rollNumber: fields['Roll Number'] || '',
      timestamp: fields.Timestamp ? fields.Timestamp.toString() : '',
      facultyName: fields['Faculty Name'] || '',
      subject: fields.Subject || '',
      coScores: {
        CO1: parseFloat(fields.CO1) || 0,
        CO2: parseFloat(fields.CO2) || 0,
        CO3: parseFloat(fields.CO3) || 0,
        CO4: parseFloat(fields.CO4) || 0,
        CO5: parseFloat(fields.CO5) || 0,
        CO6: parseFloat(fields.CO6) || 0,
      },
      termTest1: parseFloat(fields['Term Test 1']) || 0,
      termTest2: parseFloat(fields['Term Test 2']) || 0,
      experiments: {
        exp1: parseFloat(fields.Exp1) || 0,
        exp2: parseFloat(fields.Exp2) || 0,
        exp3: parseFloat(fields.Exp3) || 0,
        exp4: parseFloat(fields.Exp4) || 0,
        exp5: parseFloat(fields.Exp5) || 0,
        exp6: parseFloat(fields.Exp6) || 0,
        exp7: parseFloat(fields.Exp7) || 0,
        exp8: parseFloat(fields.Exp8) || 0,
      },
      labAvg: parseFloat(fields['Lab AVG']) || 0,
      labScaled: parseFloat(fields['Lab Scaled(15)']) || 0,
      assignment1: parseFloat(fields['Assignment 1']) || 0,
      assignment2: parseFloat(fields['Assignment 2']) || 0,
      assignmentAvg: parseFloat(fields['Assignment Avg']) || 0,
      assignmentScaled: parseFloat(fields['Assignment Scaled(10)']) || 0,
    };
  }


  async getAllSubjects(): Promise<string[]> {
    this.ensureInitialized();
    try {
      const records = await this.base(process.env.AIRTABLE_STUDENTS_TABLE || 'TyMarks')
        .select({
          fields: ['Subject']
        })
        .all();

      const subjects = new Set<string>();
      records.forEach(record => {
        if (record.fields.Subject) {
          subjects.add(record.fields.Subject);
        }
      });

      return Array.from(subjects).sort();
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  }

}

// Create a singleton instance that's only initialized when needed
let airtableServiceInstance: AirtableService | null = null;

export const airtableService = (): AirtableService => {
  if (!airtableServiceInstance) {
    airtableServiceInstance = new AirtableService();
  }
  return airtableServiceInstance;
};
