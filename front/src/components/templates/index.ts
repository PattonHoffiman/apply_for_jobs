import styled, { css } from 'styled-components';

interface ILabelProps {
  color?: string;
  error?: boolean;
  margin?: string;
}

interface IWrapper {
  margin?: string;
}

export const Content = styled.div`
  padding: 3rem;
  
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Container = styled.div`  
  flex: 1;

  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  
  font-family: var(--font-roboto-slab), monospace;
`;

export const ErrorContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: 20rem;
  padding-top: 6rem;

  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;

  > label {
    font-size: 1rem;
  }
`;

export const Wrapper = styled.div<IWrapper>`
  flex: 1;

  display: flex;
  flex-direction: column;
  
  margin: ${({ margin }) => margin || ''};
`;

export const Label = styled.label<ILabelProps>`
  color: #2e3440;
  font-size: 1rem;
  font-weight: 500;
  margin: ${({ margin }) => margin || '0 0 0.25rem'};

  &.last {
    color: #d08770;
    font-weight: 700;
  }

  &.error {
    color: #bf616a;
    font-weight: 700;
    font-size: 1.5rem;
  }

  &.title {
    color: #2e3440;
    font-weight: 700;
    font-size: 1.5rem;
  }

  &.message {
    color: #a3be8c;
    font-weight: 500;
    font-size: 1.2rem;
    text-align: center;
  }

  &.status {
    font-weight: 400;
    font-size: 0.8rem;
    margin-right: auto;
    margin-left: 5.25rem;

    > span {
      font-weight: 700;
      margin-left: 0.25rem;
      color: ${({ color }) => color};
    }
  }

  ${({ error }) =>
    error && css`
      color: #bf616a;
      font-weight: 700;
      margin-top: 0.5rem;
    `};
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
