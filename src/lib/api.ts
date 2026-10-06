import { SafeEmployee, Skill, EmployeeSkillJoined, UserRole } from '../types/database';

const TOKEN_KEY = 'evonence_auth_token';
const USER_KEY = 'evonence_auth_user';

export const tokenStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: (): SafeEmployee | null => {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: SafeEmployee) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    tokenStorage.clear();
    // Redirect or trigger auth reset if needed
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || data.detail || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  auth: {
    login: async (Login_userid: string, password: string): Promise<{ token: string; user: SafeEmployee }> => {
      const data = await fetchWithAuth<{ token: string; user: SafeEmployee }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ Login_userid, password }),
      });
      tokenStorage.setToken(data.token);
      tokenStorage.setUser(data.user);
      return data;
    },
    me: async (): Promise<SafeEmployee> => {
      const data = await fetchWithAuth<{ user: SafeEmployee }>('/api/auth/me');
      tokenStorage.setUser(data.user);
      return data.user;
    },
    logout: async (): Promise<void> => {
      try {
        await fetchWithAuth('/api/auth/logout', { method: 'POST' });
      } finally {
        tokenStorage.clear();
      }
    },
  },

  employees: {
    list: async (params?: { search?: string; role?: string; is_active?: boolean }): Promise<SafeEmployee[]> => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.role) query.append('role', params.role);
      if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
      return fetchWithAuth<SafeEmployee[]>(`/api/employees?${query.toString()}`);
    },
    get: async (emp_id: number): Promise<SafeEmployee> => {
      return fetchWithAuth<SafeEmployee>(`/api/employees/${emp_id}`);
    },
    create: async (body: {
      fName: string;
      lName: string;
      Login_userid: string;
      password: string;
      roles: UserRole;
      is_active?: boolean;
    }): Promise<SafeEmployee> => {
      return fetchWithAuth<SafeEmployee>('/api/employees', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    update: async (
      emp_id: number,
      body: {
        fName?: string;
        lName?: string;
        Login_userid?: string;
        password?: string;
        roles?: UserRole;
        is_active?: boolean;
      }
    ): Promise<SafeEmployee> => {
      return fetchWithAuth<SafeEmployee>(`/api/employees/${emp_id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    delete: async (emp_id: number): Promise<{ message: string }> => {
      return fetchWithAuth<{ message: string }>(`/api/employees/${emp_id}`, {
        method: 'DELETE',
      });
    },
  },

  skills: {
    list: async (params?: { search?: string; skill_type?: string; category_name?: string }): Promise<Skill[]> => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.skill_type) query.append('skill_type', params.skill_type);
      if (params?.category_name) query.append('category_name', params.category_name);
      return fetchWithAuth<Skill[]>(`/api/skills?${query.toString()}`);
    },
    get: async (skill_id: number): Promise<Skill> => {
      return fetchWithAuth<Skill>(`/api/skills/${skill_id}`);
    },
    create: async (body: {
      skill_type: 'Technical skills' | 'Soft skills' | 'Hard skills';
      category_name: string;
      category_id: number;
      skillname: string;
    }): Promise<Skill> => {
      return fetchWithAuth<Skill>('/api/skills', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    update: async (
      skill_id: number,
      body: {
        skill_type?: 'Technical skills' | 'Soft skills' | 'Hard skills';
        category_name?: string;
        category_id?: number;
        skillname?: string;
      }
    ): Promise<Skill> => {
      return fetchWithAuth<Skill>(`/api/skills/${skill_id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    delete: async (skill_id: number): Promise<{ message: string }> => {
      return fetchWithAuth<{ message: string }>(`/api/skills/${skill_id}`, {
        method: 'DELETE',
      });
    },
  },

  employeeSkills: {
    list: async (params?: { emp_id?: number; skill_id?: number; is_active?: boolean }): Promise<EmployeeSkillJoined[]> => {
      const query = new URLSearchParams();
      if (params?.emp_id !== undefined) query.append('emp_id', String(params.emp_id));
      if (params?.skill_id !== undefined) query.append('skill_id', String(params.skill_id));
      if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
      return fetchWithAuth<EmployeeSkillJoined[]>(`/api/employee-skills?${query.toString()}`);
    },
    get: async (unique_id: number): Promise<EmployeeSkillJoined> => {
      return fetchWithAuth<EmployeeSkillJoined>(`/api/employee-skills/${unique_id}`);
    },
    createOrUpdate: async (body: {
      skill_id: number;
      emp_id?: number;
      self_rating: number;
      comments?: string;
      is_active?: boolean;
    }): Promise<EmployeeSkillJoined> => {
      return fetchWithAuth<EmployeeSkillJoined>('/api/employee-skills', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    update: async (
      unique_id: number,
      body: { self_rating?: number; comments?: string; is_active?: boolean }
    ): Promise<EmployeeSkillJoined> => {
      return fetchWithAuth<EmployeeSkillJoined>(`/api/employee-skills/${unique_id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    review: async (
      unique_id: number,
      body: {
        action: 'APPROVE' | 'REJECT' | 'EDIT';
        manager_notes?: string;
        reviewed_rating?: number;
      }
    ): Promise<{ message: string; record: EmployeeSkillJoined }> => {
      return fetchWithAuth<{ message: string; record: EmployeeSkillJoined }>(
        `/api/employee-skills/${unique_id}/review`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      );
    },
    delete: async (unique_id: number): Promise<{ message: string }> => {
      return fetchWithAuth<{ message: string }>(`/api/employee-skills/${unique_id}`, {
        method: 'DELETE',
      });
    },
  },

  stats: {
    dashboard: async (): Promise<any> => {
      return fetchWithAuth<any>('/api/stats/dashboard');
    },
  },

  system: {
    resetSeed: async (): Promise<{ message: string }> => {
      return fetchWithAuth<{ message: string }>('/api/system/reset-seed', {
        method: 'POST',
      });
    },
  },
};
