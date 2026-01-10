import { isImage, isViewable } from '@/utils/file';
import { Group, SimpleGrid, Text, rem } from '@mantine/core';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { IconFiles, IconUpload, IconX, IconLock } from '@tabler/icons-react';
import JsFileDownloader from 'js-file-downloader';
import { useState } from 'react';
import { openConfirmModal } from './ConfirmModal';
import FileThumbnail from './FileThumbnail';
import ImageModal from './ImageModal';

export default function Dropzone({
  selected, // Ini adalah 'allAttachmentsForDisplay' dari parent
  onAddFiles, // Mengubah nama dari 'onChange' menjadi 'onAddFiles' untuk kejelasan
  onRemoveAttachment, // Mengubah nama dari 'remove' menjadi 'onRemoveAttachment'
  onToggleMain, // Fungsi untuk toggle is_main
  disabled = false, // Tambahkan prop disabled
  isLocked = false, // Lock jika project completed
  ...props
}) {
  const [opened, { close, open }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const isDisabled = Boolean(disabled || isLocked);

  const confirmDeleteAttachment = fileToRemove => {
    if (isDisabled) return;
    openConfirmModal({
      type: 'danger',
      title: 'Delete attachment',
      content: `Are you sure you want to delete the attachment "${fileToRemove.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      confirmProps: { color: 'red' },
      onConfirm: () => {
        onRemoveAttachment(fileToRemove);
      },
    });
  };

  const openFile = file => {
    const fileUrl = file instanceof File ? URL.createObjectURL(file) : file.url;

    if (isImage(file)) {
      setSelectedImage({ ...file, url: fileUrl });
      open();
    } else if (isViewable(file)) {
      window.open(fileUrl, '_blank');
    } else {
      new JsFileDownloader({
        url: fileUrl,
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
        onDrop={files => !isDisabled && onAddFiles(files)}
        onReject={files => console.log('rejected files', files)}
        disabled={isDisabled}
        {...props}
      >
        <Group
          justify='center'
          gap='md'
          mih={50}
          style={{ pointerEvents: 'none' }}
        >
          {isDisabled ? (
            <>
              <IconLock
                style={{
                  width: rem(42),
                  height: rem(42),
                  color: 'var(--mantine-color-gray-5)',
                }}
                stroke={1.5}
              />
              <div>
                <Text
                  size='md'
                  inline
                  c='dimmed'
                >
                  Attachments (View Only)
                </Text>
                <Text
                  size='xs'
                  c='dimmed'
                  inline
                  mt={7}
                >
                  {isLocked
                    ? 'Project is completed - attachments are locked'
                    : 'You don`t have permission to upload files'}
                </Text>
              </div>
            </>
          ) : (
            <>
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
                    width: rem(60),
                    height: rem(60),
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
            </>
          )}
        </Group>
      </MantineDropzone>

      <SimpleGrid
        cols={{ base: 2, sm: 3 }}
        mt='lg'
      >
        {(selected || []).map((file, index) => (
          <div
            key={file.id || file.name || `new-file-${index}`}
            style={{ position: 'relative' }}
          >
            <FileThumbnail
              file={file}
              remove={() => confirmDeleteAttachment(file)}
              open={() => openFile(file)}
              disabled={isDisabled}
            />
            {isImage(file) && onToggleMain && !(file instanceof File) && (
              <div style={{ marginTop: 6 }}>
                <label style={{ fontSize: 12 }}>
                  <input
                    type='checkbox'
                    checked={file.is_main || false}
                    onChange={() => onToggleMain(file.id)}
                    disabled={isDisabled}
                  />{' '}
                  Main
                </label>
              </div>
            )}
          </div>
        ))}
      </SimpleGrid>
    </>
  );
}
