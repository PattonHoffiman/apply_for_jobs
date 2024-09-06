import axios from 'axios';

type methodType = 'GET' | 'PUT' | 'POST';

interface ICallAPIParams {
  url: string;
  params?: any;
  method: methodType;
}

interface ICallAPIReturn {
  data?: any;
  error: string;
  status: number;
  message: string;
  success: boolean;
}

export const API_URLS = {
  STORE: process.env.NEXT_PUBLIC_STORE || '',
  VERIFY: process.env.NEXT_PUBLIC_VERIFY || '',
  ANALYZE: process.env.NEXT_PUBLIC_ANALYZE || '',
  GENERATE: process.env.NEXT_PUBLIC_GENERATE || '',
};

export async function callAPI({ url, params, method }: ICallAPIParams): Promise<ICallAPIReturn> {
  const res = await axios(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*/*',
    },
    validateStatus: () => true,
    ...(method !== 'GET' ? { data: params } : {}),
  });

  const apiResponse = res.data;

  return {
    status: res.status,
    message: apiResponse.message || '',
    data: apiResponse.data || undefined,
    success: apiResponse.success || false,
    error: res.status !== 200 ? 'server' : '',
  };
};