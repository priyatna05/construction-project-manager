import ActionButton from '@/components/ActionButton';
import BackButton from '@/components/BackButton';
import RichTextEditor from '@/components/RichTextEditor';
import useForm from '@/hooks/useForm';
import Layout from '@/layouts/MainLayout';
import { redirectTo } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import {
  Anchor,
  Breadcrumbs,
  Grid,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  TextInput,
  Title,
  Text,
} from '@mantine/core';
import { useEffect, useState } from "react";
import { DateInput } from "@mantine/dates";
import Card from '@/components/Card';

const ProjectEdit = ({ dropdowns: { companies, users,currencies } }) => {
  const { item } = usePage().props;
  const [currencySymbol, setCurrencySymbol] = useState();

  const [form, submit, updateValue] = useForm('post', route('projects.update', item.id), {
    _method: 'put',
    name_project: item.name_project,
    description_project: item.description_project,
    start_date_project: item.start_date_project,
    budget_project: item.budget_project || 0,
    client_company_id: item.client_company_id,
    users: item.users.map(i => i.id.toString()),
  });

  useEffect(() => {
    let symbol = currencies.find(i =>
      i.client_companies.find(c => c.id.toString() === form.data.client_company_id)
    )?.symbol;

    if (symbol) {
      setCurrencySymbol(symbol);
    }
  }, [form.data.client_company_id]);

  return (
    <>
    <Card>

      <Breadcrumbs
        fz={14}
        mb={30}
        >
        <Anchor
          href='#'
          onClick={() => redirectTo('projects.index')}
          fz={14}
          >
          Projects
        </Anchor>
        <div>Edit</div>
      </Breadcrumbs>

      <Grid
        justify='space-between'
        align='flex-end'
        gutter='xl'
        mb='lg'
        >
        <Grid.Col span='auto'>
          <Title order={1}>Edit project</Title>
        </Grid.Col>
        <Grid.Col span='content'></Grid.Col>
      </Grid>

        <form onSubmit={submit}>
          <TextInput
            label='Name Project'
            placeholder='Project name'
            required
            mt='md'
            value={form.data.name_project}
            onChange={e => updateValue('name_project', e.target.value)}
            error={form.errors.name_project}
          />

           <Text size="lg-2" mt="md">
          </Text>
          <RichTextEditor
            height={260}
            label='Description Project'
            placeholder='Project description'
            value={form.data.description_project}
            onChange={e => updateValue('description_project', e.target.value)}
            error={form.errors.description_project}
          />


          <Select
            label='Company requesting work'
            placeholder='Select company'
            required
            mt='md'
            value={form.data.client_company_id?.toString()}
            onChange={value => updateValue('client_company_id', value)}
            data={companies}
            error={form.errors.client_company_id}
          />

          <DateInput
            clearable
            valueFormat="DD MMM YYYY"
            minDate={new Date()}
            mt="md"
            label="Start date"
            placeholder="Pick project start date"
            value={form.data.start_date_project}
            onChange={(value) => updateValue("start_date_project", value)}
            error={form.errors.start_date_project}
            />

          <DateInput
            clearable
            valueFormat="DD MMM YYYY"
            minDate={new Date()}
            mt="md"
            label="End date"
            placeholder="Pick project End date"
            value={form.data.end_date_project}
            onChange={(value) => updateValue("end_date_project", value)}
            error={form.errors.end_date_project}
            />

          <NumberInput
            label='Budget'
            mt='md'
            allowNegative={false}
            clampBehavior='strict'
            decimalScale={2}
            fixedDecimalScale={true}
            prefix={currencySymbol}
            value={form.data.budget_project}
            onChange={value => updateValue('budget_project', value)}
            error={form.errors.budget_project}
            />

          <MultiSelect
            label="Grant access to users"
            placeholder="Select users"
            mt='md'
            searchable
            value={form.data.users}
            onChange={(values) => updateValue("users", values)}
            data={users}
            error={form.errors.users}
            />

          <Group
            justify='space-between'
            mt='xl'
          >
            <BackButton route='projects.index' />
            <ActionButton loading={form.processing}>Update</ActionButton>
          </Group>
        </form>
      </Card>
    </>
  );
};

ProjectEdit.layout = page => <Layout title='Edit project'>{page}</Layout>;

export default ProjectEdit;
