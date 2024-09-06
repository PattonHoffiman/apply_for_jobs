import { memo, ButtonHTMLAttributes } from 'react';
import { Oval } from 'react-loader-spinner';

import { Container } from './styles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isLoading?: boolean;

  color?: string;
  backgroundColor?: string;
}

const Button: React.FC<ButtonProps> = ({ text, color, backgroundColor, isLoading = false, ...rest }) => (
  <Container type="button" color={color} backgroundColor={backgroundColor} {...rest}>
    {isLoading ? (
      <Oval
      width="1rem"
      height="1rem"
      color="#2e3440"
      visible={isLoading}
      />
    ) : (
      <span>{text}</span>
    )}
  </Container>
);

export default memo(Button);
