import React from 'react';
import { hot } from 'react-hot-loader';

import MainUI from './MainUI';
import { useFirebase } from './firebase';
import { StorageContext } from './storage';

function encode(bytes) {
  const chars = ['0', 'O', 'l', 'I'];
  let result = '';
  for (const b of bytes) {
    for (let i = 0; i < 8; i += 2) {
      result += chars[(b >> i) & 3]; /* eslint-disable-line */
    }
  }
  return result;
}

class App extends React.Component {
  state = { locationHash: window.location.hash };

  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange);
    this.handleHashChange();
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  handleHashChange = () => {
    if (useFirebase && window.location.hash.length === 0) {
      const randBits = new Uint8Array(8);
      window.crypto.getRandomValues(randBits);
      window.location.hash = `#${encode(randBits)}`;
    }
    if (window.location.hash !== this.state.locationHash) {
      this.setState({ locationHash: window.location.hash });
    }
  }

  render() {
    const storageContext = { useFirebase };
    if (useFirebase && this.state.locationHash) {
      const gameUuid = this.state.locationHash.slice(1);
      storageContext.firebaseRoot = `games/${gameUuid}/`;
    }
    return (
      <React.StrictMode>
        <StorageContext.Provider value={storageContext}>
          <MainUI />
        </StorageContext.Provider>
      </React.StrictMode>
    );
  }
}

export default hot(module)(App);
