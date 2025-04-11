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
      
      // If data is completely empty after both attempts, try the assessment template endpoint
      if (!data) {
        console.warn('No data received from either questions endpoint, trying assessment template');
        try {
          data = await fetchApi('/public/v1/assessment/template');
          console.log('Data from assessment template endpoint:', data);
        } catch (templateError) {
          console.warn('Failed to fetch from assessment template endpoint:', templateError);
        }
      }
      
      // If still no data, use default structure
      if (!data) {
        console.warn('No data received from any endpoint, using default structure');
        return getDefaultQuestionsStructure();
      }
      
      // Log the complete data structure - this helps diagnose exactly where the questions are located
      console.log('Complete API response structure:', JSON.stringify(data, null, 2));
      
      // IMPROVED ERROR HANDLING: Check each level of the structure and provide defaults
      // rather than requiring a complete structure
      
      // Setup the final structure object with defaults for missing parts
      const structure = {
        anknytning: {
          title: data.anknytning?.title || 'Anknytningstecken',
          questions: {}
        },
        ansvar: {
          title: data.ansvar?.title || 'Ansvarstecken',
          questions: {}
        }
      };
      
      // Helper function to check if questions object is valid and non-empty
      const hasValidQuestions = (section: any, name: string): boolean => {
        return !!section && 
               !!section.questions && 
               typeof section.questions === 'object' &&
               Object.keys(section.questions || {}).length > 0;
      };
      
      // Handle anknytning section
      if (hasValidQuestions(data.anknytning, 'anknytning')) {
        console.log('Using API data for anknytning questions');
        structure.anknytning.questions = data.anknytning.questions;
      } else if (hasValidQuestions(data.questions_structure?.anknytning, 'anknytning structure')) {
        console.log('Using questions_structure for anknytning questions');
        structure.anknytning.questions = data.questions_structure.anknytning.questions;
      } else {
        console.log('Using default questions for anknytning section');
        structure.anknytning.questions = getDefaultAnknytningQuestions();
      }
      
      // Handle ansvar section
      if (hasValidQuestions(data.ansvar, 'ansvar')) {
        console.log('Using API data for ansvar questions');
        structure.ansvar.questions = data.ansvar.questions;
      } else if (hasValidQuestions(data.questions_structure?.ansvar, 'ansvar structure')) {
        console.log('Using questions_structure for ansvar questions');
        structure.ansvar.questions = data.questions_structure.ansvar.questions;
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
    } catch (error) {
      console.error('Error fetching questions structure:', error);
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
