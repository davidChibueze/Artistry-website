import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to Poshbugati Admin!</h4>
      </Banner>
      <p>Use the sidebar to manage all your content.</p>
    </div>
  )
}

export default BeforeDashboard
