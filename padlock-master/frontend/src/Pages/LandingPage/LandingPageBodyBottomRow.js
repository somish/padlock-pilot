import React from 'react'
import { Row, Form, Container, Col, Button } from 'react-bootstrap'

function LandingPageBodyBottomRow() {
  return (
    <div>
      <Container fluid>
        <Row>
          <Col sm={6}>
            <div id="formDiv">
              <Form id="form">
                <br />
                <h3 id="landing-form-header">Got Questions? Get in touch:</h3>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" placeholder="Johnny Appleseed" />
                </Form.Group>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                  <Form.Label>Message</Form.Label>
                  <Form.Control placeholder="Message" as="textarea" rows="3" />
                </Form.Group>
                <Form.Group controlId="formBasicCheckbox"></Form.Group>
                <Button id="landing-form-button" variant="primary" type="submit">
                  Submit
                </Button>
                <br />
              </Form>
            </div>
          </Col>
          <Col sm={6} className="bio">
            <h2>About PadLock</h2>
            <h6>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus, ante nec ultrices viverra,
              nunc turpis tempor dolor, quis fringilla nisl enim a augue. Proin in ante nisl. Aenean dignissim justo
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus, ante nec ultrices viverra,
              nunc turpis tempor dolor, quis fringilla nisl enim a augue. Proin in ante nisl. Aenean dignissim justo
              <br />
              <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus, ante nec ultrices viverra,
              nunc turpis tempor dolor, quis fringilla nisl enim a augue. Proin in ante nisl. Aenean dignissim justo
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus, ante nec ultrices viverra,
              nunc turpis tempor dolor, quis fringilla nisl enim a augue. Proin in ante nisl. Aenean dignissim justo
              <br />
              <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus, ante nec ultrices viverra,
              nunc turpis tempor dolor, quis fringilla nisl enim a augue. Proin in ante nisl. Aenean dignissim justo
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus, ante nec ultrices viverra,
              nunc turpis tempor dolor, quis fringilla nisl enim a augue. Proin in ante nisl. Aenean dignissim justo
              <br />
              <br />
            </h6>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default LandingPageBodyBottomRow
