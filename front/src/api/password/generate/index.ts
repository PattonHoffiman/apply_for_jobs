import * as API from '@/services/api';
const { API_URLS, callAPI } = API;

interface IGeneratePasswordParams {
  length: number;
  complexity: Array<string>;
}

interface IGeneratePasswordReturn {
  message: string;
  success: boolean;
  password: string;
}

const generatePassword = async ({
  length,
  complexity
}: IGeneratePasswordParams): Promise<IGeneratePasswordReturn> => {
  try {
    const res = await callAPI(
      {
        method: 'GET',
        url: `${API_URLS.GENERATE}?length=${length}&complexity=${complexity}`,
      }
    );

    return {
      message: res.message,
      success: res.success,
      password: res.data?.password || '',
    };
  } catch (ex) {
    console.log(ex);

    return {
      password: '',
      success: false,
      message: 'Internal Error',
    };
  }
};

export default generatePassword;