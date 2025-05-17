import { Card as MantineCard } from '@mantine/core';

const Card = ({ bg, children }) => {
  return (
    <MantineCard bg={bg} padding="lg" radius="md" shadow="sm">
      {children}
    </MantineCard>
  );
};

export default Card;
