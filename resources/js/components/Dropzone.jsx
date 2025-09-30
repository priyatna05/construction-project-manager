import { isImage, isViewable } from '@/utils/file';
import { Group, SimpleGrid, Text, rem } from '@mantine/core';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { IconFiles, IconUpload, IconX } from '@tabler/icons-react';
import JsFileDownloader from 'js-file-downloader';
import { useState } from 'react';
import { openConfirmModal } from './ConfirmModal';
import FileThumbnail from './FileThumbnail';
import ImageModal from './ImageModal';
import axios from 'axios';

export default function Dropzone({ project, task, selected, onChange, remove, ...props }) {
  const [opened, { close, open }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const confirmDeleteAttachment = (index, fileName, attachmentId) => {
    openConfirmModal({
      type: 'danger',
      title: 'Delete attachment',
      content: `Are you sure you want to delete the attachment "${fileName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      requirePassword: true,
      confirmProps: { color: 'red' },
      onConfirm: password => {
        axios
          .post(
            route('attachments.destroy', [project.id, task.id, attachmentId]),
            {
              password,
              _method: 'DELETE',
            },
            {
              withCredentials: true,
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
              },
            }
          )
          .then(() => {
            remove(index);
          })
          .catch(() => {});
      },
    });
  };

  const openFile = file => {
    if (isImage(file)) {
      setSelectedImage(file);
      open();
    } else if (isViewable(file)) {
      window.open(file.url, '_blank');
    } else {
      new JsFileDownloader({
        url: file.url,
        filename: file.name,
        contentType: file.type,
        nativeFallbackOnError: true,
      }).catch(error => console.error('Failed to download file', error));
    }
  };

  return (
    <>
      <ImageModal
        image={selectedImage}
        opened={opened}
        close={close}
      />

      <MantineDropzone
        onDrop={files => onChange([...selected, ...files])}
        onReject={files => console.log('rejected files', files)}
        {...props}
      >
        <Group
          justify='center'
          gap='md'
          mih={50}
          style={{ pointerEvents: 'none' }}
        >
          <MantineDropzone.Accept>
            <IconUpload
              style={{
                width: rem(42),
                height: rem(42),
                color: 'var(--mantine-color-blue-6)',
              }}
              stroke={1.5}
            />
          </MantineDropzone.Accept>
          <MantineDropzone.Reject>
            <IconX
              style={{
                width: rem(42),
                height: rem(42),
                color: 'var(--mantine-color-red-6)',
              }}
              stroke={1.5}
            />
          </MantineDropzone.Reject>
          <MantineDropzone.Idle>
            <IconFiles
              style={{
                width: rem(42),
                height: rem(42),
                color: 'var(--mantine-color-dimmed)',
              }}
              stroke={1.5}
            />
          </MantineDropzone.Idle>

          <div>
            <Text
              size='md'
              inline
            >
              Drag files here or click to select
            </Text>
            <Text
              size='xs'
              c='dimmed'
              inline
              mt={7}
            >
              Files of any type will be accepted
            </Text>
          </div>
        </Group>
      </MantineDropzone>

      <SimpleGrid cols={2} mt="lg">
  {selected.map((file, index) => (
    <div key={index} style={{ position: 'relative' }}>
      <FileThumbnail
        index={index}
        file={file}
        remove={() => confirmDeleteAttachment(index, file.name, file.id)}
        open={() => openFile(file)}
      />

      {/* Checkbox untuk Gambar Utama */}
      {isImage(file) && (
        <div style={{ marginTop: 6 }}>
          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={file.is_main || false}
              onChange={() => {
                const updated = selected.map((f, i) => ({
                  ...f,
                  is_main: i === index, // hanya satu yang bisa aktif
                }));
                onChange(updated);
              }}
            />{' '}
            Jadikan gambar utama
          </label>
        </div>
      )}
    </div>
  ))}
</SimpleGrid>
    </>
  );
}
