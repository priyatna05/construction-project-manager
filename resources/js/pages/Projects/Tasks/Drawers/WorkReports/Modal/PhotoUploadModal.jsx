import { useState, useEffect } from 'react';
import { Group, Stack, Text, ActionIcon, Loader, rem } from '@mantine/core';
import { IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import Dropzone from '@/components/Dropzone';
import Modal from '@/components/Modal';

export default function PhotoUploadModal({
  opened,
  onClose,
  onSave,
  initialPhotos = [],
  isEditMode = false,
}) {
  const [uploadedPhotos, setUploadedPhotos] = useState(initialPhotos);
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
   const modalZIndex = 2300;

  useEffect(() => {
    setUploadedPhotos(initialPhotos);
    setHasChanged(false);
    setSaved(false);
  }, [initialPhotos, opened]);

  const handlePhotoUpload = files => {
    if (!isEditMode) return;
    setUploadedPhotos(prev => {
      setHasChanged(true);
      return [...prev, ...files];
    });
  };

  const handleRemovePhoto = fileToRemove => {
    if (!isEditMode) return;
    setUploadedPhotos(prev => {
      setHasChanged(true);
      return prev.filter(file => file !== fileToRemove);
    });
  };

  const handleSave = async () => {
    if (!isEditMode) return;
    setProcessing(true);
    try {
      await onSave(uploadedPhotos);
      setSaved(true);
      setHasChanged(false);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  const handleCancel = () => {
    setUploadedPhotos(initialPhotos);
    setHasChanged(false);
    setSaved(false);
    onClose();
  };

  const TitleBar = (
    <Group
      align='center'
      ml='lg'
      mt='sm'
    >
      {hasChanged && isEditMode && (
        <ActionIcon
          onClick={handleSave}
          loading={processing}
          color={saved ? 'teal' : 'green'}
          radius='xl'
          size='xl'
          title='Save changes'
        >
          {processing ? (
            <Loader
              size='sm'
              color='white'
            />
          ) : saved ? (
            <IconCheck size={20} />
          ) : (
            <IconDeviceFloppy size={20} />
          )}
        </ActionIcon>
      )}
      <Stack spacing={2}>
        <Text
          fz={rem(22)}
          fw={600}
          ml={6}
        >
          {saved ? 'Saved ✓' : isEditMode ? 'Upload Work Photos' : 'View Work Photos'}
        </Text>
        <Text
          fz='sm'
          c='dimmed'
          ml={6}
        >
          {saved
            ? 'All changes have been successfully saved.'
            : isEditMode
              ? 'Update work photos for this report.'
              : 'View existing work photos for this report.'}
        </Text>
      </Stack>
    </Group>
  );

  return (
    <>
    <Modal
      opened={opened}
      onClose={handleCancel}
      title={TitleBar}
      size='lg'
      draggable
      zIndex={modalZIndex}
      closeButtonProps={{ style: { position: 'absolute', top: 12, right: 12 } }}
      overlayProps={{ backgroundOpacity: 0.0, blur: 0 }}
      transitionProps={{ transition: 'fade', duration: 200 }}
      centered
       styles={{
          content: {
            backgroundColor: '#fff',
            color: '#000',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
          header: {
            backgroundColor: '#fff',
            borderBottom: 'none',
          },
          title: {
            color: '#000',
            fontWeight: 600,
          },
        }}
    >
      <Stack gap='md'>
      <Dropzone
          selected={uploadedPhotos}
          onAddFiles={handlePhotoUpload}
          onRemoveAttachment={handleRemovePhoto}
          accept='image/*'
          description={
            isEditMode
              ? 'Accepted formats: JPG, PNG, GIF (Max 5MB per file)'
              : 'View existing photos'
          }
          disabled={!isEditMode}
          multiple={true}
        />
      </Stack>
    </Modal>
  </>
  );
}
