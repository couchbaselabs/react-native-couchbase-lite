import React, {Component} from 'react';
import {View, Text, StyleSheet, ListView, TouchableWithoutFeedback} from 'react-native';
import Prompt from 'react-native-prompt';
import Swipeout from 'rc-swipeout/lib/Swipeout';
import AddButton from './AddButton';

export default class CommonList extends Component {
  constructor() {
    super();

    this.state = {
      promptVisible: false,
    };
  }
  render() {
    return (
      <View style={styles.container}>
        <Prompt title={this.props.title}
          visible={this.state.promptVisible}
          onSubmit={(text) => {
            this.props.onSubmit(text, this.state.selectedRow.doc)
            this.setState({promptVisible: false})
          }}
          onCancel={() => this.setState({promptVisible: false})}
          textInputProps={{autoCapitalize: 'none', autoCorrect: false}} />
        <ListView
          style={styles.listView}
          dataSource={this.props.dataSource}
          renderRow={(data, sectionID, rowID, highlightRow) =>
            <Swipeout
              style={{flex: 1}}
              autoClose={true}
              right={[
                {
                  text: 'update',
                  onPress: () => this.setState({promptVisible: true, selectedRow: data}),
                  style: { backgroundColor: 'blue', color: 'white' }
                },
                {
                  text: 'delete',
                  onPress: () => this.props.onDelete(data),
                  style: { backgroundColor: 'red', color: 'white' }
                }
              ]}>
              <TouchableWithoutFeedback key={rowID} onPress={() => this.props.onRowPressed(data)}>
                {this.props.renderRow(data, sectionID, rowID, highlightRow)}
              </TouchableWithoutFeedback>
            </Swipeout>
          }
          enableEmptySections/>
          <AddButton style={styles.button} onCreate={(text) => this.props.onCreate(text)} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listView: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    right: 15,
    bottom: 60,
  },
});
