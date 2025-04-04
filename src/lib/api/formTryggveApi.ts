// src/lib/api/formTryggveApi.ts - API route handlers for the Tryggve evaluation system

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
      return await fetchApi('/ham/v1/evaluation/save', {
        method: 'POST',
        headers: getHeaders(),
        body: {
          student_id: studentId,
          formData: formData
        }
      });
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
   * Get evaluation questions structure
   * 
   * This function uses the public endpoint (/public/v1/evaluation/questions) to get the
   * latest evaluation questions structure.
   * 
   * @returns {Promise<QuestionsStructure>} The evaluation questions structure
   */
  getQuestionsStructure: async () => {
    try {
      const data = await fetchApi('/public/v1/evaluation/questions');
      
      // If data is empty or doesn't have the expected structure, throw an error
      if (!data || !data.anknytning || !data.ansvar) {
        console.error('Invalid questions structure received:', data);
        throw new Error('Invalid questions structure');
      }

      return data;
    } catch (error) {
      console.error('Error fetching evaluation questions structure:', error);
      // Return a default structure if the API call fails
      return {
        anknytning: {
          title: 'Anknytning',
          questions: {}
        },
        ansvar: {
          title: 'Ansvar',
          questions: {}
        }
      };
    }
  }
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
