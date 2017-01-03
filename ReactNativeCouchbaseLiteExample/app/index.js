'use strict';

import React, {Component} from "react";
import {StyleSheet, Text, View, Image, ListView, TabBarIOS} from "react-native";
import Couchbase from "react-native-couchbase-lite";
import {Router, Scene} from 'react-native-router-flux';
import Login from './components/Login/index';
import Lists from './components/Lists/index';
import ListDetail from './components/ListDetail/index';
import DataManager from './DataManager';

export default class Root extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    Couchbase.initRESTClient(manager => {
      DataManager.init(manager);
      this.setState({manager: manager});
    });
  }

  render() {
    if (!this.state.manager) {
      return <View />
    } else {
      return (
        <View style={styles.container}>
          <App manager={this.state.manager}/>
        </View>
      )
    }
  }
}

class App extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (LOGIN_FLOW_ENABLED) {

    } else {
      DataManager.startSession("todos", null, null);
    }
  }

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene
            hideNavBar={true}
            key="login"
            component={Login}
            title="Login" initial />
          <Scene
            hideNavBar={false}
            key="lists"
            component={Lists}
            title="Lists" />
          <Scene
            key="listdetail"
            component={ListDetail}
            title="List Detail"/>
        </Scene>
      </Router>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
