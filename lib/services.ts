const BACKEND_URL = 'https://140e-2401-4900-8fd9-3c92-60fe-1f72-ed0c-4f2f.ngrok-free.app';

async function fetcher(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Convert relative /api URL to absolute backend URL
  const absoluteUrl = url.startsWith('/api') 
    ? `${BACKEND_URL}${url}` 
    : `${BACKEND_URL}/api${url}`;

  const response = await fetch(absoluteUrl, { ...options, headers });
  
  if (response.status === 401 && typeof window !== 'undefined') {
    // Basic redirect on auth failure
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'API Request Failed');
  }

  return result.data || result;
}

export const transcriptionService = {
  /**
   * Fetch: Get full session transcript
   */
  getTranscription: async (appointmentId: string) => {
    return fetcher(`/api/transcription/${appointmentId}`);
  },
};

export const prescriptionService = {
  /**
   * Detail: Get clinical prescription for an appointment
   */
  getPrescription: async (appointmentId: string) => {
    return fetcher(`/api/prescription/${appointmentId}`);
  },

  /**
   * Edit: Update the AI-generated draft
   */
  updatePrescription: async (appointmentId: string, updateData: any) => {
    return fetcher(`/api/prescription/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Publish: Finalize draft so patient can see it
   */
  finalizePrescription: async (appointmentId: string) => {
    return fetcher(`/api/prescription/${appointmentId}/finalize`, {
      method: 'POST',
    });
  },
};
