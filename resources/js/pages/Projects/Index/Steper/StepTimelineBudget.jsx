import { Group, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { NumericFormat } from 'react-number-format';

export default function StepTimelineBudget({ form, updateValue, currencySymbol, can }) {
  return (
    <>
      <Group grow mt='md'>
        <DateInput
          label='Start Date'
          placeholder='Select'
          required
          valueFormat='DD MMM YYYY'
          value={form.data.start_date}
          onChange={(v) => updateValue('start_date', v)}
          error={form.errors.start_date}
          readOnly={!can('create project')}
        />
        <DateInput
          label='End Date'
          placeholder='Select'
          required
          valueFormat='DD MMM YYYY'
          value={form.data.end_date}
          onChange={(v) => updateValue('end_date', v)}
          error={form.errors.end_date}
          readOnly={!can('create project')}
        />
      </Group>

      <NumericFormat
        customInput={TextInput}
        label='Budget'
        placeholder='Project budget'
        thousandSeparator='.'
        decimalSeparator=','
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        prefix={`${currencySymbol} `}
        value={form.data.budget_project_estimate}
        onValueChange={(values) =>
          updateValue('budget_project_estimate', values.floatValue ?? '')
        }
        required
        mt='md'
        error={form.errors.budget_project_estimate}
        readOnly={!can('create project')}
      />
    </>
  );
}
