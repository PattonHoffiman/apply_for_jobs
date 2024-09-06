import styled from 'styled-components';

interface IContainerProps {
  margin?: string;
}

export const Container = styled.div<IContainerProps>`
  width: fit-content;
  margin: ${({ margin }) => margin || '0 auto'};

  > label {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const Message = styled.span`
  color: #2e3440;
  font-size: 1rem;
  font-weight: 600;

  &.disable {
    opacity: 0.5;
  }
`;

export const Input = styled.input.attrs({ type: 'checkbox' })`
  -webkit-appearance: none;
  appearance: none;

  outline: none;
  cursor: pointer;

  width: 1rem;
  height: 1rem;

  margin-right: 0.5rem;
  border-radius: 0.15rem;
  border: 0.1rem solid #2e3440;

  &:checked {
    position: relative;
    background-color: #2e3440;
  }

  &:checked::before {
    position: absolute;
    color: #eceff4;

    top: -1.5px;
    right: -0.5px;

    content: "✔";
    font-size: 1rem;

  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
