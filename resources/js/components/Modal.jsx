import { useEffect, useRef, useState } from 'react';
import { Modal as MantineModal } from '@mantine/core';

/**
 * Wrapper Modal dengan opsi draggable sederhana.
 * Drag dimulai dari area title/header.
 */
export default function Modal({
  opened,
  onClose,
  title,
  children,
  draggable = false,
  resetPositionOnClose = true,
  styles: userStyles,
  ...props
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleMouseMove = event => {
    if (!isDragging.current) return;
    event.preventDefault();
    setPosition({
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y,
    });
  };

  const stopDragging = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', stopDragging);
  };

  const handleMouseDown = event => {
    if (!draggable || event.button !== 0) return;

    // Jangan mulai drag ketika klik pada tombol/input/link
    if (event.target.closest('button, input, textarea, select, a, [data-no-drag]')) {
      return;
    }

    event.preventDefault();
    isDragging.current = true;
    dragStart.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDragging);
  };

  useEffect(() => {
    return () => stopDragging();
  }, []);

  useEffect(() => {
    if (!opened && resetPositionOnClose) {
      setPosition({ x: 0, y: 0 });
      stopDragging();
    }
  }, [opened, resetPositionOnClose]);

  const mergedStyles = draggable
    ? {
        ...(userStyles || {}),
        content: {
          ...(userStyles?.content || {}),
          transform: `translate(${position.x}px, ${position.y}px)`,
        },
        header: {
          cursor: 'move',
          ...(userStyles?.header || {}),
        },
        title: {
          cursor: 'move',
          userSelect: 'none',
          ...(userStyles?.title || {}),
        },
      }
    : userStyles;

  const draggableTitle = draggable ? (
    <div
      onMouseDown={handleMouseDown}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
    >
      {title}
    </div>
  ) : (
    title
  );

  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={draggableTitle}
      size='lg'
      styles={mergedStyles}
      {...props}
    >
      {children}
    </MantineModal>
  );
}
