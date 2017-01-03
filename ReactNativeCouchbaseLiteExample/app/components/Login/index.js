'use strict'

import React, {Component} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableHighlight} from 'react-native';
import DataManager from './../../DataManager';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: 'user2',
      password: 'pass'
    };
  }
  _onLoginButtonPressed() {
    DataManager.login(this.state.username, this.state.password);
  }
  render () {
    return (
      <View style={styles.background}>
        <View style={styles.dialog}>
          <Text style={styles.header}>
            Log In
          </Text>
          <Text style={styles.subheader}>
            Todo
          </Text>
          <TextInput style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Username"
            onChangeText={(username) => this.setState({username})}
            value={this.state.username} />
          <TextInput style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Password"
            onChangeText={(password) => this.setState({password})}
            value={this.state.password} />
          <TouchableHighlight
            style={styles.button}
            onPress={() => this._onLoginButtonPressed()}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#3D414C',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  dialog: {
    width: 280,
    height: 280,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  header: {
    marginTop: 25,
    fontSize: 20,
  },
  subheader: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 44,
    width: 250,
    borderColor: '#96A6B4',
    borderWidth: 1,
    borderRadius: 3,
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
  },
  button: {
    marginTop: 15,
    backgroundColor: '#ED2226',
    width: 250,
    height: 44,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  }
});
