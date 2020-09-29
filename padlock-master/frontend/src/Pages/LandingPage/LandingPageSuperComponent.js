import React, { useEffect } from 'react'
import LandingPageNavigationbar from './LandingPageNavigationbar'
import LandingPageBodyTopRow from './LandingPageBodyTopRow'
import LandingPageBodyBottomRow from './LandingPageBodyBottomRow'
import mixpanel from '../../api/mixpanel'

function LandingPage() {
  useEffect(() => mixpanel.track('landing_page_visit'), [])

  return (
    <div>
      <LandingPageNavigationbar isLandingPage="true" />
      <LandingPageBodyTopRow />
      <LandingPageBodyBottomRow />
    </div>
  )
}
export default LandingPage
