// src/lib/api/formTryggveApi.ts - API route handlers for the Tryggve evaluation system

import { QuestionsStructure } from '../types/formTypesEvaluation';
import { API_URL, fetchApi } from './baseApi';

// JWT token handling
let token: string | null = null;

/**
 * Set the JWT token for API requests
 */
export const setToken = (newToken: string) => {
  token = newToken;
};

/**
 * Clear the JWT token
 */
export const clearToken = () => {
  token = null;
};

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
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
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
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
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
    } catch (error) {
      console.error(`Error fetching template structure ${id}:`, error);
      throw error;
    }
  }
};

/**
 * API route handlers for evaluations
 */
export const evaluationApi = {
  /**
   * Save an evaluation
   */
  saveEvaluation: async (studentId: number, formData: any) => {
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
      
      const response = await fetchApi('/ham/v1/evaluation/save', {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body // Pass the pre-encoded string directly
      });
      
      console.log('API response:', response);
      return response;
    } catch (error) {
      console.error('Error saving evaluation:', error);
      throw error;
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
    } catch (error) {
      console.error(`Error fetching evaluation ${id}:`, error);
      throw error;
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
    } catch (error) {
      console.error(`Error listing evaluations for student ${studentId}:`, error);
      throw error;
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
      let data;
      let endpointUsed = '';
      
      // First try the standard endpoint format that should work
      try {
        endpointUsed = '/public/v1/evaluation/questions';
        console.log(`Trying endpoint: ${API_URL}${endpointUsed}`);
        data = await fetchApi(endpointUsed);
        console.log('Data received from standard endpoint:', data);
      } catch (error) {
        console.warn('Failed to fetch with standard endpoint, trying WP REST format');
        
        // If that fails, try the WordPress REST API format
        endpointUsed = '/wp-json/public/v1/evaluation/questions';
        console.log(`Trying WP REST endpoint: ${API_URL}${endpointUsed}`);
        data = await fetchApi(endpointUsed);
        console.log('Data received from WP REST endpoint:', data);
      }
      
      // If data is completely empty after both attempts, return default structure
      if (!data) {
        console.warn('No data received from either endpoint, using default structure');
        return getDefaultQuestionsStructure();
      }
      
      // Log the complete data structure - this helps diagnose exactly where the questions are located
      console.log('Complete API response structure:', JSON.stringify(data, null, 2));
      
      // First, check if the data already has the detailed structure format from the admin
      if (data.anknytning && 
          data.anknytning.questions && 
          Object.keys(data.anknytning.questions).length > 0 &&
          data.anknytning.questions.a1 && 
          data.anknytning.questions.a1.text) {
        
        console.log('Found detailed questions structure directly in API response');
        return data;
      }
      
      // Check if we have the expected data structure
      const hasAnknytning = data.anknytning && typeof data.anknytning === 'object';
      const hasAnsvar = data.ansvar && typeof data.ansvar === 'object';
      
      if (!hasAnknytning || !hasAnsvar) {
        console.warn('API response missing expected sections, using default structure');
        return getDefaultQuestionsStructure();
      }
      
      // Check for questions_structure field (as seen in the admin console output)
      if (data.questions_structure) {
        console.log('Found questions_structure field in API response, will use this data');
        // If we have a nested questions_structure, use it
        if (data.questions_structure.anknytning && data.questions_structure.ansvar) {
          return {
            anknytning: data.questions_structure.anknytning,
            ansvar: data.questions_structure.ansvar
          };
        }
      }
      
      // Handle the specific case where sections exist but questions arrays are empty or not arrays
      const anknytningQuestions = hasAnknytning && data.anknytning.questions && 
                                  (Array.isArray(data.anknytning.questions) ? 
                                    data.anknytning.questions : 
                                    Object.keys(data.anknytning.questions || {}).length > 0 ? 
                                      data.anknytning.questions : 
                                      null);
                                      
      const ansvarQuestions = hasAnsvar && data.ansvar.questions && 
                              (Array.isArray(data.ansvar.questions) ? 
                                data.ansvar.questions.length > 0 ? data.ansvar.questions : null : 
                                Object.keys(data.ansvar.questions || {}).length > 0 ? 
                                  data.ansvar.questions : 
                                  null);
      
      const hasValidAnknytningQuestions = anknytningQuestions !== null;
      const hasValidAnsvarQuestions = ansvarQuestions !== null;
      
      console.log('Sections status:', {
        anknytning: hasAnknytning ? (hasValidAnknytningQuestions ? 'has questions' : 'empty questions') : 'missing',
        ansvar: hasAnsvar ? (hasValidAnsvarQuestions ? 'has questions' : 'empty questions') : 'missing'
      });
      
      // If both sections have empty or invalid questions, use the default structure
      if (!hasValidAnknytningQuestions && !hasValidAnsvarQuestions) {
        console.warn('No valid questions found in either section, using default structure');
        
        // Try to directly fetch the structure from the assessment templates
        try {
          console.log('Attempting to fetch assessment template structure directly');
          
          // This is a hunch - try a different endpoint that might provide the template
          const templateData = await fetchApi('/public/v1/assessment/template');
          console.log('Template data:', templateData);
          
          if (templateData && 
              templateData.anknytning && 
              templateData.anknytning.questions &&
              Object.keys(templateData.anknytning.questions).length > 0) {
            console.log('Successfully retrieved template data');
            return templateData;
          }
        } catch (error) {
          console.warn('Failed to fetch assessment template:', error);
        }
        
        return getDefaultQuestionsStructure();
      }
      
      // Create structure with the section data, using defaults for empty sections
      const structure = {
        anknytning: {
          title: data.anknytning.title || 'Anknytningstecken',
          questions: hasValidAnknytningQuestions ? data.anknytning.questions : getDefaultAnknytningQuestions()
        },
        ansvar: {
          title: data.ansvar.title || 'Ansvarstecken',
          questions: hasValidAnsvarQuestions ? data.ansvar.questions : getDefaultAnsvarQuestions()
        }
      };
      
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
    } catch (error) {
      console.error('Error fetching questions structure:', error);
      // Return a default structure in case of error
      return getDefaultQuestionsStructure();
    }
  },
};

/**
 * API route handler for authentication
 */
export const authApi = {
  /**
   * Login to get JWT token
   */
  login: async (username: string, password: string) => {
    try {
      const response = await fetchApi('/ham/v1/auth/token', {
        method: 'POST',
        body: {
          username,
          password
        }
      });

      if (response && response.token) {
        setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  /**
   * Get current user information including student ID if available
   */
  getCurrentUser: async () => {
    try {
      // Check if we have a valid token first
      const isValid = await authApi.validateToken();
      if (!isValid) {
        console.warn('No valid token found when getting current user');
        return null;
      }
      
      // Get user info from the HAM plugin
      const userInfo = await fetchApi('/ham/v1/user/current', {
        headers: getHeaders()
      });
      
      return userInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Validate JWT token
   */
  validateToken: async () => {
    if (!token) return false;

    try {
      const response = await fetchApi('/ham/v1/auth/validate', {
        headers: getHeaders()
      });
      return response.valid;
    } catch (error) {
      console.error('Error validating token:', error);
      clearToken();
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
        { value: 'option1', label: 'Söker sällan kontakt', stage: 'ej' as 'ej' },
        { value: 'option2', label: 'Söker ibland kontakt', stage: 'trans' as 'trans' },
        { value: 'option3', label: 'Söker ofta kontakt', stage: 'full' as 'full' }
      ]
    },
    'default-anknytning-2': {
      text: 'Hur nyfiket är barnet på sin omgivning?',
      options: [
        { value: 'option1', label: 'Visar lite nyfikenhet', stage: 'ej' as 'ej' },
        { value: 'option2', label: 'Visar viss nyfikenhet', stage: 'trans' as 'trans' },
        { value: 'option3', label: 'Visar stor nyfikenhet', stage: 'full' as 'full' }
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
        { value: 'option1', label: 'Tar sällan ansvar', stage: 'ej' as 'ej' },
        { value: 'option2', label: 'Tar ibland ansvar', stage: 'trans' as 'trans' },
        { value: 'option3', label: 'Tar ofta ansvar', stage: 'full' as 'full' }
      ]
    },
    'default-ansvar-2': {
      text: 'Hur självständigt är barnet i vardagliga aktiviteter?',
      options: [
        { value: 'option1', label: 'Behöver mycket stöd', stage: 'ej' as 'ej' },
        { value: 'option2', label: 'Behöver visst stöd', stage: 'trans' as 'trans' },
        { value: 'option3', label: 'Klarar sig mestadels själv', stage: 'full' as 'full' }
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
