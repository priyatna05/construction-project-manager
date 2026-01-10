import { Tooltip, UnstyledButton, rem } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import { useState } from 'react';
import classes from './css/FavoriteToggle.module.css';

export default function ToggleFavorite({ item }) {
  const [isFavorite, setIsFavorite] = useState(item.favorite);
  const favorite = useForm('put', route('projects.favorite.toggle', item.id));

  const handleToggle = () => {
    setIsFavorite(prev => !prev);

    favorite.submit({
      preserveScroll: true,
      onError: () => setIsFavorite(item.favorite),
    });
  };

  return (
    <Tooltip
      label={isFavorite ? 'Remove from favorite' : 'Add to favorite'}
      color={isFavorite ? 'red' : 'green'}
      withArrow
    >
      <UnstyledButton
        onClick={handleToggle}
        className={classes.button}
        data-ignore-link
      >
        {item.favorite ? (
          <IconStarFilled
            style={{
              color: 'var(--mantine-color-yellow-4)',
              width: rem(30),
              height: rem(30),
            }}
            data-ignore-link
          />
        ) : (
          <IconStar
            style={{
              width: rem(25),
              height: rem(25),
            }}
            data-ignore-link
          />
        )}
      </UnstyledButton>
    </Tooltip>
  );
}
