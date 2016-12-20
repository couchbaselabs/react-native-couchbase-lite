'use strict';

import React, {Component} from "react";
import {StyleSheet, Text, View, Image} from "react-native";

export default class Task extends Component {
  render() {
    const row = this.props.data;
    return (
      <View style={styles.container}>
        <Image
          source={{uri: row.url}}
          style={styles.thumbnail}/>
        <View style={styles.rightContainer}>
          <Text style={styles.title}>{row.key}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
});
