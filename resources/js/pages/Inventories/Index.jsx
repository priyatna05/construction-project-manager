import EmptyWithIcon from '@/components/EmptyWithIcon';
import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Layout from '@/layouts/MainLayout';
import useAuthorization from '@/hooks/useAuthorization';
import { redirectTo } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import { Button, Center, Flex, Grid, Group } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import InventoryCard from './Card/InventoryCard';

const InventoriesIndex = () => {
  const { items } = usePage().props;
  const { isAdmin } = useAuthorization();

  return (
    <>
      <Grid
        justify='space-between'
        align='center'
      >
        <Grid.Col span='content'>
        <Group>
          {can('create inventories') && (
            <Button
            leftSection={<IconPlus size={14} />}
            radius='xl'
            variant='default'
            onClick={() => redirectTo('inventories.create')}
            >
              Create
            </Button>
          )}
          {isAdmin() && <ArchivedFilterButton />}
          </Group>
        </Grid.Col>
      </Grid>
      {items.length ? (
        <Flex
          mt='xl'
          gap='lg'
          justify='flex-start'
          align='flex-start'
          direction='row'
          wrap='wrap'
        >
          {items.map(item => (
            <InventoryCard
              item={item}
              key={item.id}
            />
          ))}
        </Flex>
      ) : (
        <Center mih={400}>
          <EmptyWithIcon
            title='No inventories found'
            subtitle='or you do not have access to any of them'
            icon={IconSearch}
          />
        </Center>
      )}
    </>
  );
};

InventoriesIndex.layout = (page) => <Layout title='Inventories'>{page}</Layout>;
export default InventoriesIndex;
