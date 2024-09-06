import * as API from '@/services/api';
const { API_URLS, callAPI } = API;

interface IVerifyPasswordReturn {
  message: string;
  success: boolean;

  salt: string;
  times: number;
  expires: string;
  password: string;
}

const verifyPassword = async (id: string): Promise<IVerifyPasswordReturn> => {
  try {
    const res = await callAPI(
      {
        method: 'PUT',
        url: `${API_URLS.VERIFY}${id}`
      }
    );

    return {
      success: res.success,
      message: res.message,
      salt: res.data?.salt || '',
      times: res.data?.times || 0,
      expires: res.data?.expires || '',
      password: res.data?.password || '',
    };
  } catch (ex) {
    console.log(ex);

    return {
      salt: '',
      times: 0,
      expires: '',
      password: '',
      success: false,
      message: 'Internal Server Error',
    };
  }
};

export default verifyPassword;
