// src/lib/api/formTryggveApi.ts - API route handlers for the Tryggve evaluation system

import { QuestionsStructure } from '../types/formTypesEvaluation';
import { API_URL, fetchApi } from './baseApi';

// Define interface for the evaluation API response data
interface EvaluationAPIResponse {
  success: boolean;
  data: {
    anknytning?: {
      title?: string;
      questions?: Record<string, unknown>;
    };
    ansvar?: {
      title?: string;
      questions?: Record<string, unknown>;
    };
    questions_structure?: {
      anknytning?: {
        title?: string;
        questions?: Record<string, unknown>;
      };
      ansvar?: {
        title?: string;
        questions?: Record<string, unknown>;
      };
    };
    [key: string]: unknown;
  } | null;
  status: number;
  error?: {
    message: string;
  };
}

// JWT token handling
let token: string | null = null;

/**
 * Set the JWT token for API requests
 */
const setTokenInternal = (newToken: string) => {
  token = newToken;
  console.log('Auth token set');
};

/**
 * Clear the JWT token
 */
const clearTokenInternal = () => {
  token = null;
  console.log('Auth token cleared');
};

// Also export these for backward compatibility
export const setToken = setTokenInternal;
export const clearToken = clearTokenInternal;

/**
 * Get authorization headers with JWT token
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * API route handlers for assessment templates
 */
export const assessmentTemplatesApi = {
  /**
   * Get all assessment templates
   */
  getTemplates: async () => {
    try {
      return await fetchApi('/ham/v1/assessment-templates', {
        headers: getHeaders()
      });
    } catch {
      console.error('Error fetching templates:');
      throw new Error('Error fetching templates');
    }
  },

  /**
   * Get a specific assessment template
   */
  getTemplate: async (id: number) => {
    try {
      return await fetchApi(`/ham/v1/assessment-templates/${id}`, {
        headers: getHeaders()
      });
    } catch {
      console.error(`Error fetching template ${id}:`);
      throw new Error(`Error fetching template ${id}`);
    }
  },

  /**
   * Get a template's form structure
   */
  getTemplateStructure: async (id: number) => {
    try {
      return await fetchApi(`/ham/v1/assessment-templates/${id}/structure`, {
        headers: getHeaders()
      });
    } catch {
      console.error(`Error fetching template structure ${id}:`);
      throw new Error(`Error fetching template structure ${id}`);
    }
  }
};

/**
 * API route handlers for evaluations
 */
export const evaluationApi = {
  /**
   * Test the evaluation API endpoint
   */
  testEndpoint: async () => {
    try {
      // Try to ping the base API to see if it's responding
      const response = await fetch(`${API_URL}/wp/v2/types`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      console.log('API connection test result:', response.ok);
      return response.ok;
    } catch {
      console.error('API connection test failed:');
      return false;
    }
  },

  /**
   * Save an evaluation
   */
  saveEvaluation: async (studentId: number, formData: Record<string, unknown>) => {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      
      // Convert formData to a JSON string
      const formDataString = JSON.stringify(formData);
      console.log('formData as string:', formDataString);
      
      // Create a proper URL-encoded body directly rather than using FormData
      // This bypasses the JSON.stringify in the fetchApi function
      const body = `student_id=${encodeURIComponent(studentId)}&formData=${encodeURIComponent(formDataString)}`;
      
      console.log('Request body:', body);
      
      // CORS FIX: Use direct fetch instead of fetchApi to customize CORS settings
      const apiUrl = `${API_URL}/wp-json/ham/v1/evaluation/save`;
      console.log('Sending request to:', apiUrl);
      
      // Use the existing getHeaders function to get authorization headers
      const allHeaders = getHeaders();
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      
      // Only add Authorization from the headers if it exists
      if (allHeaders.Authorization) {
        headers['Authorization'] = allHeaders.Authorization;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: body,
        credentials: 'include', // Include cookies if needed
        mode: 'cors', // Explicit CORS mode
      });
      
      if (!response.ok) {
        console.error('Server responded with error:', response.status, response.statusText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error('Error saving evaluation:', error);
      // Return an error object rather than throwing
      return { 
        success: false, 
        error: { message: 'Failed to save evaluation. Please try again.' } 
      };
    }
  },

  /**
   * Get an evaluation by ID
   */
  getEvaluation: async (id: number) => {
    try {
      return await fetchApi(`/ham/v1/evaluation/get/${id}`, {
        headers: getHeaders()
      });
    } catch {
      console.error(`Error fetching evaluation ${id}:`);
      throw new Error(`Error fetching evaluation ${id}`);
    }
  },

  /**
   * List evaluations for a student
   */
  listEvaluations: async (studentId: number) => {
    try {
      return await fetchApi(`/ham/v1/evaluation/list/${studentId}`, {
        headers: getHeaders()
      });
    } catch {
      console.error(`Error listing evaluations for student ${studentId}:`);
      throw new Error(`Error listing evaluations for student ${studentId}`);
    }
  },

  /**
   * Get the latest evaluation questions structure.
   * 
   * @returns {Promise<QuestionsStructure>} The evaluation questions structure
   */
  getQuestionsStructure: async () => {
    try {
      // Try both endpoint formats to ensure we get data
      let data: EvaluationAPIResponse;
      let endpointUsed = '';
      
      // First try the standard endpoint format that should work
      try {
        endpointUsed = '/public/v1/evaluation/questions';
        console.log(`Trying endpoint: ${API_URL}${endpointUsed}`);
        data = await fetchApi(endpointUsed);
        console.log('Data received from standard endpoint:', data);
      } catch {
        console.warn('Failed to fetch with standard endpoint, trying WP REST format');
        
        // If that fails, try the WordPress REST API format
        endpointUsed = '/wp-json/public/v1/evaluation/questions';
        console.log(`Trying WP REST endpoint: ${API_URL}${endpointUsed}`);
        data = await fetchApi(endpointUsed);
        console.log('Data received from WP REST endpoint:', data);
      }
      
      // If data is completely empty after both attempts, try the assessment template endpoint
      if (!data) {
        console.warn('No data received from either questions endpoint, trying assessment template');
        try {
          data = await fetchApi('/public/v1/assessment/template');
          console.log('Data from assessment template endpoint:', data);
        } catch {
          console.warn('Failed to fetch from assessment template endpoint:');
        }
      }
      
      // Log the complete data structure - this helps diagnose exactly where the questions are located
      console.log('Complete API response structure:', JSON.stringify(data, null, 2));
      
      // If still no data, use default structure
      if (!data) {
        console.warn('No data received from any endpoint, using default structure');
        return getDefaultQuestionsStructure();
      }
      
      // CRITICAL FIX: Determine where the question data is located in the response
      // The API might return data directly or nested in a 'data' property
      const apiData = ('data' in data && data.data) ? data.data : data;
      
      // Type assertion to handle any API response format
      const typedApiData = apiData as {
        anknytning?: {
          title?: string;
          questions?: Record<string, unknown>;
        };
        ansvar?: {
          title?: string;
          questions?: Record<string, unknown>;
        };
        questions_structure?: {
          anknytning?: {
            title?: string;
            questions?: Record<string, unknown>;
          };
          ansvar?: {
            title?: string;
            questions?: Record<string, unknown>;
          };
        };
      };
      
      // IMPROVED ERROR HANDLING: Check each level of the structure and provide defaults
      // rather than requiring a complete structure
      
      // Setup the final structure object with defaults for missing parts
      const structure = {
        anknytning: {
          title: typedApiData.anknytning?.title || 'Anknytningstecken',
          questions: {}
        },
        ansvar: {
          title: typedApiData.ansvar?.title || 'Ansvarstecken',
          questions: {}
        }
      };
      
      // Helper function to check if questions object is valid and non-empty
      const hasValidQuestions = (section: Record<string, unknown> | undefined): boolean => {
        return !!section && 
               'questions' in section &&
               !!section.questions && 
               typeof section.questions === 'object' &&
               Object.keys(section.questions || {}).length > 0;
      };
      
      // Handle anknytning section
      if (hasValidQuestions(typedApiData.anknytning)) {
        console.log('Using API data for anknytning questions');
        // TypeScript safe assignment with non-null assertion
        if (typedApiData.anknytning?.questions) {
          structure.anknytning.questions = typedApiData.anknytning.questions as Record<string, unknown>;
        }
      } else if (typedApiData.questions_structure && hasValidQuestions(typedApiData.questions_structure.anknytning)) {
        console.log('Using questions_structure for anknytning questions');
        // TypeScript safe assignment with non-null assertion
        if (typedApiData.questions_structure.anknytning?.questions) {
          structure.anknytning.questions = typedApiData.questions_structure.anknytning.questions as Record<string, unknown>;
        }
      } else {
        console.log('Using default questions for anknytning section');
        structure.anknytning.questions = getDefaultAnknytningQuestions();
      }
      
      // Handle ansvar section
      if (hasValidQuestions(typedApiData.ansvar)) {
        console.log('Using API data for ansvar questions');
        // TypeScript safe assignment with non-null assertion
        if (typedApiData.ansvar?.questions) {
          structure.ansvar.questions = typedApiData.ansvar.questions as Record<string, unknown>;
        }
      } else if (typedApiData.questions_structure && hasValidQuestions(typedApiData.questions_structure.ansvar)) {
        console.log('Using questions_structure for ansvar questions');
        // TypeScript safe assignment with non-null assertion
        if (typedApiData.questions_structure.ansvar?.questions) {
          structure.ansvar.questions = typedApiData.questions_structure.ansvar.questions as Record<string, unknown>;
        }
      } else {
        console.log('Using default questions for ansvar section');
        structure.ansvar.questions = getDefaultAnsvarQuestions();
      }
      
      console.log('Final structure:', {
        anknytning: {
          title: structure.anknytning.title,
          questionCount: Object.keys(structure.anknytning.questions).length
        },
        ansvar: {
          title: structure.ansvar.title,
          questionCount: Object.keys(structure.ansvar.questions).length
        }
      });
      
      return structure;
    } catch {
      console.error('Error fetching questions structure:');
      return getDefaultQuestionsStructure();
    }
  },
};

/**
 * API route handler for authentication
 */
export const authApi = {
  /**
   * Set the JWT token for API requests
   */
  setToken: (newToken: string) => {
    setTokenInternal(newToken);
  },

  /**
   * Clear the JWT token
   */
  clearToken: () => {
    clearTokenInternal();
  },

  /**
   * Login to get JWT token
   */
  login: async (username: string, password: string) => {
    try {
      // Use the Next.js API route instead of calling WordPress directly
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'login',
          username, 
          password 
        }),
      });
      
      const data = await response.json();
      
      if (data.token) {
        setTokenInternal(data.token);
      }
      
      return data;
    } catch {
      console.error('Error during login:');
      return { error: true, message: 'Login failed' };
    }
  },

  /**
   * Get current user information including student ID if available
   */
  getCurrentUser: async () => {
    try {
      // Validate token first
      const isValid = await authApi.validateToken();
      if (!isValid) {
        return null;
      }
      
      // Use the Next.js API route
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'user',
          token
        }),
      });
      
      return await response.json();
    } catch {
      console.error('Error getting current user:');
      return null;
    }
  },

  /**
   * Validate JWT token
   */
  validateToken: async () => {
    if (!token) return false;

    try {
      // Use the Next.js API route
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'validate',
          token
        }),
      });
      
      const data = await response.json();
      return data.valid === true;
    } catch {
      console.error('Error validating token:');
      clearTokenInternal();
      return false;
    }
  }
};

// Helper function to get default anknytning questions
function getDefaultAnknytningQuestions() {
  return {
    'default-anknytning-1': {
      text: 'Hur upplever du att barnet söker kontakt?',
      options: [
        { value: 'option1', label: 'Söker sällan kontakt', stage: 'ej' as const },
        { value: 'option2', label: 'Söker ibland kontakt', stage: 'trans' as const },
        { value: 'option3', label: 'Söker ofta kontakt', stage: 'full' as const }
      ]
    },
    'default-anknytning-2': {
      text: 'Hur nyfiket är barnet på sin omgivning?',
      options: [
        { value: 'option1', label: 'Visar lite nyfikenhet', stage: 'ej' as const },
        { value: 'option2', label: 'Visar viss nyfikenhet', stage: 'trans' as const },
        { value: 'option3', label: 'Visar stor nyfikenhet', stage: 'full' as const }
      ]
    }
  };
}

// Helper function to get default ansvar questions
function getDefaultAnsvarQuestions() {
  return {
    'default-ansvar-1': {
      text: 'Hur tar barnet ansvar för sina handlingar?',
      options: [
        { value: 'option1', label: 'Tar sällan ansvar', stage: 'ej' as const },
        { value: 'option2', label: 'Tar ibland ansvar', stage: 'trans' as const },
        { value: 'option3', label: 'Tar ofta ansvar', stage: 'full' as const }
      ]
    },
    'default-ansvar-2': {
      text: 'Hur självständigt är barnet i vardagliga aktiviteter?',
      options: [
        { value: 'option1', label: 'Behöver mycket stöd', stage: 'ej' as const },
        { value: 'option2', label: 'Behöver visst stöd', stage: 'trans' as const },
        { value: 'option3', label: 'Klarar sig mestadels själv', stage: 'full' as const }
      ]
    }
  };
}

// Helper function to get the default questions structure
function getDefaultQuestionsStructure(): QuestionsStructure {
  return {
    anknytning: {
      title: 'Anknytningstecken',
      questions: getDefaultAnknytningQuestions()
    },
    ansvar: {
      title: 'Ansvarstecken',
      questions: getDefaultAnsvarQuestions()
    }
  };
}
