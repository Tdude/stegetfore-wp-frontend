// src/lib/api/formTryggveApi.ts - API route handlers for the Tryggve evaluation system

import { QuestionsStructure } from '../types/formTypesEvaluation';
import { API_URL, fetchApi } from './baseApi';
import { shouldSendAuthHeader } from '../utils/shouldSendAuthHeader';

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

// On load, initialize token from localStorage if present
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('auth_token');
  if (storedToken) {
    token = storedToken;
    // Optionally: console.log('Auth token loaded from localStorage');
  }
}

/**
 * Set the JWT token for API requests
 */
const setTokenInternal = (newToken: string) => {
  token = newToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', newToken);
  }
  console.log('Auth token set');
};

/**
 * Clear the JWT token
 */
const clearTokenInternal = () => {
  token = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
  console.log('Auth token cleared');
};

// Also export these for backward compatibility
export const setToken = setTokenInternal;
export const clearToken = clearTokenInternal;

/**
 * HOWTO: Authorization Header Pattern for Custom WP API Calls
 *
 * - Always use the shouldSendAuthHeader(token) utility to determine if the Authorization header should be sent.
 * - This prevents CORS issues in development and avoids sending dev tokens to the backend.
 *
 * Example usage:
 *   import { shouldSendAuthHeader } from '../utils/shouldSendAuthHeader';
 *   const headers = {
 *     'Content-Type': 'application/json',
 *     ...(token && shouldSendAuthHeader(token) ? { 'Authorization': `Bearer ${token}` } : {})
 *   };
 *
 * - In development: The header is omitted unless a real token is present.
 * - In production:  The header is sent only if a real token is available.
 *
 * This pattern should be used for all custom form APIs and any future endpoints that may or may not require authentication.
 */
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    ...(token && shouldSendAuthHeader(token) ? { 'Authorization': `Bearer ${token}` } : {})
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
      
      // IMPORTANT: Make sure we're using the correct API URL
      // Avoid double "/wp-json" paths which can happen if API_URL already includes it
      let baseApiUrl = API_URL;
      if (baseApiUrl.endsWith('/wp-json')) {
        baseApiUrl = baseApiUrl.substring(0, baseApiUrl.length - 8); // Remove trailing /wp-json
      }
      
      const apiUrl = `${baseApiUrl}/wp-json/ham/v1/evaluation/save`;
      console.log('Sending request to:', apiUrl);
      console.log('API_URL value:', API_URL);
      
      // Use the existing getHeaders function to get authorization headers
      const allHeaders = getHeaders();
      console.log('Authorization headers:', allHeaders);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      
      // Only add Authorization from the headers if it exists and should be sent
      if (allHeaders.Authorization && shouldSendAuthHeader(token)) {
        headers['Authorization'] = allHeaders.Authorization;
      }
      
      console.log('Final request headers:', headers);
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: body,
        mode: 'cors', // Explicit CORS mode
      });
      
      // Log response status and headers
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', {
        'content-type': response.headers.get('content-type'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      });
      
      if (!response.ok) {
        console.error('Server responded with error:', response.status, response.statusText);
        try {
          // Try to parse error response body
          const errorBody = await response.text();
          console.error('Error response body:', errorBody);
          
          // If it's JSON, parse it
          try {
            const errorJson = JSON.parse(errorBody);
            return { 
              success: false, 
              error: { 
                message: errorJson.message || 'Server returned an error', 
                details: errorJson 
              },
              status: response.status
            };
          } catch {
            // Not JSON, return as text
            return { 
              success: false, 
              error: { message: `Server error: ${errorBody || response.statusText}` },
              status: response.status
            };
          }
        } catch {
          console.error('Failed to parse error response:');
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      // Try to parse the response
      try {
        const data = await response.json();
        console.log('API success response:', data);
        return {
          success: true,
          data
        };
      } catch {
        console.error('Failed to parse success response as JSON:');
        // Try to get the text instead
        const text = await response.text();
        console.log('Response as text:', text);
        return {
          success: true,
          data: { raw_response: text }
        };
      }
    } catch {
      console.error('Error saving evaluation:');
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
      // console.log('Complete API response structure:', JSON.stringify(data, null, 2));
      
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

// --- JWT User Info Type ---
export interface JwtUserInfo {
  user_id: number;
  exp: number;
  [key: string]: unknown;
}

// --- Expiry Validation Helper ---
const isTokenValid = () => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
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
      // Directly call the WordPress JWT endpoint (custom HAM plugin)
      const response = await fetch(`${API_URL}/ham/v1/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
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
   * Validate JWT token (checks presence and expiry)
   */
  validateToken: async () => {
    return isTokenValid();
  },

  /**
   * Get current user info from JWT (decode payload, robust)
   */
  getCurrentUser: async (): Promise<JwtUserInfo | null> => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.user_id || !payload.exp) return null;
      // Optionally, check expiry again
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;
      return payload as JwtUserInfo;
    } catch {
      return null;
    }
  },
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
