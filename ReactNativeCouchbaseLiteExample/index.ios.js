/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var ReactCBLite = require('react-native').NativeModules.ReactCBLite;
ReactCBLite.init(5984, 'admin', 'password');

var ReactNativeCouchbaseLiteExample = React.createClass({
  
  componentDidMount: function() {
    fetch('http://admin:password@localhost:5984/_all_dbs', {credentials: true})
      .then((res) => {
        console.log(res);
      }).catch((err) => {throw err;});
  },
  
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('ReactNativeCouchbaseLiteExample', () => ReactNativeCouchbaseLiteExample);
