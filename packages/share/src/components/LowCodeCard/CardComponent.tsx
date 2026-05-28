import React from 'react'
import { Card } from 'antd'
import type { ICardComponentProps } from '.'

const { Meta } = Card

export default function CardComponent(props: ICardComponentProps) {
  return (
    <Card
      hoverable
      cover={<img alt="cover_img" src={props.coverImg} />}
    >
      <Meta title={props.title} description={props.description} />
    </Card>
  )
}
