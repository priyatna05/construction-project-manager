import { isImage, shortenFileName } from '@/utils/file';
import { Group, Image, Text, Tooltip, rem } from '@mantine/core';
import {
  IconCircleX,
  IconFile,
  IconFileTypeCss,
  IconFileTypeCsv,
  IconFileTypeDoc,
  IconFileTypeDocx,
  IconFileTypeHtml,
  IconFileTypeJs,
  IconFileTypeJsx,
  IconFileTypePdf,
  IconFileTypePhp,
  IconFileTypeSql,
  IconFileTypeSvg,
  IconFileTypeTs,
  IconFileTypeTxt,
  IconFileTypeVue,
  IconFileTypeXls,
  IconFileTypeXml,
  IconFileTypeZip,
} from '@tabler/icons-react';
import classes from './css/FileThumbnail.module.css';

export default function FileThumbnail({ file, remove, open, disabled = false, ...props }) {
  if (!file) return null;

  const type = file.type || file.mime_type || '';
  const iconProps = { width: rem(70), height: rem(70) }; // Perbesar ikon
  let icon = <IconFile style={iconProps} />;

  const alreadyUploaded = file.id !== undefined;

  if (isImage(file)) {
    const imageUrl = alreadyUploaded ? file.thumb_url || file.url : URL.createObjectURL(file);
    icon = (
      <Image
        radius='md'
        w={70}
        h={70}
        src={imageUrl}
        onLoad={() => !alreadyUploaded && URL.revokeObjectURL(imageUrl)}
        alt={file.name || 'Image thumbnail'}
        style={{ objectFit: 'cover' }}
      />
    );
  } else if (type.includes('pdf')) icon = <IconFileTypePdf style={iconProps} />;
  else if (type.includes('css')) icon = <IconFileTypeCss style={iconProps} />;
  else if (type.includes('csv')) icon = <IconFileTypeCsv style={iconProps} />;
  else if (type.includes('docx')) icon = <IconFileTypeDocx style={iconProps} />;
  else if (type.includes('doc')) icon = <IconFileTypeDoc style={iconProps} />;
  else if (type.includes('html')) icon = <IconFileTypeHtml style={iconProps} />;
  else if (file.name?.includes('.jsx')) icon = <IconFileTypeJsx style={iconProps} />;
  else if (type.includes('javascript')) icon = <IconFileTypeJs style={iconProps} />;
  else if (type.includes('php')) icon = <IconFileTypePhp style={iconProps} />;
  else if (file.name?.includes('.sql')) icon = <IconFileTypeSql style={iconProps} />;
  else if (type.includes('image/svg')) icon = <IconFileTypeSvg style={iconProps} />;
  else if (type.includes('application/zip')) icon = <IconFileTypeZip style={iconProps} />;
  else if (type === 'text/plain') icon = <IconFileTypeTxt style={iconProps} />;
  else if (file.name?.includes('.vue')) icon = <IconFileTypeVue style={iconProps} />;
  else if (type.includes('xls')) icon = <IconFileTypeXls style={iconProps} />;
  else if (type.includes('xml')) icon = <IconFileTypeXml style={iconProps} />;
  else if (file.name?.includes('.ts')) icon = <IconFileTypeTs style={iconProps} />;

  return (
    <Group
      gap='sm'
      wrap='nowrap'
      className={classes.file}
      {...props}
    >
      <div className={classes.iconContainer}>
        <div className={classes.icon}>{icon}</div>

        {remove && !disabled && (
          <Tooltip
            label='Remove file'
            withArrow
            color='red'
            position='top'
            transitionProps={{ transition: 'fade', duration: 150 }}
          >
            <IconCircleX
              className={classes.remove}
              stroke={2.5}
              size={28}
              style={{
                color: 'var(--mantine-color-red-6)',
                cursor: 'pointer',
                position: 'absolute',
                top: rem(-10),
                right: rem(-10),
                background: 'white',
                borderRadius: '50%',
                padding: rem(4),
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
              onClick={e => {
                e.stopPropagation();
                remove();
              }}
            />
          </Tooltip>
        )}
      </div>

      <div className={classes.text}>
        <Text
          fz={15}
          fw={500}
          truncate='end'
          title={file.name}
          onClick={() => open && open()}
          style={{ cursor: open ? 'pointer' : 'default' }}
        >
          {shortenFileName(file.name || 'Untitled File', 30)}
        </Text>
        <Text
          fz='xs'
          fw={300}
          c='dimmed'
        >
          {shortenFileName(file.type || file.mime_type || 'Unknown type', 30)}
        </Text>
      </div>
    </Group>
  );
}
