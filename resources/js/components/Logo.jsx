import { Avatar, Center, Group, Text, rem } from '@mantine/core';
import { IconAlignBoxLeftTop } from '@tabler/icons-react';

export default function Logo({ item, ...props }) {

  return (
    <Group
      wrap='nowrap'
      {...props}
    >
      <Center
        bg='transparent'
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
        }}
      >
        {item.logo ? (
          <Avatar
            src={item.logo}
            alt='Company Logo'
            radius='xl'
            style={{
              width: 50,
              height: 50,
            }}
          />
        ) : (
          <IconAlignBoxLeftTop
            style={{
              stroke: '#fff',
              width: rem(25),
              height: rem(25),
            }}
          />
        )}
      </Center>
      <Text
        fz={20}
        fw={600}
      >
        ConstructionPM
      </Text>
    </Group>
  );
}
