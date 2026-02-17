'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Employee } from '@/models/employee';

interface EmployeeStore {
  employees: Employee[];
  addEmployee: (data: Omit<Employee, 'id'>) => string;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [],

      addEmployee: (data) => {
        const id = uuidv4();
        const employee: Employee = { ...data, id };
        set((state) => ({
          employees: [...state.employees, employee],
        }));
        return id;
      },

      updateEmployee: (id, data) => {
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }));
      },

      deleteEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        }));
      },

      getEmployee: (id) => {
        return get().employees.find((e) => e.id === id);
      },
    }),
    {
      name: 'darbo-apskaita-employees',
    }
  )
);
