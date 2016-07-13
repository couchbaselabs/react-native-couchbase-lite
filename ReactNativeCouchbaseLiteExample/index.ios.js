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

var Swagger = require('swagger-client');

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
      }),
      sequence: '',
      filteredMovies: ''
    }
  },
  componentDidMount() {
    ReactCBLite.init((url) => {
      console.log(url);
      fetch('http://docs.couchbasemobile.com/couchbase-lite/lite.json')
        .then(res => res.json())
        .then(res => {
          console.log(res);
          var spec = res;
          spec.host = url.split('/')[2];

          new Swagger({
            spec: spec,
            usePromise: true
          })
            .then(client => {
              client.server.allDbs({})
                .then(res => {
                  console.log(res.data);
                })
                .catch(err => {throw err;});

              client.server.post_replicate(
                {
                  body: {
                    create_target: true,
                    source: {
                      url: 'cities'
                    },
                    target: {
                      url: 'http://localhost:59840/cities'
                    },
                    filter: 'app/bycity',
                    continuous: true
                  }
                })
                .then(res => {
                  console.log(res);
                });
            });
        });
    });     
  },
  render() {
    return (
      <View>
        <Text style={styles.seqTextLabel}>
          The database sequence: {this.state.sequence}
        </Text>
        <Text>
          Movies published in 2004: {this.state.filteredMovies}
        </Text>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderMovie}
          style={styles.listView}/>
      </View>
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
    backgroundColor: '#F5FCFF',
  },
  seqTextLabel: {
    textAlign: 'center',
    margin: 5
  }
});

AppRegistry.registerComponent('ReactNativeCouchbaseLiteExample', () => ReactNativeCouchbaseLiteExample);