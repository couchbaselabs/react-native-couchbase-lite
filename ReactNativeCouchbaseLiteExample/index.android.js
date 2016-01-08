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
  Image,
  ListView,
  } = React;

var ReactCBLite = require('react-native').NativeModules.ReactCBLite;
ReactCBLite.init(5984, 'admin', 'password');

var { manager } = require('react-native-couchbase-lite');

var ReactNativeCouchbaseLiteExample = React.createClass({
  render: function () {
    return (
      <Home></Home>
    );
  }
});

var Home = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    }
  },
  componentDidMount() {
    var database = new manager('http://admin:password@localhost:5984/', 'myapp');

    database.createDatabase()
      .then((res) => {
        database.replicate('http://localhost:4984/moviesapp', 'myapp')
      })
      .then((res) => {
        return database.getAllDocuments()
      })
      .then((res) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(res.rows)
        });
        console.log(res.rows)
      })
      .catch((ex) => {
        console.log(ex)
      })
  },
  render() {
    return (
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderMovie}
          style={styles.listView}/>
    )
  },
  renderMovie(movie) {
    var movie = movie.doc;
    return (
      <View style={styles.container}>
        <Image
          source={{uri: movie.posters.thumbnail}}
          style={styles.thumbnail}/>
        <View style={styles.rightContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.year}</Text>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
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
  listView: {
    paddingTop: 20,
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('ReactNativeCouchbaseLiteExample', () => ReactNativeCouchbaseLiteExample);