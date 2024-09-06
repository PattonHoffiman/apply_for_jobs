import { memo, useState, useCallback, ChangeEvent, InputHTMLAttributes } from 'react';

interface ICheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  margin?: string;
  isChecked?: boolean;
  isDisabled?: boolean;

  customOnChange?: () => void;
}

import { Container, Message, Input } from './styles';

const Checkbox: React.FC<ICheckboxProps> = ({
  label,
  margin,
  customOnChange,
  isChecked = false,
  isDisabled = false,
  ...rest
}) => {
  const [checked, setChecked] = useState(isChecked);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (customOnChange) customOnChange();
    setChecked(e.target.checked);
  }, [customOnChange]);

  return (
    <Container margin={margin}>
      <label>
        <Input
          checked={checked}
          onChange={onChange}
          disabled={isDisabled}
          {...rest}
        />

        <Message className={isDisabled ? 'disable' : ''}>{label}</Message>
      </label>
    </Container>
  );
};

export default memo(Checkbox);