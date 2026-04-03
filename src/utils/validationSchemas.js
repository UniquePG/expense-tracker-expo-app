import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  currency: z.string().default('USD'),
});

export const expenseSchema = z.object({
  description: z.string().min(3, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  paidById: z.string().min(1, 'Payer is required'),
  splitType: z.enum(['EQUAL', 'PERCENTAGE', 'EXACT', 'SHARES']),
  notes: z.string().optional(),
});

export const groupSchema = z.object({
  name: z.string().min(3, 'Group name is required'),
  description: z.string().optional(),
});
