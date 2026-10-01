import { STORAGE_KEYS } from '@/utils/constants';
import { storageService } from '@/services/storage/localStorage';

// Seed mock database for Users & Employees
let mockUsers = [
  { id: 'usr_1', name: 'Sophia Patel', email: 'sophia.patel@company.com', role: 'Admin', department: 'Engineering', status: 'Active', createdAt: '2025-01-15' },
  { id: 'usr_2', name: 'Alexander Wright', email: 'alex.wright@company.com', role: 'Manager', department: 'Product', status: 'Active', createdAt: '2025-02-10' },
  { id: 'usr_3', name: 'Elena Rostova', email: 'elena.rostova@company.com', role: 'Employee', department: 'Design', status: 'Active', createdAt: '2025-03-01' },
  { id: 'usr_4', name: 'Marcus Chen', email: 'marcus.chen@company.com', role: 'Employee', department: 'Marketing', status: 'Inactive', createdAt: '2025-03-14' },
  { id: 'usr_5', name: 'Chloe Dubois', email: 'chloe.dubois@company.com', role: 'Manager', department: 'Finance', status: 'Active', createdAt: '2025-04-02' },
];

let mockEmployees = [
  { id: 'emp_101', name: 'Liam Vance', email: 'liam.vance@company.com', position: 'Senior Backend Engineer', department: 'Engineering', salary: 125000, joinedDate: '2023-04-12', status: 'Full-time' },
  { id: 'emp_102', name: 'Maya Lin', email: 'maya.lin@company.com', position: 'Lead UI/UX Designer', department: 'Design', salary: 110000, joinedDate: '2023-08-20', status: 'Full-time' },
  { id: 'emp_103', name: 'Ethan Hunt', email: 'ethan.hunt@company.com', position: 'Product Marketing Lead', department: 'Marketing', salary: 98000, joinedDate: '2024-01-05', status: 'Full-time' },
  { id: 'emp_104', name: 'Sarah Connor', email: 'sarah.connor@company.com', position: 'Security Specialist', department: 'Engineering', salary: 135000, joinedDate: '2022-11-18', status: 'Full-time' },
  { id: 'emp_105', name: 'David Kim', email: 'david.kim@company.com', position: 'Financial Analyst', department: 'Finance', salary: 92000, joinedDate: '2024-06-01', status: 'Contract' },
];

export function setupInterceptors(apiInstance) {
  // Request Interceptor: Attach Auth Token
  apiInstance.interceptors.request.use(
    (config) => {
      const token = storageService.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Format and Mock Fallback
  apiInstance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      const { config } = error;
      if (config) {
        const mockResult = await handleMockApi(config);
        if (mockResult) return mockResult;
      }

      if (error.response?.status === 401) {
        storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        storageService.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = '/login';
      }

      const formattedError = {
        message: error.response?.data?.message || error.message || 'API request failed',
        status: error.response?.status || 500,
      };

      return Promise.reject(formattedError);
    }
  );
}

/**
 * Built-in mock handler for out-of-the-box functioning demo
 */
async function handleMockApi(config) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // Auth: Login
  if (url.includes('/auth/login') && method === 'post') {
    const data = JSON.parse(config.data || '{}');
    const user = {
      id: 'usr_current',
      name: data.email.split('@')[0] || 'Admin User',
      email: data.email,
      role: 'Admin',
      department: 'Executive',
    };
    const token = 'jwt_token_mock_' + Date.now();
    return { success: true, data: { user, token } };
  }

  // Auth: Register
  if (url.includes('/auth/register') && method === 'post') {
    const data = JSON.parse(config.data || '{}');
    const user = {
      id: 'usr_' + Date.now(),
      name: data.name || 'New Member',
      email: data.email,
      role: 'Employee',
      department: 'General',
    };
    const token = 'jwt_token_mock_' + Date.now();
    return { success: true, data: { user, token } };
  }

  // Users: List
  if (url.includes('/users') && method === 'get') {
    const params = config.params || {};
    const search = (params.search || '').toLowerCase();
    const department = params.department || '';

    let filtered = [...mockUsers];
    if (department && department !== 'All') {
      filtered = filtered.filter((u) => u.department === department);
    }
    if (search) {
      filtered = filtered.filter((u) =>
        u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }
    return { success: true, data: filtered };
  }

  // Users: Create
  if (url.includes('/users') && method === 'post') {
    const payload = JSON.parse(config.data || '{}');
    const newUser = {
      id: 'usr_' + Date.now(),
      name: payload.name,
      email: payload.email,
      role: payload.role || 'Employee',
      department: payload.department || 'Engineering',
      status: payload.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    mockUsers.unshift(newUser);
    return { success: true, data: newUser };
  }

  // Users: Delete
  if (url.match(/\/users\/([a-zA-Z0-9_-]+)$/) && method === 'delete') {
    const id = url.split('/').pop();
    mockUsers = mockUsers.filter((u) => u.id !== id);
    return { success: true, data: { id } };
  }

  // Employees: List
  if (url.includes('/employees') && method === 'get') {
    const params = config.params || {};
    const search = (params.search || '').toLowerCase();
    const department = params.department || '';

    let filtered = [...mockEmployees];
    if (department && department !== 'All') {
      filtered = filtered.filter((e) => e.department === department);
    }
    if (search) {
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(search) || e.position.toLowerCase().includes(search)
      );
    }
    return { success: true, data: filtered };
  }

  // Employees: Create
  if (url.includes('/employees') && method === 'post') {
    const payload = JSON.parse(config.data || '{}');
    const newEmp = {
      id: 'emp_' + Date.now(),
      name: payload.name,
      email: payload.email,
      position: payload.position,
      department: payload.department || 'Engineering',
      salary: parseFloat(payload.salary) || 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: payload.status || 'Full-time',
    };
    mockEmployees.unshift(newEmp);
    return { success: true, data: newEmp };
  }

  // Employees: Delete
  if (url.match(/\/employees\/([a-zA-Z0-9_-]+)$/) && method === 'delete') {
    const id = url.split('/').pop();
    mockEmployees = mockEmployees.filter((e) => e.id !== id);
    return { success: true, data: { id } };
  }

  return null;
}
