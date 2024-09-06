import { memo, useMemo, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

import { Item, List, Header, Container, ActionButton, ListContainer } from './styles';

interface ISelectProps {
  items: Array<TemporalItem>;

  placeholder?: string;
  borderColorIndicator: string;

  onChange: (value: TemporalItem) => void;
}

const Select: React.FC<ISelectProps> = ({
  items,
  onChange,
  borderColorIndicator,
  placeholder = 'Select...',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<TemporalItem | undefined>();
  const icon = useMemo(() => isOpen ? <ChevronUp /> : <ChevronDown />, [isOpen]);

  const onSelectItem = useCallback((target: TemporalItem) => {
    setSelectedItem(target);
    onChange(target);
    setIsOpen(false);
  }, [onChange]);

  return (
    <Container>
      <Header borderColor={borderColorIndicator}>
        <span className={!selectedItem && placeholder ? 'placeholder' : ''}>
          {selectedItem?.value || placeholder}
        </span>

        <ActionButton onClick={() => setIsOpen(!isOpen)}>
          {icon}
        </ActionButton>
      </Header>

      {isOpen && (
        <ListContainer>
          <List>
            {items.map((item) => {
              const { id, value } = item;
              const selected = selectedItem?.id === id || false;

              return (
                <Item
                  key={id}
                  onClick={() => onSelectItem(item)}
                  className={selected ? 'selected' : ''}
                >
                  {value}
                </Item>
              );
            })}
          </List>
        </ListContainer>
      )}
    </Container>
  );
};

export default memo(Select);