import * as API from '@/services/api';
const { API_URLS, callAPI } = API;

interface IStorePasswordReturn {
  url: string;
  success: boolean;
}

interface IStorePasswordParams {
  enc: string;
  salt: string;
  times: number;
  expires: string;
}

const storePassword = async({
  enc,
  salt,
  times,
  expires
}: IStorePasswordParams): Promise<IStorePasswordReturn> => {
  try {
    const res = await callAPI(
      {
        method: 'POST',
        url: API_URLS.STORE,
        params: {
          enc,
          salt,
          times,
          expires,
        }
      }
    );

    return {
      url: res.data?.url,
      success: res.success,
    };
  } catch (ex) {
    console.log(ex);

    return {
      url: '',
      success: false,
    };
  }
};

export default storePassword;
