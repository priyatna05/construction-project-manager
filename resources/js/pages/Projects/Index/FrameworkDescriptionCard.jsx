import { findFrameworkByValue } from '@/utils/selectFramework';
import { Group, Text, Image, Card, Anchor } from '@mantine/core';

export const FrameworkDescriptionCard = ({ selectedValue }) => {
  const selectedFramework = findFrameworkByValue(selectedValue);

  if (!selectedFramework) {
    return null;
  }

  return (
    <Card
      withBorder
      mt='md'
      p='lg'
      radius='md'
    >
      <Group
        wrap='nowrap'
        align='flex-start'
      >
        <Image
          src={selectedFramework.image}
          alt={`${selectedFramework.label} illustration`}
          w={150}
          h={100}
          fit='contain'
          radius='sm'
        />
        <div>
          <Text fw={700}>{selectedFramework.label}</Text>
          <Text
            size='sm'
            mt={5}
          >
            {selectedFramework.description}
          </Text>
          <Anchor
            href={selectedFramework.learnMore}
            target='_blank'
            size='sm'
            mt='xs'
          >
            Learn more...
          </Anchor>
        </div>
      </Group>
    </Card>
  );
};
