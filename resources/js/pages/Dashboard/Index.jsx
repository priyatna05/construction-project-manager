import CalendarIndex from "@/components/Calendar";
import Layout from "@/layouts/MainLayout";
import { ScrollArea, Tabs, Group} from '@mantine/core';
import { IconNotebook, IconCalendarEvent, IconFileAnalytics } from '@tabler/icons-react';
import classes from  "./css/Index.module.css"

const Dashboard = () => {

  return (
    <>
    <Tabs color="white" variant="outline" radius="md" defaultValue="analytics"
     >
      <Tabs.List color="white">
        <Tabs.Tab color="white" value="analytics" leftSection={<IconFileAnalytics size={25} />}>
          Analitytics
        </Tabs.Tab>
        <Tabs.Tab value="events" leftSection={<IconCalendarEvent size={25} />}>
          Events
        </Tabs.Tab>
        <Tabs.Tab value="notes" leftSection={<IconNotebook size={25} />}>
          Notes
        </Tabs.Tab>
      </Tabs.List>
      <Group className={classes.card}>
      <ScrollArea>
      <Tabs.Panel value="analytics">
        this tabs for all overview analitics this app including users, projects, tasks, activity, resources, activity, loging and Earned value management system!
      </Tabs.Panel>
      <Tabs.Panel value="events">
        <CalendarIndex />
      </Tabs.Panel>
      <Tabs.Panel value="notes">
        This tabs panel for Notes and for this app!
      </Tabs.Panel>
      </ScrollArea>
      </Group>
    </Tabs>
    </>
  );
};

Dashboard.layout = (page) => <Layout title="Dashboard">{page}</Layout>;

export default Dashboard;
