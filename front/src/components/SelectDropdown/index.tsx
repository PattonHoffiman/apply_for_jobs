import { memo, useMemo, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, PlusSquare, XSquare } from 'react-feather';

import { List, Item, Header, Container, ListContainer, ActionButton } from './styles';

interface ISelectDropdownProps {
  items: Array<ComplexityItem>;

  placeholder?: string;
  borderColorIndicator: string;

  onChange: (value: ComplexityItem, action?: 'all' | 'clear') => void;
}

const SelectDropdown: React.FC<ISelectDropdownProps> = ({
  items,
  onChange,
  borderColorIndicator,
  placeholder = 'Select...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Array<ComplexityItem>>([]);
  const icon = useMemo(() => isOpen ? <ChevronUp /> : <ChevronDown />, [isOpen]);

  const selectedValues = useMemo(() => {
    if (selectedItems.length > 0) {
      return selectedItems.map((item, index, arr) => {
        if (item.id === 'all') return '';
        if (index === arr.length - 1) return `${item.value}.`;
        return `${item.value}, `;
      });
    }

    return undefined;
  }, [selectedItems]);

  const onSelectItem = useCallback((target: ComplexityItem) => {
    let updated: Array<ComplexityItem> = [];

    const { id, value } = target;
    const exists = selectedItems.find((i) => i.id === id);
    const allIsInList = selectedItems.find((i) => i.id === 'all');

    if (id === 'all') {
      setSelectedItems([]);

      if (selectedItems.find((i) => i.id === id)) {
        onChange(target, 'clear');
        return setSelectedItems([]);
      }

      onChange(target, 'all');
      return setSelectedItems(items);
    }

    if (allIsInList && exists) updated = selectedItems.filter((item) => item.id !== 'all' && item.value !== value);
    else if (exists) updated = selectedItems.filter((item) => item.value !== value);
    else updated = [...selectedItems, target];

    setSelectedItems(updated);
    onChange(target);
  }, [selectedItems, onChange, items]);

  return (
    <Container>
      <Header borderColor={borderColorIndicator}>
        <span className={!selectedValues && placeholder ? 'placeholder' : ''}>
          {selectedValues || placeholder}
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
              const selected = selectedItems.find((o) => o.id === id);

              return (
                <Item key={id}>
                  {value}
                
                  <ActionButton className={selected ? 'selected' : ''} onClick={() => onSelectItem(item)}>
                    {selected ? <XSquare size={24} color="#bf616a" /> : <PlusSquare size={24} />}
                  </ActionButton>
              </Item>
              );
            })}
          </List>
        </ListContainer>
      )}
    </Container>
  );
};

export default memo(SelectDropdown);