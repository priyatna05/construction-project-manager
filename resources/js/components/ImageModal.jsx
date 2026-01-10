import useImageLoader from '@/hooks/useImageLoader';
import { Center, Image, Loader, Group, Text, ActionIcon, Tooltip } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useEffect } from 'react';
import Modal from '@/components/Modal';

export default function ImageModal({ image, opened, close }) {
  const { loadImage, loading } = useImageLoader();

  useEffect(() => {
    if (image) loadImage(image.path);
  }, [image]);

  // Handle download
  const handleDownload = () => {
    if (!image?.url) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name || 'image';
    link.target = '_blank';
    link.click();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      size='auto'
      centered
      draggable
      zIndex={2300}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      title={
        <Group
          justify='space-between'
          w='100%'
        >
          <Text fw={600}>{image?.name || 'Preview Image'}</Text>
          {image?.url && (
            <Tooltip
              label='Download image'
              withArrow
            >
              <ActionIcon
                variant='light'
                color='blue'
                onClick={handleDownload}
                title='Download image'
              >
                <IconDownload size={18} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      }
    >
      {loading ? (
        <Center
          miw={500}
          maw='80vw'
          h={500}
        >
          <Loader
            color='blue'
            size='lg'
          />
        </Center>
      ) : (
        <Image
          src={image?.url}
          fit='contain'
          style={{ maxHeight: '80vh' }}
        />
      )}
    </Modal>
  );
}
