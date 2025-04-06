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
      // Log the data being sent for debugging
      console.log('saveEvaluation called with studentId:', studentId);
      console.log('saveEvaluation formData:', formData);
      
      // Use URLSearchParams to send data in the format WordPress REST API expects
      const params = new URLSearchParams();
      
      // Check if studentId exists and convert to string safely
      if (studentId !== undefined && studentId !== null) {
        params.append('student_id', String(studentId));
      } else {
        console.error('Student ID is undefined or null');
        throw new Error('Student ID is required');
      }
      
      // Convert formData to a JSON string
      const formDataString = JSON.stringify(formData);
      console.log('formData as string:', formDataString);
      params.append('formData', formDataString);
      
      console.log('Request params:', params.toString());
      
      const response = await fetchApi('/ham/v1/evaluation/save', {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
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
      const data = await fetchApi('/public/v1/evaluation/questions');
      
      // If data is completely empty, return default structure
      if (!data) {
        console.warn('Empty questions structure received, using default');
        return {
          anknytning: {
            title: 'Anknytningstecken',
            questions: {}
          },
          ansvar: {
            title: 'Ansvarstecken',
            questions: {}
          }
        };
      }

      // Ensure we have a proper structure, even if parts are missing
      const structure: QuestionsStructure = {
        anknytning: {
          title: data.anknytning?.title || 'Anknytningstecken',
          questions: data.anknytning?.questions || {}
        },
        ansvar: {
          title: data.ansvar?.title || 'Ansvarstecken',
          questions: data.ansvar?.questions || {}
        }
      };

      return structure;
    } catch (error) {
      console.error('Error fetching questions structure:', error);
      // Return a default structure in case of error
      return {
        anknytning: {
          title: 'Anknytningstecken',
          questions: {}
        },
        ansvar: {
          title: 'Ansvarstecken',
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
