import { Card, Group } from "@mantine/core";
import classes from "../css/InventoryCard.module.css";


export default function InventoryCard({ item }) {

  return (
    <Card withBorder padding="xl" radius="md" w={350} className={classes.card}>
      <Group>
      ({ item.id }) {item.name_inventory}
      </Group>
    </Card>
  )
}
