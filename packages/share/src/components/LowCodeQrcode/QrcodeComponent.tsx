import { QRCode } from 'antd'
import React from 'react'
import type { IQrcodeComponentProps } from '.'

export default function QrcodeComponent(props: IQrcodeComponentProps) {
  return (
    <div className="flex items-center justify-center p-1">
      <QRCode {...props}></QRCode>
    </div>
  )
}
