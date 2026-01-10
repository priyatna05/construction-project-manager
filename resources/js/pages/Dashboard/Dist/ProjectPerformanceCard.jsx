import { ActionIcon, Menu, Paper, Text, Title, rem } from '@mantine/core';
import { IconDotsVertical, IconSettings } from '@tabler/icons-react';
import { router } from '@inertiajs/react';
import classes from './css/ProjectPerformanceCard.module.css';

export default function ProjectPerformanceChartCard({ project }) {
  const emptyImageBackground = '/storage/assets/images/image-empty.png';

  const mainImage = project.attachments?.find(file => file.is_main && file.file_type === 'image');

  const imageUrl = mainImage?.path
    ? `url(/storage/${mainImage.path})`
    : `url(${emptyImageBackground})`;
  const hasMainImage = !!mainImage;

  return (
    <Paper
      shadow='md'
      p='lg'
      radius='md'
      className={classes.card}
      style={{
        backgroundImage: imageUrl,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: 220,
        position: 'relative',
      }}
    >
      {/* Overlay for darkening the image */}
      <div className={classes.overlay} />

      <div className={classes.content}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <div>
            <Text
              className={`${classes.category} ${
                hasMainImage ? classes.textWhite : classes.textBlack
              }`}
            >
              Project
            </Text>
            <Title
              order={3}
              className={`${classes.title} ${hasMainImage ? classes.textWhite : classes.textBlack}`}
            >
              {project.name || 'Unnamed Project'}
            </Title>
          </div>

          <Menu
            shadow='md'
            position='bottom-end'
            withArrow
            offset={5}
          >
            <Menu.Target>
              <ActionIcon
                variant='subtle'
                size='lg'
                color='black'
                aria-label='Project options'
              >
                <IconDotsVertical size={rem(20)} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconSettings size={18} />}
                onClick={() => router.get(route('projects.tasks', project.id))}
              >
                Manage Project
              </Menu.Item>
              {/*  feature: upcoming export functionality
              <Menu.Item
                leftSection={<IconDownload size={18} />}
                onClick={() => onExport?.(project.id)}
              >
                Export Data
              </Menu.Item> */}
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </Paper>
  );
}
