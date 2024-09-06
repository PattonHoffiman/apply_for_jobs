import styled, { css } from 'styled-components';

export const Container = styled.div`
  font-family: var(--font-roboto-slab), monospace;

  width: 100%;
  max-width: 20rem;

  font-weight: 400;
  font-size: 1.3rem;

  margin: 0 auto;
  margin-bottom: 0.5rem;

  display: flex;
  flex-direction: column;

  color: #2e3440;
  background-color: #eceff4;
`;

interface IHeaderProps {
  borderColor?: string;
}

export const Header = styled.header<IHeaderProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-weight: 500;

  padding: 0.25rem;
  min-height: 1.875rem;
  
  border-radius: 5px;
  border: 2px solid #3b4252;

  ${({ borderColor }) =>
    borderColor && css`
      border: 2px solid ${borderColor};
    `};

  span {
    cursor: default;
    font-size: 0.8rem;
    margin-left: 0.5rem;

    &.placeholder {
      color: #2e344075;
      font-weight: 400;
    }
  }
`;

export const ActionButton = styled.button`
  transition: opacity .3s ease-in-out;

  opacity: 0.7;

  padding: 0;
  border: none;
  cursor: pointer;
  margin-left: auto;
  background-color: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: #2e3440;
  }

  &:hover, &.selected {
    opacity: 1;
  }
`;

export const ListContainer = styled.div`
  border-radius: 5px;

  margin: 0.25rem 0;
  border: 2px solid #3b4252;
  padding: 0.8rem 0.25rem 0.5rem;
`;

export const List = styled.ul`
  margin: 0;
  padding: 0;
  box-sizing: border-box;
`;

export const Item = styled.button`
  width: 100%;
  border: none;
  height: 1.5rem;
  
  display: flex;
  align-items: center;

  &:hover {
    color: #eceff4;
    font-weight: 700;
    background-color: #2e3440;
  }

  &.selected {
    color: #eceff4;
    font-weight: 700;
    background-color: #2e3440;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;
