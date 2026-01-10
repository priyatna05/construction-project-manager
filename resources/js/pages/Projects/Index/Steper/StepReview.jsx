import { Table, Text, Title, Box, Tooltip } from '@mantine/core';

export default function StepReview({
  form,
  currencySymbol,
  selectedType,
  dropdowns,
  existingProjectNames,
}) {
  const formatDate = date => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const budgetValue = form.data.budget_project_estimate;
  const budgetNumber =
    budgetValue === null || budgetValue === undefined || budgetValue === ''
      ? null
      : Number(budgetValue);
  const formattedBudget =
    budgetNumber === null || Number.isNaN(budgetNumber)
      ? null
      : budgetNumber.toLocaleString('id-ID');

  const getLabelById = (id, list) => {
    if (!list) return id || 'N/A';
    const item = list.find(i => i.id == id || i.value == id || String(i.id) === String(id) || String(i.value) === String(id));
    return item?.label || item?.name || id || 'N/A';
  };

  return (
    <Box mt='md'>
      <Title
        order={4}
        mb='md'
        align='center'
      >
        Review Project Details
      </Title>

      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        verticalSpacing='sm'
      >
        <Table.Tbody>
          <Table.Tr>
            {/* LEFT COLUMN */}
            <Table.Td>
              <Table verticalSpacing='xs'>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Project Name</Text>
                    </Table.Td>
                    <Table.Td style={{ width: 20, textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      {existingProjectNames.includes(form.data.name) ? (
                        <Tooltip
                          label='Project name already exists!'
                          color='red'
                          withArrow
                          position='top'
                        >
                          <Text
                            fw={600}
                            c='red'
                            style={{ cursor: 'help' }}
                          >
                            {form.data.name || 'N/A'}
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text>{form.data.name || 'N/A'}</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Requester</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      {form.data.client_company_id ? (
                        // ✅ Tampilkan nama perusahaan jika ada
                        <Text>
                          {getLabelById(form.data.client_company_id, dropdowns.companies)}
                        </Text>
                      ) : form.data.client_user_id ? (
                        // ✅ Jika perusahaan kosong tapi user ada, tampilkan nama user
                        <Text>{getLabelById(form.data.client_user_id, dropdowns.clientUsers)}</Text>
                      ) : (
                        // ⚠️ Jika keduanya kosong, tampilkan tooltip “N/A”
                        <Tooltip
                          label='Requester has not been selected yet'
                          withArrow
                          position='top'
                        >
                          <Text
                            fw={500}
                            c='dimmed'
                            style={{ cursor: 'help' }}
                          >
                            N/A
                          </Text>
                        </Tooltip>
                      )}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Start Date</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      {form.data.start_date ? (
                        <Text>{formatDate(form.data.start_date)}</Text>
                      ) : (
                        <Tooltip
                          label='Start date has not been set yet'
                          withArrow
                          position='top'
                        >
                          <Text
                            fw={500}
                            c='dimmed'
                            style={{ cursor: 'help' }}
                          >
                            N/A
                          </Text>
                        </Tooltip>
                      )}
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>End Date</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      {form.data.end_date ? (
                        <Text>{formatDate(form.data.end_date)}</Text>
                      ) : (
                        <Tooltip
                          label='End date has not been set yet'
                          withArrow
                          position='top'
                        >
                          <Text
                            fw={500}
                             c='red'
                            style={{ cursor: 'help' }}
                          >
                            N/A
                          </Text>
                        </Tooltip>
                      )}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Budget</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      {formattedBudget !== null ? (
                        `${currencySymbol} ${formattedBudget}`
                      ) : (
                        <Tooltip
                          label='Budget not set, default 0'
                          withArrow
                          position='top'
                        >
                          <Text c='red'>0</Text>
                        </Tooltip>
                      )}
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Table.Td>

            {/* RIGHT COLUMN */}
            <Table.Td>
              <Table verticalSpacing='xs'>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Type</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      <Tooltip
                        label={selectedType?.name || ''}
                        withArrow
                        position='top'
                      >
                        <Text c={!selectedType?.name ? 'dimmed' : undefined}>
                          {selectedType?.name || 'N/A'}
                        </Text>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Status</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      <Tooltip
                        label={
                          (form.data.status_ids || [])
                            .map(id => getLabelById(id, dropdowns.status))
                            .join(', ') || ''
                        }
                        withArrow
                        position='top'
                      >
                        <Text c={(form.data.status_ids || []).length === 0 ? 'dimmed' : undefined}>
                          {(form.data.status_ids || [])
                            .map(id => getLabelById(id, dropdowns.status))
                            .join(', ') || 'N/A'}
                        </Text>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Assigned Users</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      {form.data.users && form.data.users.length > 0 ? (
                        <Tooltip
                          label={(form.data.users || [])
                            .map(id => getLabelById(id, dropdowns.users))
                            .join(', ')}
                          withArrow
                          position='top'
                        >
                          <Text>
                            {(form.data.users || [])
                              .map(id => getLabelById(id, dropdowns.users))
                              .join(', ')}
                          </Text>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          label='No users assigned'
                          withArrow
                          position='top'
                        >
                          <Text c='red'>N/A</Text>
                        </Tooltip>
                      )}
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Attachments</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      <Tooltip
                        label={
                          (form.data.attachment_files || []).map(f => f.name).join(', ') || 'empty'
                        }
                        withArrow
                        position='top'
                      >
                        <Text
                          c={(form.data.attachment_files || []).length === 0 ? 'dimmed' : undefined}
                        >
                          {(form.data.attachment_files || []).map(f => f.name).join(', ') || 'None'}
                        </Text>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr>
                    <Table.Td>
                      <Text fw={500}>Framework</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>:</Table.Td>
                    <Table.Td>
                      <Tooltip
                        label={form.data.generate_task_groups || 'empty'}
                        withArrow
                        position='top'
                      >
                        <Text c={!form.data.generate_task_groups ? 'dimmed' : undefined}>
                          {form.data.generate_task_groups || 'Custom'}
                        </Text>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Box>
  );
}
