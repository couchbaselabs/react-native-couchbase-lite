var React = require('react-native');
var {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput
} = React;

let nextTodoId = 0;
var TodoApp = React.createClass({
  componentWillMount() {
    console.log('store', this.props)
  },
  componentDidMount() {
    store.subscribe(this.render);
  },
  render() {
    return (
      <View style={styles.container}>
        <TextInput style={{height: 40, borderColor: 'gray', borderWidth: 1}} onChangeText={text => {
          this.text = text;
        }}/>
        <TouchableOpacity
          onPress={() => {
          console.log(this.text);
            store.dispatch({
              type: 'ADD_TODO',
              text: this.text,
              id: nextTodoId++
            });
            console.log(store.getState().todos)
          }}>
          <Text>Add todo</Text>
        </TouchableOpacity>
        {this.props.todos.map(todo => {
          <View key={todo.id}>
            <Text>{todo.text}</Text>
          </View>
        })}
      </View>
    )
  }
});

var styles = StyleSheet.create({
  container: {
    marginTop: 25
  }
});

module.exports = TodoApp;