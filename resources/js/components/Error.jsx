import { Container, Title, Text, Button, Group, Image, Box } from '@mantine/core';
import { Head, router, usePage } from '@inertiajs/react';
import classes from './css/Error.module.css';

export default function Error({ status }) {
  const user = usePage().props?.auth?.user;

  const handleClick = () => {
    if (user) {
      router.get(route('dashboard'));
    } else {
      router.visit('/login');
    }
  };

  const title =
    {
      503: 'Service Unavailable',
      500: 'Internal Server Error',
      404: 'Page Not Found',
      403: 'Access Denied',
      401: 'Unauthorized',
    }[status] || 'Something went wrong';

  const description =
    {
      503: "Sorry, we're doing some maintenance. Please check back later.",
      500: "Oops! Something broke on our servers. We're fixing it.",
      404: 'The page you’re looking for doesn’t exist or has been moved.',
      403: 'You don’t have permission to access this page.',
      401: 'This feature is under development. Stay tuned!',
    }[status] || 'An unexpected error occurred.';

  const handleImageError = e => {
    e.currentTarget.src = '/storage/assets/errors/default-error.png';
  };

  return (
    <>
      <Head title={title} />
      <Container
        className={classes.root}
        fluid
      >
        <div className={classes.inner}>
          <Box className={classes.imageWrapper}>
            <Image
              src={`/storage/assets/errors/${status}.png`}
              alt={`Error ${status}`}
              className={classes.image}
              onError={handleImageError}
              radius='md'
              fit='contain'
            />
            <Text
              className={classes.status}
              fw={900}
            >
              {status}
            </Text>
          </Box>

          <div className={classes.content}>
            <Title className={classes.title}>{title}</Title>
            <Text
              size='lg'
              className={classes.description}
            >
              {description}
            </Text>

            <Group
              justify='center'
              mt='xl'
            >
              <Button
                size='md'
                radius='md'
                variant='gradient'
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                onClick={handleClick}
              >
                {user ? 'Back to Dashboard' : 'Go to Login'}
              </Button>
            </Group>
          </div>
        </div>
      </Container>
    </>
  );
}
