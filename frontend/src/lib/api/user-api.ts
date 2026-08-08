import { api } from '../axios';
import { UserSummary } from '@/types/user';

export async function listUsersRequest(): Promise<UserSummary[]> {
  const { data } = await api.get('/users');
  return data.data;
}