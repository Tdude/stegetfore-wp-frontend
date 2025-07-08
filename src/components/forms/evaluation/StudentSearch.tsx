// src/components/forms/evaluation/StudentSearch.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/api/baseApi';
import { getAuthToken } from '@/lib/utils/authToken';
import { toast } from 'sonner';

interface Student {
  id: number;
  name: string;
  classId?: number;
  className?: string;
}

interface Class {
  id: number;
  name: string;
  title?: {
    rendered: string;
  };
}

interface StudentSearchProps {
  onStudentSelect: (student: Student) => void;
  selectedStudentId?: number | null;
  className?: string;
}

/**
 * Student Search component
 * Allows teachers to search for students they are assigned to
 */
const StudentSearch: React.FC<StudentSearchProps> = ({ 
  onStudentSelect, 
  selectedStudentId,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Class filtering implementation
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = getAuthToken();
        if (!token) {
          return;
        }
        
        const response = await fetch(`${API_URL}/ham/v1/classes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Use the exact format provided: {id: number, name: string}
          setClasses(data);
        } else {
          console.error('Error fetching classes:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        // Finished loading classes
      }
    };
    
    fetchClasses();
  }, [isAuthenticated]);

  // If a studentId is provided, fetch and display that student's name
  useEffect(() => {
    const fetchSelectedStudent = async () => {
      if (selectedStudentId && !selectedStudent) {
        try {
          // Try to get student details by ID
          const token = getAuthToken();
          if (!token) return;

          const response = await fetch(`${API_URL}/ham/v1/student/${selectedStudentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.id) {
              setSelectedStudent({
                id: data.id,
                name: data.title?.rendered || 'Unnamed Student'
              });
            }
          }
        } catch (error) {
          console.error('Error fetching student details:', error);
        }
      }
    };

    fetchSelectedStudent();
  }, [selectedStudentId, selectedStudent]);

  // Handle class selection
  const handleClassSelect = (classId: number | null) => {
    setSelectedClassId(classId);
    setSearchTerm('');
    setStudents([]);
    
    // If a class is selected, focus the search input
    if (classId) {
      const searchInput = document.getElementById('student-search');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };
  
  // Search for students by name or ID
  const searchStudents = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setStudents([]);
      setErrorMessage('');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Du måste vara inloggad för att söka efter elever');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        setErrorMessage('Sessionen har upphört. Logga in igen.');
        return;
      }

      // Use the existing HAM API endpoint for student search
      const encodedTerm = encodeURIComponent(term);
      
      // Modify the URL if class filtering is enabled
      // FIXED: Using plural 'students' to match backend endpoint registration
      let searchUrl = `${API_URL}/ham/v1/students/search/${encodedTerm}`;
      if (selectedClassId) {
        searchUrl += `?class_id=${selectedClassId}`;
      }
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Enhanced debug logs
        console.log('Student search API response:', data);
        console.log('Response type:', typeof data);
        console.log('Is array?', Array.isArray(data));
        if (Array.isArray(data)) {
          console.log('Array length:', data.length);
          if (data.length > 0) {
            console.log('First item structure:', data[0]);
          }
        }
        
        // Make sure we're handling the data correctly
        if (data && Array.isArray(data)) {
          setStudents(data);
          if (data.length === 0) {
            setErrorMessage('Inga elever hittades');
          } else {
            setErrorMessage(''); // Clear error if we have results
          }
        } else {
          console.error('API response is not an array:', data);
          setStudents([]);
          setErrorMessage('Fel format på data från servern');
        }
      } else if (response.status === 404) {
        // 404 is expected for no matching results
        setStudents([]);
        setErrorMessage('Inga elever hittades med den söktermen');
      } else {
        setErrorMessage(`Det gick inte att söka efter elever: ${response.statusText || 'Okänt fel'}`);
        setStudents([]);
      }
    } catch (error) {
      // Log error in development environment only
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error searching for students:', error);
      }
      setErrorMessage('Ett fel uppstod vid sökning efter elever');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedClassId]);

  // Handle input changes with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (term.length >= 2) {
      // Set loading state immediately to give user feedback
      setIsLoading(true);
      
      // Debounce the actual API call
      debounceTimerRef.current = setTimeout(() => {
        searchStudents(term);
        setShowDropdown(true);
      }, 500); // 500ms delay
    } else {
      setShowDropdown(false);
      setErrorMessage('');
      setStudents([]);
      setIsLoading(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (student: Student) => {
    // If a class filter is selected, override with that class info
    if (selectedClassId) {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (selectedClass) {
        student.classId = selectedClass.id;
        student.className = selectedClass.title?.rendered || selectedClass.name;
      }
    }
    
    // Debug log the student object to check class info
    console.log('Selected student with class info:', student);
    
    setSelectedStudent(student);
    setShowDropdown(false);
    setSearchTerm(`${student.name}`);
    onStudentSelect(student);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4">
        <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 mb-1">
          {selectedStudent ? 'Vald elev' : 'Sök efter elev'}
        </label>
        <div className="relative">
          <input
            id="student-search"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Skriv namn för att söka... (minst 2 tecken)"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
            aria-label="Sök efter elev"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
        </div>
        
        {/* Class Filter Dropdown */}
        <div className="mt-2">
          <select
            value={selectedClassId || ''}
            onChange={(e) => handleClassSelect(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Filtrera efter klass"
          >
            <option value="">Alla klasser</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Error message */}
        {errorMessage && !isLoading && (
          <div className="mt-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        
        {/* Selected class info */}
        {selectedClassId && (
          <p className="text-sm text-indigo-600 mt-1">
            Visar endast elever i vald klass
          </p>
        )}
      </div>
      
      {/* Selected student display */}
      {selectedStudent && (
        <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded-md">
          <p className="text-sm font-medium text-indigo-700">Vald elev: {selectedStudent.name}</p>
        </div>
      )}
      
      {/* Search results dropdown */}
      {showDropdown && students.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
          <ul>
            {students.map(student => (
              <li 
                key={student.id}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                onClick={() => handleStudentSelect(student)}
              >
                {student.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* No results message */}
      {showDropdown && searchTerm.length >= 2 && students.length === 0 && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inga elever hittades</p>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
