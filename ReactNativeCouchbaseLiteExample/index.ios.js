import React, { Component } from 'react-native';

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  Platform,
  Navigator,
  TextInput,
  TouchableOpacity
} = React;
import Home from './src/main'
const { connect } = require('react-redux');

var { FilterLink } = require('./src/components/FilterLink');

const Footer = () => (
  <View>
    <Text>
      Show:
    </Text>
    <FilterLink filter='SHOW_ALL'>
      All
    </FilterLink>
    <FilterLink filter='SHOW_ACTIVE'>
      Active
    </FilterLink>
    <FilterLink filter='SHOW_COMPLETED'>
      Completed
    </FilterLink>
  </View>
);

const { addTodo, toggleTodo, addList, addListDesignDocument, getLists } = require('./src/actions');

// Using let to re-assign in the connect call
// Passing dispatch as a prop
let AddTodo = ({ dispatch }) => {
  let text;
  
  // addListDesignDocument();
  // addList('James', 'james');
  // getLists();
  
  return (
    <View>
      <TextInput style={{height: 40, borderColor: 'gray', borderWidth: 1}} onChangeText={value => {
          text = value;
        }}/>
      <TouchableOpacity
        onPress={() => {
          dispatch(addTodo(text));
      }}>
        <Text>Add todo</Text>
      </TouchableOpacity>
    </View>
  );
};
AddTodo = connect(
  state => {
    return {}
  },
  dispatch => {
    return { dispatch }
  }
)(AddTodo);

import VisibleTodoList from './src/components/VisibleTodoList';

const TodoApp = () => (
  <View style={styles.container}>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </View>
);

var styles = StyleSheet.create({
  container: {
    marginTop: 25
  }
});

const { compose, applyMiddleware } = require('redux');
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { loadState } from './src/localStorage';

// const couchbaseCreateStore = compose(
//   applyMiddleware(thunk, promise)
// )(createStore);

import configureStore from './src/configureStore';
const store = configureStore();

class Parent extends Component {
  constructor() {
    super();
    this.state = {data: null};
  }
  componentDidMount() {
    require('./src/database').initialize(function(client) {
      this.setState({data: client})
    }.bind(this));
  }
  render() {
    if (this.state.data) {
      return <Home></Home>
    }
    return <Text>Loading...</Text>
  }
}

import { Provider } from 'react-redux';

var Main = React.createClass({
  render: function () {
    return (
      <Provider store={store}>
        <TodoApp />
      </Provider>
    );
  }
});

AppRegistry.registerComponent('ReactNativeCouchbaseLiteExample', () => Parent);