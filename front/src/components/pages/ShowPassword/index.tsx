import { useState, useEffect, useCallback, useTransition } from 'react';
import { Oval } from 'react-loader-spinner';
import { useParams, useRouter } from 'next/navigation';
import cryptoJS from 'crypto-js';

import Button from '@/components/Button';

import verifyPassword from '@/api/password/verify';
import { InfoContainer, InfoRow, Container, Content, Label } from '../../templates/index';

export default function ShowPassword() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [hasData, setHasData] = useState(false);
  const [firstLoad, setFirsLoad] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [times, setTimes] = useState(0);
  const [error, setError] = useState('');
  const [expires, setExpires] = useState('');
  const [password, setPassword] = useState('');

  const clearStates = useCallback(() => {
    setTimes(0);
    setExpires('');
    setPassword('');
  }, []);

  const convertDate = useCallback((date: string) => {
    const dateTime = new Date(date);
    return `${dateTime.toLocaleDateString('pt-br')} - ${dateTime.toLocaleTimeString('pt-br')}`;
  }, []);

  const decrypt = useCallback(async (value: string) => {
    const secret = process.env.NEXT_PUBLIC_SECRET;

    if (secret) {
      const bytes = cryptoJS.AES.decrypt(value, secret);
      const password = bytes.toString(cryptoJS.enc.Utf8);
      return password;
    }
  }, []);

  const tryVerifyPassword = useCallback(async () => {
    startTransition(async () => {
      const {
        times,
        expires,
        success,
        message,
        password,
      } = await verifyPassword(params?.id || '');

      if (success) {
        const decryptPassword = await decrypt(password);

        if (decryptPassword) {
          setError('');
          setTimes(times);
          setExpires(expires);
          setPassword(decryptPassword); 
        }
      } else {
        clearStates();
        setError(message);
      }

      setHasData(true);
    });
  }, [clearStates, decrypt, params?.id]);

  const goToGeneratePasswordPage = useCallback(() => router.push('/'), [router]);

  useEffect(() => {
    if (firstLoad) {
      tryVerifyPassword();
      setFirsLoad(false);
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tryVerifyPassword, firstLoad]);

  if (isPending || !hasData) return (
    <Container>
      <Oval
        width="3rem"
        height="3rem"
        color="#d08770"
        visible={isPending}
        secondaryColor="#d08770"
      />
    </Container>
  );

  return (
    <Container>
      <Content>
        <InfoContainer>
          {error === '' ? (
            <>
              <Label>
                {`Password: ${password}`}
              </Label>

              <Label>
                {`Expires At: ${convertDate(expires)}`}
              </Label>

              <InfoRow>
                <Label margin='0'>Remaining Accesses:</Label>

                <Label
                  margin="0 0 0 0.25rem"
                  className={times <= 1 ? 'last' : ''}
                >
                  {times > 0 ? times : 'Last Access!'}
                </Label>
              </InfoRow>
            </>
          ) : (
            <>
              <Label className="error">{error}</Label>
              
              <Button
                color="#eceff4"
                text="Create New Password"
                backgroundColor="#2e3440"
                onClick={goToGeneratePasswordPage}
              />
            </>
          )}
        </InfoContainer>
      </Content>
    </Container>
  );
};
