import styled from 'styled-components';

interface IButtonProps {
  color?: string;
  backgroundColor?: string;
}

export const Container = styled.button<IButtonProps>`
  width: 100%;
  max-width: 15rem;
  min-height: 1.875rem;
  
  margin: 0.5rem auto;

  opacity: 0.7;
  border: none;
  cursor: pointer;

  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 0;
  transition: opacity .3s ease-in-out;
  font-family: var(--font-roboto-slab), monospace;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 5px;

  color: ${({ color }) => color || '#2e3440'};
  background-color: ${({ backgroundColor }) => backgroundColor || '#a3be8c'};

  &:disabled {
    cursor: default;
    opacity: 0.7 !important;
  }

  &:hover {
    opacity: 1;
  }
`;