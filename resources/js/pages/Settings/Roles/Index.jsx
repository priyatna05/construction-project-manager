import ArchivedFilterButton from "@/components/ArchivedFilterButton";
import Pagination from "@/components/Pagination";
import TableHead from "@/components/TableHead";
import TableRowEmpty from "@/components/TableRowEmpty";
import Layout from "@/layouts/MainLayout";
import { reloadWithQuery } from "@/utils/route";
import { actionColumnVisibility, prepareColumns } from "@/utils/table";
import { usePage } from "@inertiajs/react";
import { Button, Card, Grid, Group, Title, Table } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import TableRow from "./TableRow";
import { useState } from "react";
import useModal from "@/components/useModal";
import RoleModal from "./RoleModal";

const RolesIndex = () => {
  const { items, shared: { permissions }} = usePage().props;
  const { opened, open, close } = useModal();
  const [editingRole, setEditingRole] = useState(null);
  const sort = (sort) => reloadWithQuery(sort);

  const handleCreate = () => {
    setEditingRole(null);
    open();
  };

  const handleEdit = (role) => {
    if (role && role.id ) {
      setEditingRole(role);
      open();
    }
  };

  const handleClose = () => {
    setEditingRole(null);
    close();
  };

  const columns = prepareColumns([
    { label: "Name", column: "name" },
    { label: "Permissions count", sortable: false },
    {
      label: "Actions",
      sortable: false,
      visible: actionColumnVisibility("role"),
    },
  ]);

  const rows = items.data.length ? (
    items.data.map((item) => (
      <TableRow item={item} key={item.id} onEdit={handleEdit} />
    ))
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );


  return (
    <>
     <Title justify='space-between' align='start' gutter='xl' mb='lg'
        style={{color: 'white'}} >List of Roles
        </Title>
      <Grid justify="space-between" align="center">
        <Grid.Col span="content">
          <Group>
          {can("create role") && (
            <Button
            leftSection={<IconPlus size={14} />}
            radius="xl"
            variant="default"
            onClick={handleCreate}
            >
              Create
            </Button>
          )}
          <ArchivedFilterButton />
          </Group>
        </Grid.Col>
      </Grid>
      <br></br>
      <Card shadow="sm" withBorder>
       <Table.ScrollContainer miw={800} my="lg">
          <Table
            stickyHeader
          >
          <TableHead columns={columns} sort={sort} />
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        </Table.ScrollContainer>
      <Pagination
        current={items.meta.current_page}
        pages={items.meta.last_page}
      />
      </Card>
      {permissions && (
       <RoleModal
        opened={opened}
        onClose={handleClose}
        initialValues={editingRole}
        permissions={permissions}
      />
      )}
    </>
  );
};

RolesIndex.layout = (page) => <Layout title="Roles">{page}</Layout>;

export default RolesIndex;
