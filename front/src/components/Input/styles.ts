import styled, { css } from 'styled-components';

export const Container = styled.div`
  font-family: var(--font-roboto-slab), monospace;

  width: 100%;
  max-width: 20rem;

  margin: 0 auto;
  margin-bottom: 0.5rem;

  display: flex;
  flex-direction: column;

  align-items: left;
  justify-content: center;
`;

interface IContentProps {
  borderColor?: string;
}

export const Content = styled.div<IContentProps>`
  display: flex;
  flex-direction: row;

  padding: 0.25rem;
  border-radius: 5px;
  border: 2px solid #2e3440;
  
  ${({ borderColor }) =>
    borderColor && css`
      border: 2px solid ${borderColor};
    `};
`;

export const EyeButton = styled.button`
  border: none;
  cursor: pointer;
  margin-left: auto;
  background-color: transparent;

  svg {
    color: #2e3440;
  }
`;

export const InnerInput = styled.input`
  width: 100%;
  border: none;

  min-height: 1.875rem;
  padding-left: 0.5rem;

  color: #2e3440;
  background-color: #eceff4;

  &::placeholder {
    color: #2e344075;
    font-size: 0.8rem;
    font-family: var(--font-roboto-slab), monospace;
  }

  &:focus {
    outline: none;
  }
`;
