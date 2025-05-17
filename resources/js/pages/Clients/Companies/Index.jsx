import { useState } from 'react';
import {
    Button,
    Grid,
    Group,
    Table,
    Title,
    TextInput,
    Select,
    MultiSelect,
    Fieldset,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { usePage } from '@inertiajs/react';

import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import Pagination from '@/components/Pagination';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import Card from '@/components/Card';
import TableRow from './TableRow';
import useModal from '@/components/useModal';
import Modal from '@/components/Modal';
import useForm from '@/hooks/useForm';
import { reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import ActionButton from '@/components/ActionButton';

const ClientCompaniesIndex = () => {
    const {items, dropdowns: { clients, countries, currencies }, } = usePage().props;
    const { opened, open, close } = useModal();
    const [editingCompany, setEditingCompany] = useState(null);
    const sort = sort => reloadWithQuery(sort);

    const [form, submit, updateValue] = useForm(
        editingCompany ? 'put' : 'post',
        editingCompany
            ? route('clients.companies.update', editingCompany.id)
            : route('clients.companies.store'),
        {
            name: editingCompany?.name || '',
            email: editingCompany?.email || '',
            phone: editingCompany?.phone || '',
            address: editingCompany?.address || '',
            postal_code: editingCompany?.postal_code || '',
            city: editingCompany?.city || '',
            country_id: editingCompany?.country_id || '',
            currency_id: editingCompany?.currency_id || '',
            web: editingCompany?.web || '',
            clients: route().params?.client_id ? [route().params.client_id] : [],
        }
    );

    const handleCreate = () => {
        setEditingCompany(null);
        open();
    };

    const handleEdit = item => {
        setEditingCompany(item);
        open();
    };

    const handleClose = () => {
        setEditingCompany(null);
        close();
    };

    const columns = prepareColumns([
        { label: 'Company', column: 'name' },
        { label: 'Email', column: 'email' },
        { label: 'Clients', sortable: false },
        {
            label: 'Actions',
            sortable: false,
            visible: actionColumnVisibility('client company'),
        },
    ]);

    const rows = items.data.length ? (
        items.data.map(item => (
            <TableRow item={item} key={item.id} onEdit={handleEdit} />
        ))
    ) : (
        <TableRowEmpty colSpan={columns.length} />
    );


    return (
        <>
            <Title justify='space-between' align='start' gutter='xl' mb='lg' style={{ color: 'white' }}>
                List of Client Companies
            </Title>

            <Grid justify='space-between' align='center'>
                <Grid.Col span='content'>
                    <Group>
                    {can('create client company') && (
                      <Button
                      leftSection={<IconPlus size={14} />}
                      radius='xl'
                      variant='default'
                      onClick={handleCreate}
                      >
                            Create
                        </Button>
                    )}
                    <ArchivedFilterButton />
                    </Group>
                </Grid.Col>
            </Grid>

            <br />

            <Card shadow='sm' padding='xl' radius='md' withBorder>
                <Table.ScrollContainer miw={800} my='lg'>
                    <Table stickyHeader>
                        <TableHead columns={columns} sort={sort} />
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Table.ScrollContainer>

                <Pagination current={items.meta.current_page} pages={items.meta.last_page} />
            </Card>

            <Modal opened={opened} onClose={handleClose} title={editingCompany ? 'Edit Company' : 'Create Company'}>
                <form onSubmit={submit}>
                    <TextInput
                        label='Name'
                        placeholder='Company name'
                        required
                        value={form.data.name}
                        onChange={e => updateValue('name', e.target.value)}
                        error={form.errors.name}
                    />

                    <Select
                        label='Default currency'
                        placeholder='Select currency'
                        required
                        mt='md'
                        searchable
                        value={form.data.currency_id}
                        onChange={value => updateValue('currency_id', value)}
                        data={currencies}
                        error={form.errors.currency_id}
                    />

                    <MultiSelect
                        label='Clients'
                        placeholder='Select clients'
                        required
                        mt='md'
                        value={form.data.clients}
                        onChange={values => updateValue('clients', values)}
                        data={clients}
                        error={form.errors.clients}
                    />

                    <Fieldset legend='Location' mt='xl'>
                        <TextInput
                            label='Address'
                            placeholder='Address'
                            value={form.data.address}
                            onChange={e => updateValue('address', e.target.value)}
                            error={form.errors.address}
                        />

                        <Group grow mt='md'>
                            <TextInput
                                label='Postal code'
                                placeholder='Postal code'
                                value={form.data.postal_code}
                                onChange={e => updateValue('postal_code', e.target.value)}
                                error={form.errors.postal_code}
                            />

                            <TextInput
                                label='City'
                                placeholder='City'
                                value={form.data.city}
                                onChange={e => updateValue('city', e.target.value)}
                                error={form.errors.city}
                            />
                        </Group>

                        <Select
                            label='Country'
                            placeholder='Select country'
                            mt='md'
                            searchable
                            value={form.data.country_id}
                            onChange={value => updateValue('country_id', value)}
                            data={countries}
                            error={form.errors.country_id}
                        />
                    </Fieldset>

                    <Fieldset legend='Contact' mt='xl'>
                        <Group grow>
                            <TextInput
                                label='Email'
                                placeholder='Email'
                                value={form.data.email}
                                onChange={e => updateValue('email', e.target.value)}
                                error={form.errors.email}
                            />

                            <TextInput
                                label='Phone'
                                placeholder='Phone'
                                value={form.data.phone}
                                onChange={e => updateValue('phone', e.target.value)}
                                error={form.errors.phone}
                            />
                        </Group>

                        <TextInput
                            label='Web'
                            placeholder='Web'
                            mt='md'
                            value={form.data.web}
                            onChange={e => updateValue('web', e.target.value)}
                            error={form.errors.web}
                        />
                    </Fieldset>

                    <Group justify='flex-end' mt='xl'>
                        <ActionButton variant='light' onClick={handleClose}>
                            Cancel
                        </ActionButton>
                        <ActionButton type='submit' loading={form.processing}>
                            {editingCompany ? 'Update' : 'Create'}
                        </ActionButton>
                    </Group>
                </form>
            </Modal>
        </>
    );
};

ClientCompaniesIndex.layout = page => <Layout title='Clients'>{page}</Layout>;

export default ClientCompaniesIndex;
