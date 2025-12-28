// src/components/forms/evaluation/StudentSearch.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/lib/api/baseApi';
import { getAuthToken } from '@/lib/utils/authToken';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

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
  
  const { isAuthenticated, userInfo } = useAuth();

  const roles = Array.isArray(userInfo?.roles) ? userInfo?.roles : [];
  const normalizedRoles = roles.map((r) => String(r).toLowerCase());
  const roleSet = new Set(normalizedRoles);
  const isAdminLike = roleSet.has('administrator') || roleSet.has('admin');
  const isSchoolChief = roleSet.has('ham_school_head');
  const isPrincipal = roleSet.has('ham_principal');
  const isTeacher = roleSet.has('ham_teacher');
  
  // Class filtering implementation
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  
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
    setShowClassDropdown(false);
    
    // If a class is selected, focus the search input
    if (classId) {
      const searchInput = document.getElementById('student-search');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };
  
  // Helper to format class label with optional student count
  const formatClassLabel = (cls: Class & { student_count?: number; count?: number }) => {
    const base = cls.name;
    const rawCount = typeof cls.student_count === 'number' ? cls.student_count : cls.count;
    if (typeof rawCount !== 'number') return base;
    const label = rawCount === 1 ? 'elev' : 'elever';
    return `${base} (${rawCount} ${label})`;
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
      const baseSearchUrl = `${API_URL}/ham/v1/students/search/${encodedTerm}`;

      const fetchSearch = async (url: string) => {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) return data as Student[];
          console.error('API response is not an array:', data);
          throw new Error('Fel format på data från servern');
        }

        if (response.status === 404) {
          return [] as Student[];
        }

        throw new Error(response.statusText || 'Okänt fel');
      };

      let results: Student[] = [];

      if (selectedClassId) {
        results = await fetchSearch(`${baseSearchUrl}?class_id=${selectedClassId}`);
      } else if ((isTeacher || isPrincipal) && !isSchoolChief && !isAdminLike) {
        if (!classes.length) {
          setStudents([]);
          setErrorMessage('Du har inga klasser tilldelade');
          return;
        }

        const perClassResults = await Promise.all(
          classes.map((cls) => fetchSearch(`${baseSearchUrl}?class_id=${cls.id}`))
        );

        const merged = perClassResults.flat();
        const seen = new Set<number>();
        results = merged.filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
      } else {
        results = await fetchSearch(baseSearchUrl);
      }

      setStudents(results);
      if (results.length === 0) {
        setErrorMessage('Inga elever hittades');
      } else {
        setErrorMessage('');
      }
    } catch (error) {
      // Log error in development environment only
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error searching for students:', error);
      }
      setErrorMessage(
        error instanceof Error
          ? `Ett fel uppstod vid sökning efter elever: ${error.message}`
          : 'Ett fel uppstod vid sökning efter elever'
      );
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [classes, isAdminLike, isAuthenticated, isPrincipal, isSchoolChief, isTeacher, selectedClassId]);

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
        <label htmlFor="student-search" className="block text-md font-medium text-foreground mb-1">
          {selectedStudent ? 'Vald elev' : 'Sök elev'}
        </label>

        <div className="md:flex md:gap-3 md:items-start">
          {/* Student search pill */}
          <div className="relative md:flex-1 rounded-full border border-red-300/80 bg-red-50/70 dark:border-red-500/60 dark:bg-red-950/30 px-3 py-1">
            <input
              id="student-search"
              type="text"
              className="w-full bg-transparent text-sm placeholder:text-secondary focus-visible:outline-none border-0 focus-visible:ring-0 dark:bg-transparent dark:text-foreground"
              placeholder="Sök på namn (minst 2 tecken)"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
              aria-label="Sök elev"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary dark:border-primary"></div>
              </div>
            )}
          </div>

          {/* Class filter pill */}
          <div className="mt-2 relative md:mt-0 md:w-56 rounded-full border border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-500/60 dark:bg-emerald-950/30 px-3 py-1">
            <button
              type="button"
              onClick={() => setShowClassDropdown((v) => !v)}
              className="w-full px-0 py-1 rounded-full bg-transparent text-sm sm:text-sm text-left flex items-center justify-between focus-visible:outline-none focus-visible:ring-0 dark:bg-transparent dark:text-foreground"
              aria-label="Filtrera efter klass"
              aria-haspopup="listbox"
              aria-expanded={showClassDropdown}
            >
              <span>
                {selectedClassId ? classes.find((c) => c.id === selectedClassId)?.name || 'Vald klass' : 'Alla klasser'}
              </span>
              <span className="ml-2 text-secondary flex items-center justify-center">
                <ChevronDown size={16} />
              </span>
            </button>

            {showClassDropdown && classes.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-card dark:bg-surface-secondary shadow-lg dark:shadow-dark-sm rounded-md border border-border dark:border-panel-border max-h-60 overflow-auto">
                <ul role="listbox">
                  <li
                    role="option"
                    aria-selected={selectedClassId === null}
                    className="px-4 py-2 text-base sm:text-sm hover:bg-surface-tertiary dark:hover:bg-surface-tertiary/80 cursor-pointer transition-colors text-foreground"
                    onClick={() => handleClassSelect(null)}
                  >
                    Alla klasser
                  </li>
                  {classes.map((cls) => (
                    <li
                      key={cls.id}
                      role="option"
                      aria-selected={selectedClassId === cls.id}
                      className="px-4 py-2 text-base sm:text-sm hover:bg-surface-tertiary dark:hover:bg-surface-tertiary/80 cursor-pointer transition-colors text-foreground"
                      onClick={() => handleClassSelect(cls.id)}
                    >
                      {formatClassLabel(cls as Class & { student_count?: number; count?: number })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Error message */}
        {errorMessage && !isLoading && (
          <div className="mt-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        
        {/* Selected class info */}
        {selectedClassId && (
          <p className="text-sm text-primary mt-1">
            Visar endast elever i vald klass
          </p>
        )}
      </div>
      
      {/* Selected student display */}
      {selectedStudent && (
        <div className="mt-2 p-2 bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 rounded-md">
          <p className="text-sm font-medium text-indigo-700 dark:text-primary">Vald elev: {selectedStudent.name}</p>
        </div>
      )}
      
      {/* Search results dropdown */}
      {showDropdown && students.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card dark:bg-surface-secondary shadow-lg dark:shadow-dark-sm rounded-md border border-border dark:border-panel-border max-h-60 overflow-auto">
          <ul>
            {students.map(student => (
              <li 
                key={student.id}
                className="px-4 py-2 hover:bg-surface-tertiary dark:hover:bg-surface-tertiary/80 cursor-pointer transition-colors text-foreground"
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
        <div className="absolute z-10 w-full mt-1 bg-card dark:bg-surface-secondary shadow-lg dark:shadow-dark-sm rounded-md border border-border dark:border-panel-border p-4">
          <p className="text-sm text-secondary dark:text-text-secondary">Inga elever hittades</p>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
