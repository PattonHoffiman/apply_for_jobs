import { useMemo, useState, useCallback, useEffect, ChangeEvent, useTransition } from 'react';
import { useDebounce } from 'use-debounce';
import cryptoJS from 'crypto-js';
import Link from 'next/link';

import storePassword from '@/api/password/store';
import analyzePassword from '@/api/password/analyze';
import generatePassword from '@/api/password/generate';

import Input from '@/components/Input';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Checkbox from '@/components/Checkbox';
import SelectDropdown from '@/components/SelectDropdown';
import { ErrorContainer, Container, Wrapper, Label } from '../../templates/index';

export default function GeneratePassword() {
  const [canStore, setCanStore] = useState(false);
  const [generate, setGenerate] = useState(false);
  const [status, setStatus] = useState<Status>('none');
  
  const [length, setLength] = useState(0);
  const [lengthError, setLengthError] = useState('');
  
  const [complexityError, setComplexityError] = useState('');
  const [complexity, setComplexity] = useState<Array<ComplexityType>>([]);

  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [randomPassword, setRandomPassword] = useState('');

  const [storeError, setStoreError] = useState('');

  const [times, setTimes] = useState(0);
  const [timesError, setTimesError] = useState('');

  const [period, setPeriod] = useState(0);
  const [periodError, setPeriodError] = useState('');

  const [selectedTemporal, setSelectedTemporal] = useState<TemporalItem | undefined>();

  const [isPending, startTransition] = useTransition();
  const [debouncedPassword] = useDebounce(password, 1000);

  type Status = 'weak' | 'strong' | 'weakest' | 'moderate' | 'strongest' | 'none';

  const complexityList: Array<ComplexityItem> = [
    { id: 'all', value: 'All' },
    { id: 'numeric', value: 'Digits' },
    { id: 'special', value: 'Special Chars' },
    { id: 'lower', value: 'Lower Case Chars' },
    { id: 'upper', value: 'Upper Case Chars' },
  ];
  
  const temporalList: Array<TemporalItem> = [
    { id: 'minute', value: 'Minute(s)' },
    { id: 'hour', value: 'Hour(s)' },
    { id: 'day', value: 'Day(s)' },
  ];

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const { error, message } = useMemo(() => {
    if (storeError !== '') return { error: true, message: storeError };
    if (timesError !== '') return { error: true, message: timesError };
    if (periodError !== '') return { error: true, message: periodError };
    if (lengthError !== '') return { error: true, message: lengthError };
    if (passwordError !== '') return { error: true, message: passwordError };
    if (complexityError !== '') return { error: true, message: complexityError };
    return { error: false, message: '' };
  }, [storeError, timesError, periodError, lengthError, passwordError, complexityError]);

  const action = useMemo(() => {
    setPeriodError('');

    if (selectedTemporal?.id === 'day')
      return {
        errorMessage: 'Choose between 1 and 60 days',
        rule: (value: number) => value >= 1 && value <= 60
      };
    if (selectedTemporal?.id === 'hour')
      return {
        rule: (value: number) => value >= 1 && value <= 24,
        errorMessage: `Choose between 1 and 23 hours`
      };
    if (selectedTemporal?.id === 'minute')
      return {
        rule: (value: number) => value >= 1 && value <= 59,
        errorMessage: `Choose between 1 and 59 minutes`
      };
    
    return undefined;
  }, [selectedTemporal]);

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const onCleanErrors = useCallback(() => {
    setComplexityError('');
    setPasswordError('');
    setLengthError('');
    setPeriodError('');
    setTimesError('');
    setStatus('none');
  }, []);

  const onCleanGenerateStates = useCallback(() => {
    setTimes(0);
    setLength(0);
    setPeriod(0);
    setComplexity([]);
    setSelectedTemporal(undefined);
    setCanStore(false);
  }, []);

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const onChangeLength = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const length = e.target.value.length;
      const value = Number(e.target.value);

      if (length > 3 || value > 100) setLengthError('The max value for length is 100 chars!');
      else setLengthError('');

      setLength(Number(e.target.value));
  }, []);

  const onChangeComplexity = useCallback(
    (item: ComplexityItem, action?: 'all' | 'clear') => {
      let update: Array<ComplexityType>;

      if (action) {
        if (action === 'all') update = ['lower', 'upper', 'special', 'numeric'];
        else update = [];

        return setComplexity(update);
      }

      if (item.id === 'all') return;

      if (complexity.includes(item.id)) update = complexity.filter((i) => i !== item.id);
      else update = [...complexity, item.id];

      setComplexity(update);
  }, [complexity]);

  const onChangeTemporal = useCallback((item: TemporalItem) => {
    setSelectedTemporal(item);
    onCleanErrors();
    setPeriod(0);
  }, [onCleanErrors]);

  const onChangeTimes = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (value === 0) setTimesError('Needs to be able to access at least once');
    else setTimesError('');

    setTimes(value);
  }, []);

  const onChangePeriod = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (action && selectedTemporal) {
      const value = Number(e.target.value);
      const isValid = action.rule(value);

      if (!isValid) setPeriodError(action.errorMessage);
      else setPeriodError('');
        
      setPeriod(value);
    }
  }, [action, selectedTemporal]);

  const onChangeAlertColor = useCallback(
    (status: Status): string => {
      const colors = {
        none: '',
        weak: '#bf616a',
        strong: '#a3be8c',
        weakest: '#bf616a',
        moderate: '#d08770',
        strongest: '#a3be8c',
      };

      return colors[status];
  }, []);

  const onChangeBorderColor = useCallback((success: boolean, error: boolean) => {
    if (error) return '#bf616a';
    if (success) return '#a3be8c';
    return '#2e3440';
  }, []);

  const onChangePassword = useCallback((e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  interface IAES {
    salt: string;
    cipher: string;
  }

  const generateAES = useCallback(async (value: string) => {
    const secret = process.env.NEXT_PUBLIC_SECRET;
  
    if (secret) {
      const cipher = cryptoJS.AES.encrypt(value, secret);
    
      return {
        cipher: cipher.toString(),
        salt: cipher.salt.toString(),
      } as IAES;
    }
  }, []);

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  const tryAnalyzePassword = useCallback(async (value: string) => {
    startTransition(async () => {
      if (value !== '') {
        const { 
          success,
          message,
          strength
        } = await analyzePassword(value);

        setStatus(strength as Status);

        if (!success) {
          setPasswordError(message);
          setCanStore(false);
        } else {
          setPasswordError('');
          setCanStore(true);
        }
      } else onCleanErrors();
    });
  }, [onCleanErrors, startTransition]);

  const tryGeneratePassword = useCallback(async () => {
    startTransition(async () => {
      const {
        success,
        message,
        password
      } = await generatePassword(
        { 
          length: length,
          complexity: complexity
        }
      );
  
      if (!success) {
        setCanStore(false);
        setRandomPassword('');
  
        if (message.includes('characters')) {
          setLengthError(message);
          setComplexityError('');
        }
  
        if (message.includes('types')) {
          setComplexityError(message);
          setLengthError('');
        }
      } else {
        setRandomPassword(password);
        setComplexityError('');
        setLengthError('');
        setCanStore(true);
      }
    });
  }, [complexity, length]);

  const tryStorePassword = useCallback(async () => {
      startTransition(async () => {
        const value = password !== '' ? password : randomPassword;
        const aes = await generateAES(value);

        if (aes && selectedTemporal) {
          let expires = new Date(Date.now());
          
          switch (selectedTemporal.id) {
            default:
            case 'day':
              expires.setDate(expires.getDate() + period);
            case 'hour':
              expires.setHours(expires.getHours() + period);
            case 'minute':
              expires.setMinutes(expires.getMinutes() + period);
          }

          const { success, url } = await storePassword({
            times: times,
            salt: aes.salt,
            enc: aes.cipher,
            expires: expires.toISOString(),
          });

          if (!success) setStoreError('An error was occurred when try save password! please try again later...');
          setUrl(url);
        }
      });
    },
    [password, randomPassword, generateAES, selectedTemporal, times, period]
  );

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  useEffect(() => {
    if (password === debouncedPassword) tryAnalyzePassword(debouncedPassword);
  }, [password, debouncedPassword, tryAnalyzePassword]);

  useEffect(() => {
    if (!generate) {
      onCleanGenerateStates();
      setRandomPassword('');
      onCleanErrors();
    }
  }, [generate, onCleanErrors, onCleanGenerateStates]);

  // * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  return (
    <Container>
      <Label className="title">Please Insert your Password:</Label>

      <Wrapper margin="2rem 0 0">
        <Input
          id="password"
          name="password"
          disabled={generate}
          onChange={onChangePassword}
          value={randomPassword || password}
          placeholder="Digit your password..."
          borderColorIndicator={randomPassword !== '' ? '#a3be8c' : onChangeAlertColor(status)}
        />

        {password === debouncedPassword && status !== 'none' && (
          <Label color={onChangeAlertColor(status)} className="status">
            Strength:
            <span>{status}</span>
          </Label>
        )}

        {generate && (
          <Wrapper>
            <SelectDropdown
              items={complexityList}
              onChange={onChangeComplexity}
              placeholder="Select complexity types..."
              borderColorIndicator={onChangeBorderColor(randomPassword !== '', complexityError !== '')}
            />

            <Input
              id="length"
              type="text"
              name="length"
              value={length || ''}
              onChange={onChangeLength}
              placeholder="Digit the length..."
              borderColorIndicator={onChangeBorderColor(randomPassword !== '', lengthError !== '')}
            />

            <Button
              isLoading={isPending}
              onClick={tryGeneratePassword}
              text={isPending ? 'Loading' : 'Generate Password'}
              disabled={length === 0 || complexity.length === 0 || isPending || randomPassword !== ''}
            />
          </Wrapper>
        )}

        {password === '' && passwordError === '' && (
          <Checkbox
            isChecked={generate}
            label="Generate Password?"
            isDisabled={password !== ''}
            customOnChange={() => setGenerate(!generate)}
          />
        )}

        {canStore && (
          <Wrapper margin="2rem 0 0">
            <Select
              items={temporalList}
              onChange={onChangeTemporal}
              placeholder="Select period..."
              borderColorIndicator={onChangeBorderColor(!!selectedTemporal, storeError !== '')}
            />

            <Input
              id="period"
              type="text"
              name="period"
              value={period || ''}
              onChange={onChangePeriod}
              placeholder="Digit the period..."
              borderColorIndicator={onChangeBorderColor(period !== 0, periodError !== '')}
            />

            <Input
              id="times"
              type="text"
              name="times"
              value={times || ''}
              onChange={onChangeTimes}
              placeholder="Digit the number of times to access the password..."
              borderColorIndicator={onChangeBorderColor(times !== 0, timesError !== '')}
            />

            <Button
              isLoading={isPending}
              onClick={tryStorePassword}
              text={isPending ? 'Loading' : 'Store Password'}
              disabled={isPending || periodError !== '' || timesError !== '' || !selectedTemporal || url !== ''}
            />

            {url !== '' && (
              <Wrapper margin="2rem auto 0">
                <Label className="message">
                  Password Created!
                </Label>

                <Wrapper margin="1rem 2rem">
                  <Link href={url}>
                    {url}
                  </Link>
                </Wrapper>
              </Wrapper>
            )}
          </Wrapper>

        )}
      </Wrapper>

      {error && (
        <ErrorContainer>
          <Label error>{message}</Label>
        </ErrorContainer>
      )}
    </Container>
  );
};
