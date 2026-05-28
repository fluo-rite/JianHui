import React from 'react'
import { Input } from 'antd'
import { type ITextAreaComponentProps } from '.'

const { TextArea } = Input

export default function TextAreaComponent(props: ITextAreaComponentProps) {
  return (
    <div className="space-y-2 p-4">
      <span className="text-lg font-bold">{props.title}:</span> <br />
      <TextArea placeholder={props.placeholder} value={props.text} onChange={event => props.onUpdate?.(event.target.value)} />
    </div>
  )
}
