import Layout from "@/layouts/MainLayout";
import { usePage } from "@inertiajs/react";
import { Title } from "@mantine/core";
import OverViewProject from "./Cards/OverViewProject";
import OverdueTasks from "./Cards/OverdueTasks";
import RecentComments from "./Cards/RecentComments";
import RecentlyAssignedTasks from "./Cards/RecentlyAssignedTasks";
// import classes from "./css/Index.module.css";

const Dashboard = () => {
  const { overdueTasks, recentlyAssignedTasks, recentComments } = usePage().props;

  // const breakpointColumns = {
  //   default: 3,
  //   1100: 2,
  //   700: 1,
  // };

  return (
    <>
      <Title mb="xl">Dashboard</Title>
        <OverViewProject />
        <OverdueTasks tasks={overdueTasks} />
        <RecentlyAssignedTasks tasks={recentlyAssignedTasks} />
        <RecentComments comments={recentComments} />
    </>
  );
};

Dashboard.layout = (page) => <Layout title="Dashboard">{page}</Layout>;

export default Dashboard;
