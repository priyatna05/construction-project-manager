import {
  ActionIcon,
  Menu,
  Paper,
  Text,
  Title,
  rem,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconEye,
  IconSettings,
  IconDownload,
} from '@tabler/icons-react';
import { router } from '@inertiajs/react';
import classes from './css/ProjectPerformanceCard.module.css';

const defaultImage = 'https://dummyimage.com';

export default function ProjectPerformanceChartCard({ project, onExport }) {
  const mainImage = project.attachments?.find(file => file.is_main && file.type?.startsWith('image'))
    || null;
 const imageUrl = mainImage?.url?.length > 0 ? mainImage.url : defaultImage;

 return (
    <Paper
      shadow="md"
      p="lg"
      radius="md"
      className={classes.card}
      style={{
  backgroundImage: `url(${imageUrl})`,
}}
    >
      <div className={classes.overlay} />

      <div className={classes.content}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <Text className={classes.category}>Project</Text>
            <Title order={3} className={classes.title}>
              {project.name}
            </Title>
          </div>

          <Menu withinPortal shadow="md" position="bottom-end" withArrow offset={5}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg" color="white">
                <IconDotsVertical size={rem(20)} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                icon={<IconEye size={18} />}
                onClick={() => router.get(route('projects.detail', project.id))}
              >
                Lihat Detail
              </Menu.Item>
              <Menu.Item
                icon={<IconSettings size={18} />}
                onClick={() => router.get(route('projects.tasks', project.id))}
              >
                Kelola Proyek
              </Menu.Item>
              <Menu.Item icon={<IconDownload size={18} />} onClick={() => onExport?.(project.id)}>
                Ekspor Data
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </Paper>
  );
}
