import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import TouchableWithoutFeedback from 'TouchableWithoutFeedback';
import Prompt from 'react-native-prompt';

export default class AddButton extends Component {
  constructor() {
    super();

    this.state = {
      promptVisible: false,
    }
  }
  onSubmit(text) {
    this.setState({promptVisible: false});
    this.props.onCreate(text);
  }
  render() {
    return (
      <View>
        <Prompt title="New List"
          visible={this.state.promptVisible}
          onSubmit={(text) => {this.onSubmit.call(this, text)}}
          onCancel={() => this.setState({promptVisible: false})}
          textInputProps={{autoCapitalize: 'none', autoCorrect: false}} />
        <TouchableWithoutFeedback onPress={() => this.setState({promptVisible: true})}>
          <View style={[styles.button, this.props.style]}>
            <Icon style={styles.icon} name="plus" size={15} color="white" />
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#D63B30',
    width: 60,
    height: 60,
    borderRadius: 70/2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    alignItems: 'center',
  },
});
