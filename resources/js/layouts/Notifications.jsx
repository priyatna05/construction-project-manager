import EmptyWithIcon from '@/components/EmptyWithIcon';
import Notification from '@/components/Notification';
import ContactRequestModal from '@/components/ContactRequestModal';
import useNotificationsStore from '@/hooks/store/useNotificationsStore';
import { redirectTo, redirectToUrl } from '@/utils/route';
import {
  ActionIcon,
  Center,
  Group,
  Indicator,
  Menu,
  Title,
  Tooltip,
  UnstyledButton,
  Dialog,
  Button,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconBellFilled, IconEye, IconMessage, IconTrashX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import classes from './css/Notifications.module.css';

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } =
    useNotificationsStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const computedColorScheme = useComputedColorScheme('light');
  const theme = useMantineTheme();
  const [clearAllOpened, { open: openClearAll, close: closeClearAll }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [contactModalOpened, setContactModalOpened] = useState(false);
  const [selectedContactData, setSelectedContactData] = useState(null);

  const open = notification => {
    if (notification.read_at === null) markAsRead(notification);

    // Check if this is a contact request notification
    if (notification.contact_data) {
      setSelectedContactData(notification.contact_data);
      setContactModalOpened(true);
    } else if (notification.link) {
      redirectToUrl(notification.link);
    } else {
      console.warn('Notification has no link:', notification);
    }
  };

  const handleDeleteNotification = async notificationId => {
    await deleteNotification(notificationId);
  };

  const handleClearAllNotifications = async () => {
    setLoading(true);
    try {
      await clearAllNotifications();
      closeClearAll();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUnreadCount(notifications.filter(i => i.read_at === null).length);
    setReadCount(notifications.filter(i => i.read_at !== null).length);
  }, [notifications]);

  return (
    <>
      <Menu
        withArrow
        position='top'
        shadow='md'
        transitionProps={{ duration: 100, transition: 'pop-top-left' }}
        offset={{ mainAxis: 10, alignmentAxis: 10 }}
      >
        <Indicator
          color='red'
          disabled={unreadCount === 0}
          label={unreadCount}
          offset={3}
          size={16}
          className={classes.indicator}
        >
          <Menu.Target>
            <Tooltip
              label='View Notifications'
              color='blue'
              withArrow
            >
              <ActionIcon
                data-tour='notifications'
                radius='xl'
                style={{
                  width: 37,
                  height: 37,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    computedColorScheme === 'light' ? theme.white : theme.colors.dark[6],
                  color:
                    computedColorScheme === 'light' ? theme.colors.blue[4] : theme.colors.gray[2],
                }}
                variant='filled'
              >
                <IconBellFilled style={{ width: '55%', height: '55%' }} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown
            miw={{ base: 300, sm: 300, md: 360 }}
            maw={10000}
          >
            <Group
              justify='space-between'
              m={10}
              ml={15}
            >
              <Tooltip
                label='View All notifications'
                color='green'
                position='top'
                withArrow
                zIndex={2200}
              >
                <Title
                  order={4}
                  onClick={() => redirectTo('notifications')}
                  style={{ cursor: 'pointer' }}
                >
                  Notifications
                </Title>
              </Tooltip>
              <Group gap='xs'>
                {unreadCount > 0 && (
                  <Tooltip
                    label='Mark all as read'
                    color='blue'
                    withArrow
                    zIndex={2200}
                  >
                    <UnstyledButton
                      fz={11}
                      onClick={markAllAsRead}
                      style={{ color: 'blue' }}
                      className={classes.iconButton}
                    >
                      <IconEye
                        size={20}
                        style={{ marginRight: 4 }}
                      />
                    </UnstyledButton>
                  </Tooltip>
                )}
                {unreadCount + readCount > 0 && (
                  <Tooltip
                    label='Clear all'
                    color='red'
                    withArrow
                    zIndex={2200}
                  >
                    <UnstyledButton
                      fz={11}
                      onClick={openClearAll}
                      className={classes.link}
                      style={{ color: 'red' }}
                    >
                      <IconTrashX
                        size={20}
                        style={{ marginRight: 4 }}
                      />
                    </UnstyledButton>
                  </Tooltip>
                )}
              </Group>
            </Group>

            <Menu.Divider />

            {notifications.length > 0 ? (
              notifications.map(notification => (
                <Menu.Item
                  key={notification.id}
                  onClick={() => open(notification)}
                  opacity={notification.read_at ? 0.6 : 1}
                  className={classes.notification}
                >
                  <Notification
                    title={notification.title}
                    description={notification.description}
                    datetime={notification.created_at}
                    read={notification.read_at !== null}
                    type={notification.type}
                    onDelete={() => handleDeleteNotification(notification.id)}
                  />
                </Menu.Item>
              ))
            ) : (
              <Center mih={100}>
                <EmptyWithIcon
                  title='Recent notifications'
                  description='Will be shown here'
                  icon={IconMessage}
                  titleFontSize={17}
                  descriptionFontSize={13}
                  iconSize={38}
                />
              </Center>
            )}
          </Menu.Dropdown>
        </Indicator>
      </Menu>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        opened={clearAllOpened}
        withCloseButton={false}
        onClose={closeClearAll}
        closeOnEscape={false}
        zIndex={2200}
      >
        <Text
          size='sm'
          fw={500}
          mb='xs'
        >
          Confirm deletion
        </Text>
        <Text
          size='sm'
          c='dimmed'
          mb='md'
        >
          Are you sure you want to delete all notifications? This action cannot be undone.
        </Text>

        <Group
          justify='flex-end'
          mt='md'
        >
          <Button
            variant='default'
            onClick={closeClearAll}
          >
            Cancel
          </Button>
          <Button
            color='red'
            loading={loading}
            onClick={handleClearAllNotifications}
          >
            Delete All
          </Button>
        </Group>
      </Dialog>

      {/* Contact Request Modal */}
      <ContactRequestModal
        opened={contactModalOpened}
        onClose={() => {
          setContactModalOpened(false);
          setSelectedContactData(null);
        }}
        contactData={selectedContactData}
      />
    </>
  );
}
