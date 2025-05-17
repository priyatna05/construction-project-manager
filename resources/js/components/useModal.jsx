import { useDisclosure } from '@mantine/hooks';

export default function useModal(initialState = false) {
  const [opened, { open, close }] = useDisclosure(initialState);

  return {
    opened,
    open,
    close
  };
}
