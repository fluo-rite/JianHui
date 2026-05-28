import React from 'react'
import { Empty } from 'antd'
import type { IEmptyComponentProps } from '.'

export default function EmptyComponent(props: IEmptyComponentProps) {
  return (
    <Empty
      className="flex flex-col items-center justify-center"
      description={props.description || '暂无状态'}
      image={props.image || Empty.PRESENTED_IMAGE_DEFAULT}
      imageStyle={{ height: `${props.imageHeight}px`, width: `${props.imageWidth}px`, objectFit: props.imageObjectFit }}
    />
  )
}
