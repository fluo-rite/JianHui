import React from "react";
import { Avatar, List } from "antd";
import type { IListComponentProps } from ".";

export default function ListComponent(props: IListComponentProps) {
  return (
    <List
      itemLayout="horizontal"
      dataSource={props.items}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={item.avatar} />}
            title={<a href={item.titleLink}>{item.title}</a>}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
}
