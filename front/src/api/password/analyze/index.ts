import * as API from '@/services/api';
const { API_URLS, callAPI } = API;

interface IAnalyzePasswordReturn {
  message: string;
  success: boolean;
  strength: string;
}

const analyzePassword = async (password: string): Promise<IAnalyzePasswordReturn> => {
  try {
    const res = await callAPI(
      {
        method: 'POST',
        url: API_URLS.ANALYZE,
        params: {
          password,
        }
      }
    );

    return {
      message: res.message,
      success: res.success,
      strength: res.data?.strength || 'none',
    };
    
  } catch (ex) {
    console.log(ex);

    return {
      strength: '',
      success: false,
      message: 'Internal Error',
    };
  }
};

export default analyzePassword;
