import { Box } from '@mantine/core';
import Layout from '@/layouts/MainLayout';
import ExportCenterSection from './Exports';

export default function ReportsIndex() {
  return (
    <Box p='md'>
      <ExportCenterSection />
    </Box>
  );
}

ReportsIndex.layout = page => <Layout title='Reports'>{page}</Layout>;
