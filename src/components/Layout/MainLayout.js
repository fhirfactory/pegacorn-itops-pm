import { Content, Footer, Header, Sidebar } from 'components/Layout';
import PageSpinner from 'components/PageSpinner';
import React from 'react';
import NotificationSystem from 'react-notification-system';
import { NOTIFICATION_SYSTEM_STYLE } from 'utils/constants';
import DashboardPage from '../../pages/DashboardPage';

let daat = []

let treeDataNavMenu = [];

let processingPlants;
let workshops;
let wups;
let endpoints;

class MainLayout extends React.Component {
  state = {
    data: [],
    menuData: [],
    dashboardData: []
  };

  static isSidebarOpen() {
    return document
      .querySelector('.cr-sidebar')
      .classList.contains('cr-sidebar--open');
  }

  componentWillReceiveProps({ breakpoint }) {
    if (breakpoint !== this.props.breakpoint) {
      this.checkBreakpoint(breakpoint);
    }
  }

  static getDerivedStateFromProps(props, state) { 
    console.log("testing");
    return {menuData: state.menuData}
  }

  componentDidMount() {
    this.checkBreakpoint(this.props.breakpoint);

    this.eventSource = new EventSource("http://localhost:8080/aether-hestia-audit-im-1.0.0-SNAPSHOT/rest/itops/subscribe");

    this.eventSource.onmessage = e => {
      console.log("e.data onmessage: " + e.data);
    };

    this.eventSource.addEventListener("itops", (e) => {
      console.log("e.data onitops: " + e.data);
      daat = JSON.parse("[" + e.data + "]");

      if (daat.length > 0) {  
        processingPlants = this.collectProcessingPlants(daat);
        workshops = this.collectWorkshops(processingPlants);
        wups = this.collectWups(workshops);
        endpoints = this.collectEndpoints(wups);
  
        treeDataNavMenu = this.createNavigationMenu();
  
        console.log('treeDataNavMenu size is: ' + treeDataNavMenu.length);
  
        this.setState(Object.assign({}, { data: daat, menuData: treeDataNavMenu, dashboardData: daat }));
      }
    });

    this.eventSource.onerror = e => {
      console.log("stop updates, crash...")
      this.stopUpdates();
    }
  }

  collectProcessingPlants = data => {
    return data[0].reduce((acc, curr) => {
      return acc.set(curr['nodeId'], curr);
    }, new Map());
  }

  collectWorkshops = processingPlant => {
    const workshops = new Map();
    processingPlant.forEach((value, key) => {
      return value['workshops'].reduce((acc, curr) => {
        return acc.set(key + '::' + curr['nodeId'], curr);
      }, workshops);
    });
    return workshops;
  }

  collectWups = workshops => {
    const wups = new Map();
    workshops.forEach((value, key) => {
      return value['wups'].reduce((acc, curr) => {
        return acc.set(key + '::' + curr['nodeId'], curr);
      }, wups);
    });
    return wups;
  }

  collectEndpoints = wups => {
    const endpoints = new Map();
    wups.forEach((value, key) => {
      return value['endpoints'].reduce((acc, curr) => {
        return acc.set(key + '::' + curr['nodeId'], curr);
      }, endpoints);
    });
    return endpoints;
  }

  createNavigationMenu = () => {
    const menus = [];
    processingPlants.forEach((value, key) => {
      menus.push({ label: key, id: key, parentId: null, items: null });
    });
    workshops.forEach((value, key) => {
      const parent = key.substring(0, key.lastIndexOf('::'));
      menus.push({ label: key, id: key, parentId: parent, items: null });
    });
    wups.forEach((value, key) => {
      const parent = key.substring(0, key.lastIndexOf('::'));
      const items = [];
      value["endpoints"].forEach(endpoint => {
        items.push({ label: key, id: key + '::' + endpoint['nodeId'], parentId: parent })
      });
      menus.push({ label: key, id: key, parentId: parent, items: items });
    });
    return menus;
  }

  // close sidebar when
  handleContentClick = event => {
    // close sidebar if sidebar is open and screen size is less than `md`
    if (
      MainLayout.isSidebarOpen() &&
      (this.props.breakpoint === 'xs' ||
        this.props.breakpoint === 'sm' ||
        this.props.breakpoint === 'md')
    ) {
      this.openSidebar('close');
    }
  };

  handleMenuItemClick = navigationMenuId => {
    let selected = null;
    if (processingPlants.has(navigationMenuId)) {
      selected = processingPlants.get(navigationMenuId);
    } else if (workshops.has(navigationMenuId)) {
      selected = workshops.get(navigationMenuId);
    } else if (wups.has(navigationMenuId)) {
      selected = wups.get(navigationMenuId);
    } else {
      selected = endpoints.get(navigationMenuId);
    }

    this.setState({dashboardData: selected});
  }

  checkBreakpoint(breakpoint) {
    switch (breakpoint) {
      case 'xs':
      case 'sm':
      case 'md':
        return this.openSidebar('close');

      case 'lg':
      case 'xl':
      default:
        return this.openSidebar('open');
    }
  }

  openSidebar(openOrClose) {
    if (openOrClose === 'open') {
      return document
        .querySelector('.cr-sidebar')
        .classList.add('cr-sidebar--open');
    }
    document.querySelector('.cr-sidebar').classList.remove('cr-sidebar--open');
  }

  render() {
    const { children } = this.props;
    return (
      <main className="cr-app bg-light">
        <React.Suspense fallback={<PageSpinner />}>
          <Sidebar data={this.state.menuData} menuClickHandler={this.handleMenuItemClick} />
          <Content fluid onClick={this.handleContentClick}>
            <Header />
            <DashboardPage data={this.state.dashboardData} />
            {children}
            <Footer />
          </Content>

          <NotificationSystem
            dismissible={false}
            ref={notificationSystem =>
              (this.notificationSystem = notificationSystem)
            }
            style={NOTIFICATION_SYSTEM_STYLE}
          />
        </React.Suspense>
      </main>
    );
  }
}

export default MainLayout;
