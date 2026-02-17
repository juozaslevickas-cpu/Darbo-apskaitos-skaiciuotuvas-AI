'use client';

import { create } from 'zustand';
import type { Employee } from '@/models/employee';

interface EmployeeStore {
  employees: Employee[];
  loaded: boolean;
  fetchEmployees: () => Promise<void>;
  addEmployee: (data: Omit<Employee, 'id'>) => Promise<string>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployee: (id: string) => Employee | undefined;
}

export const useEmployeeStore = create<EmployeeStore>()((set, get) => ({
  employees: [],
  loaded: false,

  fetchEmployees: async () => {
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const data = await res.json();
      set({ employees: data, loaded: true });
    } catch (err) {
      console.error('fetchEmployees error:', err);
      set({ loaded: true });
    }
  },

  addEmployee: async (data) => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add employee');
    const employee = await res.json();
    set((state) => ({
      employees: [employee, ...state.employees],
    }));
    return employee.id;
  },

  updateEmployee: async (id, data) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update employee');
    const updated = await res.json();
    set((state) => ({
      employees: state.employees.map((e) =>
        e.id === id ? { ...e, ...updated } : e
      ),
    }));
  },

  deleteEmployee: async (id) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete employee');
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    }));
  },

  getEmployee: (id) => {
    return get().employees.find((e) => e.id === id);
  },
}));
