import React from 'react';
import { MdBubbleChart, MdImportantDevices, MdInsertChart, MdShowChart, MdUpdate } from 'react-icons/md';
import ReactJson from 'react-json-view';
import NotificationSystem from 'react-notification-system';
import { Card, CardBody, CardHeader, Col, ListGroup, ListGroupItem, Row } from 'reactstrap';
import { getColor } from 'utils/colors';
import { NOTIFICATION_SYSTEM_STYLE } from 'utils/constants';
import { AppContext } from '../components/Layout/Sidebar';

const today = new Date();
const lastWeek = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() - 7,
);

class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    // this.handleClick = this.handleClick.bind(this);
    this.state = {
      data: [],
      menuData: [],
      refreshedData: []
    };
    console.log("constructor...");
  }

  componentDidMount() {
    // this is needed, because InfiniteCalendar forces window scroll
    window.scrollTo(0, 0);
  }

  static getDerivedStateFromProps(props, state) {
    return { refreshedData: props.data }
  }

  clickSelect(data) {
    console.log("Select clicked from: " + Object.keys(data));
    console.log("Select clicked from name: " + data.name);
    console.log("Select clicked from value: " + data.value);
    console.log("Select clicked from type: " + data.type);
    console.log("Select clicked from namespace: " + data.namespace);

    this.notificationSystem.addNotification({
      title: <MdImportantDevices />,
      message: '<b>Selected node:</br>name: ' + data.value + '</br>namespace: ' + data.namespace,
      level: 'info',
      autoDismiss: 5,
      dismissible: 'click'
    });
  }

  JsonView = () => {
    return (
      <AppContext.Consumer>
        {({ data }) => <ReactJson
          src={this.state.refreshedData}
          name={false}
          theme={"codeschool"}
          collapseStringsAfterLength={90}
          indentWidth={2}
          style={{ fontSize: "small" }}
          onSelect={(select) => this.clickSelect(select)} />}
      </AppContext.Consumer>
    );
  }

  fetchOnDemandMetrics = (eventName) => {
    this.notificationSystem.addNotification({
      title: <MdImportantDevices />,
      message: eventName + ' not connected to service yet.',
      level: 'warning',
      autoDismiss: 5,
      dismissible: 'click'
    });
  }

  AuditView = () => {
    let testString = '{\n  \"resourceType\": \"Communication\",\n  \"identifier\": [ {\n    \"type\": {\n      \"coding\": [ {\n        \"system\": \"http://ontology.fhirfactory.net/fhir/code-systems/identifier-type\",\n        \"code\": \"idcode:communication.HL7v2-container\"\n      } ],\n      \"text\": \"idcode:communication.HL7v2-container --> \"\n    },\n    \"system\": \"AETHER/local/fhir/code-systems/identifiers\",\n    \"value\": \"1501\",\n    \"period\": {\n      \"start\": \"2021-08-01T22:31:05+00:00\"\n    },\n    \"assigner\": {\n      \"type\": \"Oranization\",\n      \"identifier\": {\n        \"use\": \"secondary\",\n        \"type\": {\n          \"coding\": [ {\n            \"system\": \"http://terminology.hl7.org/ValueSet/v2-0203\",\n            \"code\": \"RI\"\n          } ],\n          \"text\": \"Generalized Resource Identifier\"\n        },\n        \"system\": \"FHIRFactory\",\n        \"value\": \"TBA\",\n        \"period\": {\n          \"start\": \"2021-08-30T02:23:36+00:00\"\n        },\n        \"assigner\": {\n          \"reference\": \"Organization/FHIRFactory\"\n        }\n      },\n      \"display\": \"Australian Capital Territory Health Services\"\n    }\n  } ],\n  \"status\": \"completed\",\n  \"priority\": \"routine\",\n  \"payload\": [ {\n    \"extension\": [ {\n      \"url\": \"http://www.fhirfactory.net/pegacorn/FHIR/R4/Communication/communication_payload_type_extension\",\n      \"valueString\": \"{\\\"dataParcelDefiner\\\":\\\"HL7\\\",\\\"dataParcelCategory\\\":\\\"Message\\\",\\\"dataParcelSubCategory\\\":\\\"ADT\\\",\\\"dataParcelResource\\\":\\\"A04\\\",\\\"dataParcelSegment\\\":null,\\\"dataParcelAttribute\\\":null,\\\"dataParcelDiscriminatorType\\\":null,\\\"dataParcelDiscriminatorValue\\\":null,\\\"version\\\":\\\"2.4\\\"}\"\n    } ],\n    \"contentString\": \"MSH|^~\\\\&|||||20210801153105.221-0700||ADT^A04^ADT_A01|1501|T|2.4\\r\"\n  } ]\n}';
    testString = JSON.parse(testString);

    return (
      <div style={{ marginTop: "10px" }}>
        <ReactJson
          src={testString}
          name={false}
          theme={"codeschool"}
          collapseStringsAfterLength={60}
          indentWidth={2}
          style={{ fontSize: "small" }}
          onSelect={(select) => this.clickSelect(select)} />
      </div>
    );
  }

  render() {
    const primaryColor = getColor('primary');
    const secondaryColor = getColor('secondary');

    return (
      <div>
        <Row>
          <Col lg="7" md="12" sm="12" xs="12">
            <Card>
              <CardHeader>
                Latest Object Graph{' '}
                <small className="text-muted">refresh time: dd/mm/yy hh:mm:ss</small>
              </CardHeader>
              <CardBody>
                <this.JsonView />
              </CardBody>
            </Card>
          </Col>

          <Col lg="5" md="12" sm="12" xs="12">
            <Card>
              <CardHeader>SELECTED COMPONENT{' '}
                <small className="text-muted">On-Demand Metrics</small>
              </CardHeader>
              <ListGroup flush>
                <ListGroupItem>
                  <MdInsertChart size={25} color={primaryColor} /> View Metrics{' '}
                  <MdUpdate size="1.5em" style={{ cursor: "pointer" }} onClick={() => this.fetchOnDemandMetrics("View Metrics")}></MdUpdate>
                </ListGroupItem>
                <ListGroupItem>
                  <MdBubbleChart size={25} color={primaryColor} /> View Subscription Map{' '}
                  <MdUpdate size="1.5em" style={{ cursor: "pointer" }} onClick={() => this.fetchOnDemandMetrics("View Subscrition Map")}></MdUpdate>
                </ListGroupItem>
                <ListGroupItem>
                  <MdShowChart size={25} color={primaryColor} /> View Audit Trail{' '}
                  <MdUpdate size="1.5em" style={{ cursor: "pointer" }} onClick={() => this.fetchOnDemandMetrics("View Audit Trail")}></MdUpdate>
                  <br></br>
                  <this.AuditView></this.AuditView>
                </ListGroupItem>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        <NotificationSystem
          dismissible={false}
          allowHTML={true}
          ref={notificationSystem =>
            (this.notificationSystem = notificationSystem)
          }
          style={NOTIFICATION_SYSTEM_STYLE}
        />
      </div>
    );
  }
}
export default DashboardPage;
