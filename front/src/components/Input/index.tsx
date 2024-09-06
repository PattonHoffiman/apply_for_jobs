import { memo, useMemo, useState, useCallback, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'react-feather';

import { Content, Container, EyeButton, InnerInput } from './styles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  borderColorIndicator: string;
}

const Input: React.FC<InputProps> = ({
  name,
  type: externalType,
  borderColorIndicator,
  ...rest
}) => {
  const [seePassword, setSeePassword] = useState<boolean>(true);

  const { icon, type, borderColor } = useMemo(() => {
    if (seePassword) return { icon: <EyeOff />, type: 'text', borderColor: borderColorIndicator };
    return { icon: <Eye />, type: 'password', borderColor: borderColorIndicator };
  }, [seePassword, borderColorIndicator]);

  const changeSeePasswordState = useCallback(() => setSeePassword((old) => !old), []);

  return (
    <>
      <Container>
        <Content borderColor={borderColor}>
          <InnerInput
            id={name}
            autoComplete="off"
            type={externalType || type}
            {...rest}
          />

          {!externalType && (
            <EyeButton onClick={changeSeePasswordState}>
              {icon}
            </EyeButton>
          )}
        </Content>
      </Container>
    </>
  );
};

export default memo(Input);
