// src/lib/api/formTryggveApi.ts - API route handlers for the Tryggve evaluation system

import { QuestionsStructure, FormData, EvaluationData, Question } from '../types/formTypesEvaluation';
import { API_URL, fetchApi } from './baseApi';
import { UserInfo, AuthResponse } from '../types/authTypes';

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
  saveEvaluation: async (studentId: number, formData: FormData) => {
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
  getEvaluation: async (evaluationId: number): Promise<EvaluationData> => {
    try {
      // Get the evaluation data
      const evaluationData = await fetchApi<EvaluationData>(`/ham/v1/evaluations/${evaluationId}`, {
        headers: getHeaders()
      });
      
      return evaluationData;
    } catch (error) {
      console.error('Error getting evaluation:', error);
      // Return a default structure if there was an error
      throw new Error(`Failed to get evaluation: ${error}`);
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
  getQuestionsStructure: async (): Promise<QuestionsStructure> => {
    try {
      const structureData = await fetchApi<QuestionsStructure>('/ham/v1/evaluation/structure', {
        revalidate: 3600, // Cache seconds
      });
      
      // Return the structure data if it's valid
      if (structureData && typeof structureData === 'object') {
        return structureData;
      }
      
      throw new Error('Invalid questions structure format');
    } catch (error) {
      console.error('Error fetching questions structure:', error);
      
      // Return a default structure as a fallback
      const defaultOptions = [
        { value: 'ej', label: 'Ej', stage: 'ej' as const },
        { value: 'trans', label: 'Trans', stage: 'trans' as const },
        { value: 'full', label: 'Full', stage: 'full' as const }
      ];
      
      const defaultQuestion: Question = {
        text: '',
        options: defaultOptions
      };
      
      const defaultStructure: QuestionsStructure = {
        anknytning: {
          title: 'Anknytningsbeteende',
          questions: {
            narvaro: { ...defaultQuestion, text: 'Närvaro' },
            dialog1: { ...defaultQuestion, text: 'Dialog (att tala till)' },
            dialog2: { ...defaultQuestion, text: 'Dialog (att lyssna på)' },
            blick: { ...defaultQuestion, text: 'Blickkontakt' },
            beroring: { ...defaultQuestion, text: 'Beröring' },
            konflikt: { ...defaultQuestion, text: 'Konflikt' },
            fortroende: { ...defaultQuestion, text: 'Förtroende' }
          }
        },
        ansvar: {
          title: 'Ansvarstecken',
          questions: {
            impulskontroll: { ...defaultQuestion, text: 'Impulskontroll' },
            forberedd: { ...defaultQuestion, text: 'Förberedd och i tid' },
            fokus: { ...defaultQuestion, text: 'Fokus' },
            turtagning: { ...defaultQuestion, text: 'Turtagning' },
            instruktion: { ...defaultQuestion, text: 'Instruktion' },
            arbeta_sjalv: { ...defaultQuestion, text: 'Arbeta självständigt' },
            tid: { ...defaultQuestion, text: 'Tid' }
          }
        }
      };
      
      return defaultStructure;
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
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetchApi<AuthResponse>('/ham/v1/auth/token', {
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
  getCurrentUser: async (): Promise<UserInfo | null> => {
    try {
      // Check if we have a valid token first
      const isValid = await authApi.validateToken();
      if (!isValid) {
        console.warn('No valid token found when getting current user');
        return null;
      }
      
      // Get user info from the HAM plugin
      const userInfo = await fetchApi<UserInfo>('/ham/v1/user/current', {
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
  validateToken: async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetchApi<{ valid: boolean }>('/ham/v1/auth/validate', {
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
