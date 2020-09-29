import React, { useState } from 'react'
import { Row, Container, Col } from 'react-bootstrap'
import Particles from 'react-particles-js'
import $ from 'jquery'

function LandingPageBodyTopRow() {
  const [screenWidth, setScreenWidth] = useState('')

  $(document).ready(() => {
    window.addEventListener('resize', updateScreenWidth)
  })

  let updateScreenWidth = () => {
    if (window.innerWidth != screenWidth) setScreenWidth(window.innerWidth)
  }

  let particleHeightFromScreenSize = () => {
    if (screenWidth <= 1040 && screenWidth > 826) {
      return { topMargin: '150px', bottomMargin: '70px', height: '250px' }
    } else if (screenWidth <= 826 && screenWidth > 678) {
      return { topMargin: '180px', bottomMargin: '70px', height: '200px' }
    } else if (screenWidth <= 678) {
      return { topMargin: '210px', bottomMargin: '70px', height: '150px' }
    } else {
      return { topMargin: '125px', bottomMargin: '100px', height: '250px' }
    }
  }

  return (
    <div style={{ backgroundColor: 'white' }}>
      <Container fluid className="Med1">
        <Row>
          <Col xl={12}>
            <div className="leftFirstRowDiv-inner">
              <h2 className="leftFirstRowText">Coordination Made Easy.</h2>
              <p>Manage the flow of your projects.</p>
              <br />
              <br />
              <img
                alt="Padlock Logo"
                className="lock-animation"
                src={require('../../Images/padlock-animation-image.png')}
              />
            </div>
            <div className="landing-page-particle-div">
              <Particles
                className="particles"
                height={particleHeightFromScreenSize().height}
                style={{
                  marginTop: particleHeightFromScreenSize().topMargin,
                  marginBottom: particleHeightFromScreenSize().bottomMargin,
                }}
                params={{
                  particles: {
                    number: {
                      value: screenWidth > 900 ? 100 : 50,
                    },
                    collisions: {
                      enable: true,
                      mode: 'bounce',
                    },
                    color: {
                      value: '#2f64ba',
                    },
                    size: {
                      value: 5,
                    },
                    line_linked: {
                      color: {
                        value: '#2f64ba',
                      },
                    },
                  },
                  interactivity: {
                    events: {
                      onHover: {
                        enable: true,
                        mode: 'repulse',
                      },
                    },
                  },
                }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LandingPageBodyTopRow
